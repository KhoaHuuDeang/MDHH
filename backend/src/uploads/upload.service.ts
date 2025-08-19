import { Injectable, BadRequestException, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { S3Service } from 'src/Aws/aws.service';
import { v4 as uuidv4 } from 'uuid';
import {
  RequestPreSignedUrlsDto,
  PreSignedUrlResponseDto,
  CreateResourceWithUploadsDto,
  ResourceResponseDto,
  CompleteUploadDto,
  FileMetadataDto,
} from './uploads.dto';

@Injectable()
export class UploadsService {
  private readonly logger = new Logger(UploadsService.name);

  // Performance and reliability constants
  private readonly MAX_RETRIES = 3;
  private readonly RETRY_DELAY_BASE = 1000; // 1 second
  private readonly TRANSACTION_TIMEOUT = 30000; // 30 seconds
  private readonly RATE_LIMIT_REQUESTS = 50; // Max requests per minute per user
  private readonly RATE_LIMIT_WINDOW = 60000; // 1 minute in milliseconds

  constructor(
    private prisma: PrismaService,
    private s3Service: S3Service,
  ) { }

  /**
   * Exponential backoff delay calculation
   */
  private calculateRetryDelay(attempt: number): number {
    return this.RETRY_DELAY_BASE * Math.pow(2, attempt - 1);
  }

  /**
   * Enhanced input validation with detailed error messages
   */
  private validateUploadRequest(files: any[], userId: string): void {
    if (!files || !Array.isArray(files) || files.length === 0) {
      throw new BadRequestException('No files provided for upload');
    }

    if (files.length > 10) { // Max 10 files per upload
      throw new BadRequestException(`Too many files: ${files.length}. Maximum allowed: 10`);
    }

    if (!userId || typeof userId !== 'string') {
      throw new BadRequestException('Valid user ID is required');
    }

    // Validate each file metadata
    files.forEach((file, index) => {
      if (!file.originalFilename || typeof file.originalFilename !== 'string') {
        throw new BadRequestException(`File ${index + 1}: Invalid filename`);
      }

      if (!file.mimetype || typeof file.mimetype !== 'string') {
        throw new BadRequestException(`File ${index + 1}: Invalid MIME type`);
      }

      if (!file.fileSize || typeof file.fileSize !== 'number' || file.fileSize <= 0) {
        throw new BadRequestException(`File ${index + 1}: Invalid file size`);
      }
    });
  }



  /**
   * Database health check and connection verification
   */
  private async verifyDatabaseConnection(): Promise<void> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
    } catch (error) {
      this.logger.error('Database connection failed:', error);
      throw new BadRequestException('Service temporarily unavailable. Please try again later.');
    }
  }

  /**
   * Health check endpoint for monitoring
   */
  async healthCheck(): Promise<{ status: string; timestamp: Date; details: any }> {
    const startTime = Date.now();
    const details = {
      database: 'unknown',
      s3: 'unknown',
      responseTime: 0,
    };

    try {
      // Check database connectivity
      await this.prisma.$queryRaw`SELECT 1`;
      details.database = 'healthy';
    } catch (error) {
      details.database = 'unhealthy';
      this.logger.error('Database health check failed:', error);
    }

    // S3 health check would go here if needed
    details.s3 = 'not_checked';

    details.responseTime = Date.now() - startTime;

    return {
      status: details.database === 'healthy' ? 'healthy' : 'degraded',
      timestamp: new Date(),
      details,
    };
  }

  /**
   * Step 1: Request pre-signed URLs (no DB writes)
   * Purpose: Validate files, return S3 pre-signed URLs
   * Database: NO writes - only validation
   * Optimized with retry logic and enhanced error handling
   */
  async requestPreSignedUrls(
    requestDto: RequestPreSignedUrlsDto,
    userId: string
  ): Promise<PreSignedUrlResponseDto> {
    // Comprehensive input validation
    this.validateUploadRequest(requestDto.files, userId);

    // Database health check - bằng 1 truy vấn nhỏ tí tí 
    await this.verifyDatabaseConnection();

    // Validate user exists (security check) - Tìm user với id được chỉ định, chỉ chọn mỗi id 
    const userExists = await this.prisma.users.findUnique({
      where: { id: userId },
      select: { id: true }
    });

    if (!userExists) {
      throw new BadRequestException('Invalid user ID');
    }

    // Rate limiting check - prevent abuse
    // Check và đếm trong bản upload lần tải xuống gần nhất 
    const recentRequests = await this.prisma.uploads.count({
      where: {
        user_id: userId,
        created_at: {
          gte: new Date(Date.now() - this.RATE_LIMIT_WINDOW) // khoảng thời gian vd : 13h, -> 13-1 = 12
        }
      }
    });
    // nếu user có lần request nhiều hơn quy định theo quy ước RATE_LIMIT_REQUESTS, thì ngừng user lại 
    if (recentRequests > this.RATE_LIMIT_REQUESTS) {
      throw new BadRequestException('Rate limit exceeded. Please wait before making more requests.');
    }

    // Retry logic for S3 operations
    let lastError: Error | undefined;

    for (let attempt = 1; attempt <= this.MAX_RETRIES; attempt++) {
      try {
        this.logger.log(`Requesting pre-signed URLs for ${requestDto.files.length} files for user ${userId} (attempt ${attempt})`);

        // Generate pre-signed URLs through S3 service with enhanced validation
        const preSignedData = await this.s3Service.generateMultiplePreSignedUrls(
          requestDto.files,
          userId
        );

        // Return temporary session data (no DB commit)
        return {
          sessionId: uuidv4(), // temporary frontend tracking ID
          preSignedData,
          expiresIn: 3600, // 1 hour expiry
        };
      } catch (error) {             // error
        lastError = error as Error; // => Ép kiểu cho error
        this.logger.warn(`Pre-signed URL generation attempt ${attempt} failed:`, error);

        // Don't retry on validation errors
        if (error instanceof BadRequestException) { // Kiểu lỗi là BadRequestException => cook
          throw error;
        }

        // Wait before retrying
        if (attempt < this.MAX_RETRIES) {
          // so sánh lần thử hiện tại(current) và lần thử tối đa(3)
          // => Đợi x ms, rồi thử lại
          await new Promise(resolve => setTimeout(resolve, this.calculateRetryDelay(attempt)));
        }
      }
    }

    this.logger.error('All pre-signed URL generation attempts failed:', lastError);
    throw new BadRequestException('Failed to generate upload URLs after multiple attempts. Please try again later.');
  }

  /**
   * Step 2: Create Resource with Folder Association
   * Purpose: Create resource + folder + link them via folder_files junction table
   * Database: Transaction creating resources + folders + folder_files + uploads
   * Follows schema pattern: Resources M:N Folders via folder_files table
   */
  // Update method to handle nested folderManagement
  async createResourceWithUploads(
    createResourceDto: CreateResourceWithUploadsDto,
    userId: string 
  ): Promise<ResourceResponseDto> {
    console.log('BACKENDDDD', createResourceDto)
    this.logger.log(`Creating resource with folder association and ${createResourceDto.files.length} uploads`);

    try {
      return await this.prisma.$transaction(async (tx) => {
        // 1. Create resource record
        const resource = await tx.resources.create({
          data: {
            title: createResourceDto.title,
            description: createResourceDto.description,
            visibility: createResourceDto.visibility || 'PUBLIC',
          },
        });

        this.logger.log(`Created resource with ID: ${resource.id}`);

        // Handle nested folderManagement structure
        let folderId = createResourceDto.folderManagement.selectedFolderId;

        if (!folderId && createResourceDto.folderManagement.newFolderData) {
          const newFolderData = createResourceDto.folderManagement.newFolderData;

          // Create new folder with classification level
          const folder = await tx.folders.create({
            data: {
              name: newFolderData.name,
              description: newFolderData.description || `Folder for ${createResourceDto.title}`,
              visibility: createResourceDto.visibility || 'PUBLIC',
              user_id: userId,
              classification_level_id: newFolderData.folderClassificationId,
            },
          });

          folderId = folder.id;
          this.logger.log(`Created new folder with ID: ${folder.id}`);

          //  Handle folder tags
          if (newFolderData.folderTagIds && newFolderData.folderTagIds.length > 0) {
            await tx.folder_tags.createMany({
              data: newFolderData.folderTagIds.map(tagId => ({
                folder_id: folder.id,
                tag_id: tagId
              })),
              skipDuplicates: true,
            });
            this.logger.log(`Linked folder to ${newFolderData.folderTagIds.length} tags`);
          }
        } else if (folderId) {
          // Verify folder ownership
          const existingFolder = await tx.folders.findFirst({
            where: {
              id: folderId,
              user_id: userId
            }
          });

          if (!existingFolder) {
            throw new BadRequestException('Folder not found or not owned by user');
          }
        }

        // Link resource to folder
        if (folderId) {
          await tx.folder_files.create({
            data: {
              folder_id: folderId,
              resource_id: resource.id,
            },
          });
          this.logger.log(`Linked resource ${resource.id} to folder ${folderId} via folder_files`);
        }


        const uploadData = createResourceDto.files.map((file) => ({
          //bao nhiêu file bấy nhiêu uploads diễn ra tương ứng 
          // Uploads fields
          user_id: userId,
          resource_id: resource.id,
          file_name: file.originalFilename,
          mime_type: file.mimetype,
          file_size: file.fileSize,
          s3_key: file.s3Key,
          status: 'COMPLETED' as const,
        }));

        await tx.uploads.createMany({
          data: uploadData,
          skipDuplicates: true,
        });

        const uploads = await tx.uploads.findMany({
          where: { resource_id: resource.id },
          orderBy: { created_at: 'asc' },
        });

        this.logger.log(`Created ${uploads.length} upload records with S3 keys`);

        return {
          resource: {
            id: resource.id,
            title: resource.title || '',
            description: resource.description || '',
            category: resource.category || '',
            visibility: resource.visibility as any,
            status: 'PENDING_APPROVAL',
            created_at: resource.created_at || new Date(),
          },
          uploads: uploads.map(upload => ({
            id: upload.id,
            user_id: upload.user_id || '',
            resource_id: upload.resource_id || '',
            file_name: upload.file_name || '',
            mime_type: upload.mime_type || '',
            file_size: upload.file_size || 0,
            s3_key: upload.s3_key || '',
            status: 'completed',
            created_at: upload.created_at || new Date(),
          })),
          folderId: folderId,
        };
      }, {
        timeout: this.TRANSACTION_TIMEOUT,
        maxWait: 5000,
      });
    } catch (error) {
      this.logger.error('Failed to create resource with uploads:', error);
      throw new BadRequestException('Failed to create resource with uploads');
    }
  }

  /**
   * Step 3: S3 Upload & Completion (optional verification)
   * Purpose: Verify S3 uploads, update status to COMPLETED
   * Optimized with retry logic and batch operations
   */
  async completeUpload(completeDto: CompleteUploadDto): Promise<void> {
    this.logger.log(`Completing upload for resource: ${completeDto.resourceId}`);

    try {
      await this.prisma.$transaction(async (tx) => {
        // 1. Verify resource exists
        const resource = await tx.resources.findUnique({
          where: { id: completeDto.resourceId },
          include: { uploads: true },
        });

        if (!resource) {
          throw new NotFoundException(`Resource with ID ${completeDto.resourceId} not found`);
        }

        // 2. Update upload records to mark as completed
        const updateResult = await tx.uploads.updateMany({
          where: {
            resource_id: completeDto.resourceId,
          },
          data: {
            uploaded_at: new Date(),
          },
        });

        this.logger.log(`Successfully completed upload for resource: ${completeDto.resourceId}`);
      }, {
        timeout: this.TRANSACTION_TIMEOUT,
        maxWait: 5000,
      });
    } catch (error) {
      this.logger.error('Failed to complete upload:', error);

      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new BadRequestException('Failed to complete upload. Please try again.');
    }
  }

  /**
   * Get user's uploads with pagination
   * Optimized with proper indexing and reduced data transfer
   */
  async getUserUploads(
    userId: string,
    page: number = 1,
    limit: number = 10,
    status?: string
  ) {
    const skip = (page - 1) * limit;

    const where = {
      user_id: userId,
    };

    try {
      const [uploads, total] = await Promise.all([
        this.prisma.uploads.findMany({
          where,
          include: {
            resources: {
              select: {
                id: true,
                title: true,
                description: true,
                visibility: true,
                created_at: true,
              },
            },
          },
          orderBy: { created_at: 'desc' },
          skip,
          take: limit,
        }),
        this.prisma.uploads.count({ where }),
      ]);

      return {
        uploads,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      this.logger.error(`Failed to get user uploads for user ${userId}:`, error);
      throw new BadRequestException('Failed to retrieve uploads');
    }
  }

  /**
   * Delete resource and cleanup (simplified without S3 cleanup)
   * Optimized with proper cascading and error handling
   */
  async deleteResource(resourceId: string, userId: string): Promise<void> {
    try {
      await this.prisma.$transaction(async (tx) => {
        // Find resource with uploads - verify ownership through uploads
        const resource = await tx.resources.findFirst({
          where: {
            id: resourceId,
            uploads: { some: { user_id: userId } },
          },
          include: { uploads: true },
        });

        if (!resource) {
          throw new NotFoundException('Resource not found or not owned by user');
        }

        // Delete database records (cascade will handle related records)
        await tx.uploads.deleteMany({
          where: { resource_id: resourceId },
        });

        await tx.resources.delete({
          where: { id: resourceId },
        });

        this.logger.log(`Deleted resource ${resourceId} and associated uploads`);
      }, {
        timeout: this.TRANSACTION_TIMEOUT,
        maxWait: 5000,
      });
    } catch (error) {
      this.logger.error(`Failed to delete resource ${resourceId}:`, error);

      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new BadRequestException('Failed to delete resource. Please try again.');
    }
  }

  /**
   * Generate download URL for a file (simplified version)
   * Note: This is a placeholder since S3 key is not currently stored
   */
  async generateDownloadUrl(uploadId: string, userId: string): Promise<string> {
    try {
      const upload = await this.prisma.uploads.findFirst({
        where: {
          id: uploadId,
          user_id: userId,
        },
      });

      if (!upload) {
        throw new NotFoundException('Upload not found or not accessible');
      }

      // For now, return a placeholder since S3 key is not available
      // In a full implementation, you would store the S3 key and use it here
      throw new BadRequestException('Download functionality not yet implemented - S3 key not stored');
    } catch (error) {
      this.logger.error(`Failed to generate download URL for upload ${uploadId}:`, error);

      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new BadRequestException('Failed to generate download URL');
    }
  }

  /**
   * Retry failed upload (with exponential backoff)
   * Optimized for reliability and user experience
   */
  async retryFailedUpload(uploadId: string, userId: string): Promise<PreSignedUrlResponseDto> {
    try {
      const upload = await this.prisma.uploads.findFirst({
        where: {
          id: uploadId,
          user_id: userId,
        },
        include: {
          resources: true,
        },
      });

      if (!upload) {
        throw new NotFoundException('Upload not found');
      }

      const retryRequest: RequestPreSignedUrlsDto = {
        files: [{
          originalFilename: upload.file_name || 'unknown',
          mimetype: upload.mime_type || 'application/octet-stream',
          fileSize: upload.file_size || 0,
        }],
      };

      // Generate new pre-signed URLs for retry
      return await this.requestPreSignedUrls(retryRequest, userId);
    } catch (error) {
      this.logger.error(`Failed to retry upload ${uploadId}:`, error);

      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new BadRequestException('Failed to retry upload. Please try again.');
    }
  }

  async deleteS3File(s3Key: string, userId: string): Promise<void> {
    // Security: Verify user owns this file
    let uid = s3Key.split('/')[1];
    if (userId !== uid) {
      throw new BadRequestException('Unauthorized: Cannot delete file belonging to another user');
    }
    try {
      await this.s3Service.deleteFile(s3Key);
      this.logger.log(`S3 file deleted: ${s3Key} by user ${userId}`);
    } catch (error) {
      this.logger.error(`Failed to delete S3 file ${s3Key}:`, error);
      throw new BadRequestException('Failed to delete file from storage');
    }
  }

  async deleteMultipleS3Files(s3Keys: string[], userId: string): Promise<void> {
    // Security: Verify all files belong to user
    const unauthorizedKeys = s3Keys.filter(key => key.split('/')[1] !== userId);
    if (unauthorizedKeys.length > 0) {
      throw new BadRequestException('Unauthorized: Cannot delete files belonging to another user');
    }

    try {
      await this.s3Service.deleteMultipleFiles(s3Keys);
      this.logger.log(`${s3Keys.length} S3 files deleted by user ${userId}`);
    } catch (error) {
      this.logger.error(`Failed to delete multiple S3 files:`, error);
      throw new BadRequestException('Failed to delete files from storage');
    }
  }

}