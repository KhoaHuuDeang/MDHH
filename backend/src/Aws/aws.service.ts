import { DeleteObjectCommand, DeleteObjectsCommand, GetObjectCommand, HeadObjectCommand, HeadObjectCommandOutput, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FileMetadataDto, PreSignedFileData } from 'src/uploads/uploads.dto';
import { v4 as uuidv4 } from 'uuid';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
@Injectable()
export class S3Service {
    private readonly logger = new Logger(S3Service.name);
    private readonly s3: S3Client;
    private readonly bucketName: string;

    // File validation constants
    private readonly ALLOWED_MIME_TYPES = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    private readonly MAX_FILE_SIZE = 50 * 1024 * 1024;
    private readonly MAX_FILES_PER_RESOURCE = 10;

    constructor(private configService: ConfigService) {
        this.s3 = new S3Client({
            region: this.configService.get('AWS_REGION')!,
            credentials: {
                accessKeyId: this.configService.get('AWS_ACCESS_KEY_ID')!,
                secretAccessKey: this.configService.get('AWS_SECRET_ACCESS_KEY')!,
            },
        });
        this.bucketName = this.configService.get('S3_BUCKET')!;
    }

    /**
     * Validate file metadata before generating pre-signed URLs
     *         // Nếu có lỗi trong các case -> throw lỗi
     */

    validateFileMetadata(file: FileMetadataDto): void {
        // Check file type
        if (!this.ALLOWED_MIME_TYPES.includes(file.mimetype)) {
            throw new BadRequestException(
                `Invalid file type: ${file.mimetype}. Allowed types: PDF, DOC, DOCX`
            );
        }

        // Check file size
        if (file.fileSize > this.MAX_FILE_SIZE) {
            throw new BadRequestException(
                `File size exceeds limit: ${file.fileSize} bytes. Max allowed: ${this.MAX_FILE_SIZE} bytes`
            );
        }

        // Validate filename (prevent path traversal)
        if (file.originalFilename.includes('..') || file.originalFilename.includes('/')) {
            throw new BadRequestException('Invalid filename: contains illegal characters');
        }

        // Check filename length
        if (file.originalFilename.length > 255) {
            throw new BadRequestException('Filename too long (max 255 characters)');
        }
    }

    /**
     * Generate multiple pre-signed URLs for file uploads
     */
    async generateMultiplePreSignedUrls(
        files: FileMetadataDto[],
        userId: string
    ): Promise<PreSignedFileData[]> {
        // Validate file count
        if (files.length > this.MAX_FILES_PER_RESOURCE) {
            throw new BadRequestException(
                `Too many files: ${files.length}. Max allowed: ${this.MAX_FILES_PER_RESOURCE}`
            );
        }

        // Validate each file
        files.forEach(file => this.validateFileMetadata(file));

        // Generate pre-signed URLs
        const preSignedFiles: PreSignedFileData[] = [];
        // qua mỗi lần lặp mỗi file sẽ được thêm s3key và presign tương ứng
        for (const file of files) {
            try {
                // s3Key trả về return `${userId}/resources/${uniqueId}-${sanitizedFilename}`;
                const s3Key = this.generateS3Key(userId, file.originalFilename);
                this.logger.log(`Generating pre-signed URL for ${file.originalFilename} with key ${s3Key}`);
                //presign được generate ở đây 
                const preSignedUrl = await this.generatePreSignedUrl(s3Key, file.mimetype);
                this.logger.log(`Pre-signed URL generated for ${file.originalFilename}: ${preSignedUrl}`);

                preSignedFiles.push({
                    s3Key,
                    preSignedUrl,
                    originalFilename: file.originalFilename,
                    fileSize: file.fileSize,
                    mimetype: file.mimetype,
                });
            } catch (error) {
                this.logger.error(`Failed to generate pre-signed URL for ${file.originalFilename}:`, error);
                throw new BadRequestException(`Failed to generate upload URL for ${file.originalFilename}`);
            }
        }

        return preSignedFiles;
    }

    /**
     * Generate a secure S3 key
     */
    private generateS3Key(userId: string, filename: string): string {
        const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
        const uniqueId = uuidv4();
        return `temp/${userId}/${uniqueId}-${sanitizedFilename}`;
    }

    /**
     * Generate pre-signed URL for file upload
     */
    private async generatePreSignedUrl(s3Key: string, mimetype: string): Promise<string> {
        const command = new PutObjectCommand({
            Bucket: this.bucketName,
            Key: s3Key,
            ContentType: mimetype,
        });
        try {
            const url = await getSignedUrl(this.s3, command, { expiresIn: 3600 }); // 1 hour
            return url;
        } catch (error) {
            this.logger.error(`Failed to generate pre-signed URL for key: ${s3Key}`, error);
            throw new BadRequestException('Failed to generate pre-signed URL');
        }
    }

    /**
     * Verify that file was successfully uploaded to S3
     */
    async verifyUploadCompleted(s3Key: string): Promise<boolean> {
        try {
            await this.s3.send(new HeadObjectCommand({
                Bucket: this.bucketName,
                Key: s3Key
            }))
            return true;

        } catch (err) {
            if (err.name === 'NotFound') {
                return false
            }
            this.logger.error(`Failed to verify upload for ${s3Key}:`, err);
            throw new BadRequestException('Failed to verify file upload');
        }
    }

    /**
     * Delete file from S3 (for cleanup operations)
     */
    async deleteFile(s3Key: string): Promise<void> {
        const command = new DeleteObjectCommand({
            Bucket: this.bucketName,
            Key: s3Key,
        });

        try {
            await this.s3.send(command);
            this.logger.log(`S3 file deleted: ${s3Key}`);
        } catch (error) {
            this.logger.error(`Failed to delete S3 file ${s3Key}:`, error);
            throw new BadRequestException(`Failed to delete file: ${s3Key}`);
        }
    }
    async deleteMultipleFiles(s3Keys: string[]): Promise<void> {
        if (s3Keys.length === 0) return;
        const chunks = this.chunkArray(s3Keys, 10);
    }

    private chunkArray<T>(array: T[], chunkSize: number): T[][] {
        const chunks: T[][] = [];
        for (let i = 0; i < array.length; i += chunkSize) {
            chunks.push(array.slice(i, i + chunkSize));
        }
        return chunks;
    }

    /**
     * Generate download URL for uploaded file
     */
    async generateDownloadUrl(s3Key: string): Promise<string> {
        try {
            const command = new GetObjectCommand({
                Bucket: this.bucketName,
                Key: s3Key,
                ResponseContentDisposition: "attachment"
            })
            return await getSignedUrl(this.s3, command, { expiresIn: 3600 })
        } catch (error) {
            this.logger.error(`Failed to generate download URL for ${s3Key}:`, error);
            throw new BadRequestException('Failed to generate download URL');
        }
    }

    /**
     * Get file metadata from S3
     */
    async getFileMetadata(s3Key: string): Promise<HeadObjectCommandOutput> {
        try {
            return await this.s3.send(new HeadObjectCommand({
                Bucket: this.bucketName,
                Key: s3Key,
            }))
        } catch (error) {
            this.logger.error(`Failed to get file metadata for ${s3Key}:`, error);
            throw new BadRequestException('Failed to get file information');
        }
    }

}