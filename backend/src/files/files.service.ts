import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { S3Service } from '../Aws/aws.service';
import { LogsService } from '../logs/logs.service';

@Injectable()
export class FilesService {
  private readonly logger = new Logger(FilesService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly s3Service: S3Service,
    private readonly logsService: LogsService
  ) {}

  async generateResourceDownloadUrl(resourceId: string, userId: string): Promise<string> {
    try {
      // Fetch resource with first upload
      const resource = await this.prisma.resources.findFirst({
        where: {
          id: resourceId,
          OR: [
            { uploads: { some: { user_id: userId } } },
            { visibility: 'PUBLIC' }
          ]
        },
        include: {
          uploads: {
            where: {
              moderation_status: 'APPROVED',
              status: 'COMPLETED'
            },
            orderBy: { created_at: 'asc' },
            take: 1
          }
        }
      });

      if (!resource || resource.uploads.length === 0) {
        throw new NotFoundException('Resource not found or not accessible');
      }

      const upload = resource.uploads[0];

      if (!upload.s3_key) {
        throw new BadRequestException('S3 key not available for this resource');
      }

      // Generate presigned download URL
      const downloadUrl = await this.s3Service.generateDownloadUrl(upload.s3_key);

      // Track download
      await this.prisma.downloads.create({
        data: {
          user_id: userId,
          resource_id: resourceId,
          downloaded_at: new Date()
        }
      }).catch(err => {
        this.logger.error(`Failed to track download for ${resourceId}:`, err);
      });

      // Log download
      await this.logsService.createLog({
        userId: upload.user_id || userId,
        actorId: userId,
        type: 'DOWNLOAD' as any,
        entityType: 'resource',
        entityId: resourceId,
        message: `Downloaded resource: ${resource.title || upload.file_name}`
      }).catch(err => {
        this.logger.error(`Failed to log download for ${resourceId}:`, err);
      });

      this.logger.log(`Generated download URL for resource ${resourceId}`);
      return downloadUrl;

    } catch (error) {
      this.logger.error(`Failed to generate download URL for resource ${resourceId}:`, error);

      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }

      throw new BadRequestException('Failed to generate download URL');
    }
  }
}
