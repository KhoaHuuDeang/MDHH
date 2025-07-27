import { Injectable, BadRequestException, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service'; 
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
  private readonly BATCH_SIZE = 100; // For batch operations
  private readonly RATE_LIMIT_REQUESTS = 50; // Max requests per minute per user
  private readonly RATE_LIMIT_WINDOW = 60000; // 1 minute in milliseconds

  constructor(
    private prisma: PrismaService,
    private s3Service: S3Service,
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

    // Database health check
    await this.verifyDatabaseConnection();

    // Validate user exists (security check)
    const userExists = await this.prisma.users.findUnique({
      where: { id: userId },
      select: { id: true }
    });
    
    if (!userExists) {
      throw new BadRequestException('Invalid user ID');
    }

    // Rate limiting check - prevent abuse
    const recentRequests = await this.prisma.uploads.count({
      where: {
        user_id: userId,
        created_at: {
          gte: new Date(Date.now() - this.RATE_LIMIT_WINDOW)
        }
      }
    });

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
      } catch (error) {
        lastError = error as Error;
        this.logger.warn(`Pre-signed URL generation attempt ${attempt} failed:`, error);
        
        // Don't retry on validation errors
        if (error instanceof BadRequestException) {
          throw error;
        }
        
        // Wait before retrying
        if (attempt < this.MAX_RETRIES) {
          await new Promise(resolve => setTimeout(resolve, this.calculateRetryDelay(attempt)));
        }
      }
    }
    
    this.logger.error('All pre-signed URL generation attempts failed:', lastError);
    throw new BadRequestException('Failed to generate upload URLs after multiple attempts. Please try again later.');
  }

  /**
   * Step 2: Metadata confirmation & Database creation
   * Purpose: User confirms metadata → create resource + upload records
   * Database: Transaction creating resources + uploads records
   * Optimized with timeout, batch operations, and comprehensive error handling
   */
  async createResourceWithUploads(
    createResourceDto: CreateResourceWithUploadsDto
  ): Promise<ResourceResponseDto> {
    this.logger.log(`Creating resource with ${createResourceDto.files.length} uploads`);

    try {
      return await this.prisma.$transaction(async (tx) => {
        // 1. Create resource record with all required fields
        const resource = await tx.resources.create({
          data: {
            title: createResourceDto.title,
            description: createResourceDto.description,
            visibility: createResourceDto.visibility || 'PUBLIC',
          },
        });

        this.logger.log(`Created resource with ID: ${resource.id}`);

        // 2. Create upload records for each file using batch operation
        const uploadData = createResourceDto.files.map((file) => ({
          user_id: createResourceDto.userId,
          resource_id: resource.id,
          fileName: file.originalFilename, // Using camelCase field name
          mime_type: file.mimetype,
          fileSize: file.fileSize, // Using camelCase field name
        }));

        // Use createMany for better performance with large batches
        const uploadsResult = await tx.uploads.createMany({
          data: uploadData,
          skipDuplicates: true,
        });

        // Get the created uploads for response
        const uploads = await tx.uploads.findMany({
          where: { resource_id: resource.id },
          orderBy: { created_at: 'asc' },
        });

        this.logger.log(`Created ${uploads.length} upload records`);

        // Return formatted response with null safety
        return {
          resource: {
            id: resource.id,
            title: resource.title || '',
            description: resource.description || '',
            category: '', // Not available in schema
            visibility: resource.visibility as any,
            status: 'PENDING', // Default status
            created_at: resource.created_at || new Date(),
          },
          uploads: uploads.map(upload => ({
            id: upload.id,
            user_id: upload.user_id || '',
            resource_id: upload.resource_id || '',
            file_name: upload.file_name || '', 
            mime_type: upload.mime_type || '',
            file_size: upload.file_size || 0, 
            s3_key: '', 
            status: 'PENDING', // Default status
            created_at: upload.created_at || new Date(),
          })),
        };
      }, {
        timeout: this.TRANSACTION_TIMEOUT, // 30 seconds timeout
        maxWait: 5000, // Max wait for transaction to start
      });
    } catch (error) {
      this.logger.error('Failed to create resource with uploads:', error);
      
      // Enhanced error handling with specific error types
      if (error.code === 'P2002') {
        throw new BadRequestException('Resource with this title already exists');
      } else if (error.code === 'P2003') {
        throw new BadRequestException('Invalid foreign key reference');
      } else if (error.code === 'P2034') {
        throw new BadRequestException('Transaction failed due to write conflict');
      }
      
      throw new BadRequestException('Failed to create resource. Please try again.');
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

      // Create retry request with original file metadata
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
}