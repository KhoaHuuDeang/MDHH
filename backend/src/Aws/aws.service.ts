import { DeleteObjectCommand, GetObjectCommand, ListObjectsV2Command, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { v4 as uuidv4 } from 'uuid'; 

@Injectable()
export class S3Service {
    private readonly s3: S3Client
    private readonly bucket: string;
    private readonly logger = new Logger(S3Service.name);
    constructor(private configService: ConfigService) {
        this.s3 = new S3Client({
            region: this.configService.get<string>('AWS_REGION')!,
            credentials: {
                accessKeyId: this.configService.get<string>('AWS_ACCESS_KEY_ID')!,
                secretAccessKey: this.configService.get<string>('AWS_SECRET_ACCESS_KEY')!,
            },
        });
        this.bucket = this.configService.get<string>('S3_BUCKET')!
    }

    async uploadFile(file: Express.Multer.File, folder: string = 'uploads'): Promise<string> {
        try {
            const fileId = uuidv4();
            const key = `${folder}/${fileId}-${file.originalname}`;

            const command = new PutObjectCommand({
                Bucket: this.bucket,
                Key: key,
                Body: file.buffer,
                ContentType: file.mimetype,
            });

            await this.s3.send(command);
            this.logger.log(`File uploaded successfully to ${key}`);
            return key;
        } catch (error) {
            this.logger.error(`Error uploading file: ${error.message}`);
            throw error;
        }
    }
    async getSignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
        try {
            const command = new GetObjectCommand({
                Bucket: this.bucket,
                Key: key,
            });

            const url = await getSignedUrl(this.s3, command, { expiresIn });
            return url;
        } catch (error) {
            this.logger.error(`Error generating signed URL: ${error.message}`);
            throw error;
        }
    }

    // List files in a folder
    async listFiles(folder: string = 'uploads'): Promise<any[]> {
        try {
            const command = new ListObjectsV2Command({
                Bucket: this.bucket,
                Prefix: folder,
            });

            const response = await this.s3.send(command);
            return response.Contents || [];
        } catch (error) {
            this.logger.error(`Error listing files: ${error.message}`);
            throw error;
        }
    }

    // Delete file from S3
    async deleteFile(key: string): Promise<void> {
        try {
            const command = new DeleteObjectCommand({
                Bucket: this.bucket,
                Key: key,
            });

            await this.s3.send(command);
            this.logger.log(`File deleted successfully: ${key}`);
        } catch (error) {
            this.logger.error(`Error deleting file: ${error.message}`);
            throw error;
        }
    }
}