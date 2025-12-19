import {
  Injectable,
  BadRequestException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
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
import {
  UserResourcesResponseDto,
  ResourceVisibility,
} from './dto/user-resources.dto';
import { Prisma } from '@prisma/client';

// Interface for raw SQL query results
interface ResourceWithMetrics {
  upload_id: string;
  resource_id: string;
  user_id: string;
  file_size: number;
  mime_type: string;
  file_name: string;
  moderation_status: string;
  moderation_reason: string | null;
  created_at: Date;
  title: string;
  description: string;
  visibility: string;
  category: string;
  folder_name: string;
  folder_classification: string;
  folder_tags: string;
  views_count: number;
  downloads_count: number;
  upvotes_count: number;
  rating_count: number;
}

import { LogsService } from '../logs/logs.service';

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
    private logsService: LogsService,
  ) {}

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

    if (files.length > 10) {
      // Max 10 files per upload
      throw new BadRequestException(
        `Too many files: ${files.length}. Maximum allowed: 10`,
      );
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

      if (
        !file.fileSize ||
        typeof file.fileSize !== 'number' ||
        file.fileSize <= 0
      ) {
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
      throw new BadRequestException(
        'Service temporarily unavailable. Please try again later.',
      );
    }
  }

  /**
   * Health check endpoint for monitoring
   */
  async healthCheck(): Promise<{
    status: string;
    timestamp: Date;
    details: any;
  }> {
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
    userId: string,
  ): Promise<PreSignedUrlResponseDto> {
    // Comprehensive input validation
    this.validateUploadRequest(requestDto.files, userId);

    // Database health check - bằng 1 truy vấn nhỏ tí tí
    await this.verifyDatabaseConnection();

    // Validate user exists (security check) - Tìm user với id được chỉ định, chỉ chọn mỗi id
    const userExists = await this.prisma.users.findUnique({
      where: { id: userId },
      select: { id: true },
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
          gte: new Date(Date.now() - this.RATE_LIMIT_WINDOW), // khoảng thời gian vd : 13h, -> 13-1 = 12
        },
      },
    });
    // nếu user có lần request nhiều hơn quy định theo quy ước RATE_LIMIT_REQUESTS, thì ngừng user lại
    if (recentRequests > this.RATE_LIMIT_REQUESTS) {
      throw new BadRequestException(
        'Rate limit exceeded. Please wait before making more requests.',
      );
    }

    // Retry logic for S3 operations
    let lastError: Error | undefined;

    for (let attempt = 1; attempt <= this.MAX_RETRIES; attempt++) {
      try {
        this.logger.log(
          `Requesting pre-signed URLs for ${requestDto.files.length} files for user ${userId} (attempt ${attempt})`,
        );

        // Generate pre-signed URLs through S3 service with enhanced validation
        const preSignedData =
          await this.s3Service.generateMultiplePreSignedUrls(
            requestDto.files,
            userId,
          );

        // Return temporary session data (no DB commit)
        return {
          sessionId: uuidv4(), // temporary frontend tracking ID
          preSignedData,
          expiresIn: 3600, // 1 hour expiry
        };
      } catch (error) {
        // error
        lastError = error as Error; // => Ép kiểu cho error
        this.logger.warn(
          `Pre-signed URL generation attempt ${attempt} failed:`,
          error,
        );

        // Don't retry on validation errors
        if (error instanceof BadRequestException) {
          // Kiểu lỗi là BadRequestException => cook
          throw error;
        }

        // Wait before retrying
        if (attempt < this.MAX_RETRIES) {
          // so sánh lần thử hiện tại(current) và lần thử tối đa(3)
          // => Đợi x ms, rồi thử lại
          await new Promise((resolve) =>
            setTimeout(resolve, this.calculateRetryDelay(attempt)),
          );
        }
      }
    }

    this.logger.error(
      'All pre-signed URL generation attempts failed:',
      lastError,
    );
    throw new BadRequestException(
      'Failed to generate upload URLs after multiple attempts. Please try again later.',
    );
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
    userId: string,
  ): Promise<ResourceResponseDto> {
    console.log('BACKENDDDD', createResourceDto);
    this.logger.log(
      `Creating resource with folder association and ${createResourceDto.files.length} uploads`,
    );

    try {
      return await this.prisma.$transaction(
        async (tx) => {
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
            const newFolderData =
              createResourceDto.folderManagement.newFolderData;

            // Create new folder with classification level
            const folder = await tx.folders.create({
              data: {
                name: newFolderData.name,
                description:
                  newFolderData.description ||
                  `Folder for ${createResourceDto.title}`,
                visibility: createResourceDto.visibility || 'PUBLIC',
                user_id: userId,
                classification_level_id: newFolderData.folderClassificationId,
              },
            });

            folderId = folder.id;
            this.logger.log(`Created new folder with ID: ${folder.id}`);

            //  Handle folder tags
            if (
              newFolderData.folderTagIds &&
              newFolderData.folderTagIds.length > 0
            ) {
              await tx.folder_tags.createMany({
                data: newFolderData.folderTagIds.map((tagId) => ({
                  folder_id: folder.id,
                  tag_id: tagId,
                })),
                skipDuplicates: true,
              });
              this.logger.log(
                `Linked folder to ${newFolderData.folderTagIds.length} tags`,
              );
            }
          } else if (folderId) {
            // Verify folder ownership
            const existingFolder = await tx.folders.findFirst({
              where: {
                id: folderId,
                user_id: userId,
              },
            });

            if (!existingFolder) {
              throw new BadRequestException(
                'Folder not found or not owned by user',
              );
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
            this.logger.log(
              `Linked resource ${resource.id} to folder ${folderId} via folder_files`,
            );
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
            // Per-file metadata (Task 2 fix)
            title: file.title || file.originalFilename,
            description: file.description || null,
            visibility: file.fileVisibility || 'PUBLIC',
          }));

          await tx.uploads.createMany({
            data: uploadData,
            skipDuplicates: true,
          });

          const uploads = await tx.uploads.findMany({
            where: { resource_id: resource.id },
            orderBy: { created_at: 'asc' },
          });

          this.logger.log(
            `Created ${uploads.length} upload records with S3 keys`,
          );

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
            uploads: uploads.map((upload) => ({
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
        },
        {
          timeout: this.TRANSACTION_TIMEOUT,
          maxWait: 5000,
        },
      );
    } catch (error) {
      this.logger.error('Failed to create resource with uploads:', error);

      // Create UPLOAD_FAILED log
      try {
        await this.logsService.createLog({
          userId,
          type: 'UPLOAD_FAILED',
          entityType: 'resource',
          message: `Failed to create resource: ${error instanceof Error ? error.message : 'Unknown error'}`,
        });
      } catch (logError) {
        this.logger.error('Failed to create UPLOAD_FAILED log:', logError);
      }

      throw new BadRequestException('Failed to create resource with uploads');
    }
  }

  /**
   * Step 3: S3 Upload & Completion (optional verification)
   * Purpose: Verify S3 uploads, update status to COMPLETED
   * Optimized with retry logic and batch operations
   */
  async completeUpload(completeDto: CompleteUploadDto): Promise<void> {
    this.logger.log(
      `Completing upload for resource: ${completeDto.resourceId}`,
    );

    try {
      await this.prisma.$transaction(
        async (tx) => {
          // 1. Verify resource exists
          const resource = await tx.resources.findUnique({
            where: { id: completeDto.resourceId },
            include: { uploads: { select: { user_id: true } } },
          });

          if (!resource) {
            throw new NotFoundException(
              `Resource with ID ${completeDto.resourceId} not found`,
            );
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

          this.logger.log(
            `Successfully completed upload for resource: ${completeDto.resourceId}`,
          );
          
          // 3. Create success log
          const userId = resource.uploads[0]?.user_id;
          if (userId) {
            await this.logsService.createLog({
              userId,
              type: 'UPLOAD_SUCCESS',
              entityType: 'resource',
              entityId: completeDto.resourceId,
            });
          }
        },
        {
          timeout: this.TRANSACTION_TIMEOUT,
          maxWait: 5000,
        },
      );
    } catch (error) {
      this.logger.error('Failed to complete upload:', error);

      // Create UPLOAD_FAILED log if we have resource info
      try {
        await this.prisma.resources.findUnique({
          where: { id: completeDto.resourceId },
          include: { uploads: { select: { user_id: true }, take: 1 } },
        }).then(async (resource) => {
          if (resource?.uploads[0]?.user_id) {
            await this.logsService.createLog({
              userId: resource.uploads[0].user_id,
              type: 'UPLOAD_FAILED',
              entityType: 'resource',
              entityId: completeDto.resourceId,
              message: `Failed to complete upload: ${error instanceof Error ? error.message : 'Unknown error'}`,
            });
          }
        });
      } catch (logError) {
        this.logger.error('Failed to create UPLOAD_FAILED log:', logError);
      }

      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new BadRequestException(
        'Failed to complete upload. Please try again.',
      );
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
    status?: string,
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
      this.logger.error(
        `Failed to get user uploads for user ${userId}:`,
        error,
      );
      throw new BadRequestException('Failed to retrieve uploads');
    }
  }

  /**
   * Delete resource and cleanup (simplified without S3 cleanup)
   * Optimized with proper cascading and error handling
   */
  async deleteResource(resourceId: string, userId: string): Promise<void> {
    try {
      await this.prisma.$transaction(
        async (tx) => {
          // Find resource with uploads - verify ownership through uploads
          const resource = await tx.resources.findFirst({
            where: {
              id: resourceId,
              uploads: { some: { user_id: userId } },
            },
            include: { uploads: true },
          });

          if (!resource) {
            throw new NotFoundException(
              'Resource not found or not owned by user',
            );
          }

          // Delete database records (cascade will handle related records)
          await tx.uploads.deleteMany({
            where: { resource_id: resourceId },
          });

          await tx.resources.delete({
            where: { id: resourceId },
          });

          this.logger.log(
            `Deleted resource ${resourceId} and associated uploads`,
          );
        },
        {
          timeout: this.TRANSACTION_TIMEOUT,
          maxWait: 5000,
        },
      );
    } catch (error) {
      this.logger.error(`Failed to delete resource ${resourceId}:`, error);

      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new BadRequestException(
        'Failed to delete resource. Please try again.',
      );
    }
  }

  /**
   * Generate download URL for a file
   * Uses S3 presigned URLs for secure download
   */
  async generateDownloadUrl(uploadId: string, userId: string): Promise<string> {
    try {
      // Fetch upload with resource info
      const upload = await this.prisma.uploads.findFirst({
        where: {
          id: uploadId,
          // Allow download if user owns it OR resource is public
          OR: [
            { user_id: userId },
            {
              resources: {
                visibility: 'PUBLIC',
                // Only approved uploads
              }
            }
          ],
          moderation_status: 'APPROVED',
          status: 'COMPLETED',
        },
        include: {
          resources: true,
        },
      });

      if (!upload) {
        throw new NotFoundException('Upload not found or not accessible');
      }

      if (!upload.s3_key) {
        throw new BadRequestException('S3 key not available for this upload');
      }

      // Generate presigned download URL from S3
      const downloadUrl = await this.s3Service.generateDownloadUrl(upload.s3_key);

      // Track download in database
      if (upload.resource_id) {
        await this.prisma.downloads.create({
          data: {
            user_id: userId,
            resource_id: upload.resource_id,
            downloaded_at: new Date(),
          },
        }).catch(err => {
          // Log but don't fail if tracking fails
          this.logger.error(`Failed to track download for ${uploadId}:`, err);
        });

        // Log download activity
        await this.logsService.createLog({
          userId: upload.user_id || userId,
          actorId: userId,
          type: 'DOWNLOAD' as any, // Need to add to LogType enum
          entityType: 'resource',
          entityId: upload.resource_id,
          message: `Downloaded file: ${upload.file_name}`,
        }).catch(err => {
          this.logger.error(`Failed to log download for ${uploadId}:`, err);
        });
      }

      this.logger.log(`Generated download URL for upload ${uploadId}`);
      return downloadUrl;
    } catch (error) {
      this.logger.error(
        `Failed to generate download URL for upload ${uploadId}:`,
        error,
      );

      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }

      throw new BadRequestException('Failed to generate download URL');
    }
  }

  /**
   * Retry failed upload (with exponential backoff)
   * Optimized for reliability and user experience
   */
  async retryFailedUpload(
    uploadId: string,
    userId: string,
  ): Promise<PreSignedUrlResponseDto> {
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
        files: [
          {
            originalFilename: upload.file_name || 'unknown',
            mimetype: upload.mime_type || 'application/octet-stream',
            fileSize: upload.file_size || 0,
          },
        ],
      };

      // Generate new pre-signed URLs for retry
      return await this.requestPreSignedUrls(retryRequest, userId);
    } catch (error) {
      this.logger.error(`Failed to retry upload ${uploadId}:`, error);

      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new BadRequestException(
        'Failed to retry upload. Please try again.',
      );
    }
  }

  async deleteS3File(s3Key: string, userId: string): Promise<void> {
    // Security: Verify user owns this file
    let uid = s3Key.split('/')[1];
    if (userId !== uid) {
      throw new BadRequestException(
        'Unauthorized: Cannot delete file belonging to another user',
      );
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
    const unauthorizedKeys = s3Keys.filter(
      (key) => key.split('/')[1] !== userId,
    );
    if (unauthorizedKeys.length > 0) {
      throw new BadRequestException(
        'Unauthorized: Cannot delete files belonging to another user',
      );
    }

    try {
      await this.s3Service.deleteMultipleFiles(s3Keys);
      this.logger.log(`${s3Keys.length} S3 files deleted by user ${userId}`);
    } catch (error) {
      this.logger.error(`Failed to delete multiple S3 files:`, error);
      throw new BadRequestException('Failed to delete files from storage');
    }
  }

  /**
   * Get user resources with social metrics for listing page
   * Optimized with raw SQL query for better performance
   */
  async getUserResources(
    userId: string,
    page: number = 1,
    limit: number = 10,
    status?: string,
    search?: string,
  ): Promise<UserResourcesResponseDto> {
    const pageNum = Number(page);
    const limitNum = Number(limit);
    const offset = (pageNum - 1) * limitNum;

    try {
      this.logger.log(
        `Fetching resources for user ${userId}, page ${page}, limit ${limit}`,
      );

      // Optimized query with proper indexes
      const conditions: string[] = [
        'u.user_id = $1::uuid',
        'u.resource_id IS NOT NULL',
      ];
      const params: any[] = [userId];
      let paramIndex = 2;

      if (search && search.trim()) {
        const searchPattern = `%${search.trim()}%`;
        conditions.push(
          `(r.title ILIKE $${paramIndex} OR r.description ILIKE $${paramIndex})`,
        );
        params.push(searchPattern);
        paramIndex++;
      }

      if (status && status !== 'all') {
        const moderationMapping: Record<string, string> = {
          approved: 'APPROVED',
          pending: 'PENDING_APPROVAL',
          rejected: 'REJECTED',
        };

        const moderationStatus = moderationMapping[status.toLowerCase()];
        if (moderationStatus) {
          conditions.push(`u.moderation_status::text = $${paramIndex}`);
          params.push(moderationStatus);
          paramIndex++;
        }
      }

      const whereClause = conditions.join(' AND ');

      // Query with folder classification and tags - only show user's own folders
      const dataQueryString = `
        SELECT
          u.id as upload_id,
          u.resource_id,
          u.user_id,
          u.file_size,
          u.mime_type,
          u.file_name,
          u.created_at,
          u.moderation_status,
          u.moderation_reason,
          r.title,
          r.description,
          r.visibility,
          r.category,
          COALESCE(fo.name, 'No Folder') as folder_name,
          COALESCE(cl.name, '') as folder_classification,
          COALESCE(
            (SELECT STRING_AGG(t.name, ', ')
             FROM folder_tags ft
             JOIN tags t ON ft.tag_id = t.id
             WHERE ft.folder_id = fo.id
            ), ''
          ) as folder_tags,
          0 as views_count,
          0 as downloads_count,
          0 as upvotes_count,
          0 as rating_count
        FROM uploads u
        INNER JOIN resources r ON u.resource_id = r.id
        LEFT JOIN folder_files ff ON u.resource_id = ff.resource_id
        LEFT JOIN folders fo ON ff.folder_id = fo.id AND fo.user_id = $1::uuid
        LEFT JOIN classification_levels cl ON fo.classification_level_id = cl.id
        WHERE ${whereClause}
        ORDER BY u.created_at DESC
        LIMIT $${paramIndex}
        OFFSET $${paramIndex + 1}`;

      const countQueryString = `
        SELECT COUNT(*) as total
        FROM uploads u
        INNER JOIN resources r ON u.resource_id = r.id
        WHERE ${whereClause}`;

      const [rawResults, countResult] = await Promise.all([
        this.prisma.$queryRawUnsafe(
          dataQueryString,
          ...params,
          limitNum,
          offset,
        ) as Promise<ResourceWithMetrics[]>,
        this.prisma.$queryRawUnsafe(countQueryString, ...params) as Promise<
          [{ total: bigint }]
        >,
      ]);

      const total = Number(countResult[0]?.total || 0);
      const totalPages = Math.ceil(total / limitNum);

      const resources = rawResults.map((row) => ({
        upload_id: row.upload_id,
        resource_id: row.resource_id,
        user_id: userId,
        file_size: Number(row.file_size) || 0,
        mime_type: row.mime_type || '',
        file_name: row.file_name || '',
        moderation_status: row.moderation_status || 'PENDING_APPROVAL',
        moderation_reason: row.moderation_reason || null,
        created_at: new Date(row.created_at),
        resource_details: {
          title: row.title || '',
          description: row.description || '',
          visibility:
            (row.visibility as ResourceVisibility) ||
            ResourceVisibility.PRIVATE,
          category: row.category || '',
          folder_name: row.folder_name || 'No Folder',
          folder_classification: row.folder_classification || '',
          folder_tags: row.folder_tags || '',
          views_count: Number(row.views_count) || 0,
          downloads_count: Number(row.downloads_count) || 0,
          upvotes_count: Number(row.upvotes_count) || 0,
          rating_count: Number(row.rating_count) || 0,
        },
      }));

      this.logger.log(
        `Retrieved ${resources.length} resources for user ${userId}`,
      );

      return {
        resources,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages,
        },
      };
    } catch (error) {
      this.logger.error(
        `Failed to get user resources for user ${userId}:`,
        error,
      );
      throw new BadRequestException('Failed to retrieve user resources');
    }
  }

  /**
   * Generate presigned URL for profile image upload
   */
  async generateProfileImageUploadUrl(
    userId: string,
    filename: string,
    mimetype: string,
    fileSize: number,
    imageType: 'avatar' | 'banner'
  ): Promise<{ message: string; status: number; result: { s3Key: string; uploadUrl: string; publicUrl: string } }> {
    try {
      const result = await this.s3Service.generateProfileImageUploadUrl(
        userId,
        filename,
        mimetype,
        fileSize,
        imageType
      );

      return {
        message: 'Profile image upload URL generated successfully',
        status: 200,
        result
      };
    } catch (error) {
      this.logger.error('Failed to generate profile image upload URL:', error);
      throw error;
    }
  }

  /**
   * Generate presigned URL for souvenir image upload
   */
  async generateSouvenirImageUploadUrl(
    userId: string,
    filename: string,
    mimetype: string,
    fileSize: number
  ): Promise<{ message: string; status: number; result: { s3Key: string; uploadUrl: string; publicUrl: string } }> {
    try {
      const result = await this.s3Service.generateSouvenirImageUploadUrl(
        userId,
        filename,
        mimetype,
        fileSize
      );

      return {
        message: 'Souvenir image upload URL generated successfully',
        status: 200,
        result
      };
    } catch (error) {
      this.logger.error('Failed to generate souvenir image upload URL:', error);
      throw error;
    }
  }
}
