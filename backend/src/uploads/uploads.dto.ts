import { IsString, IsNotEmpty, IsArray, IsOptional, IsEnum, IsNumber, Min, Max, ValidateNested, IsUUID } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export enum VisibilityType {
  PUBLIC = 'PUBLIC',
  PRIVATE = 'PRIVATE',
}

export enum DocumentCategory {
  LECTURE = 'lecture',
  EXERCISE = 'exercise', 
  EXAM = 'exam',
  REFERENCE = 'reference',
  OTHER = 'other'
}

export class FileMetadataDto {
  @ApiProperty({ description: 'Original filename' })
  @IsString()
  @IsNotEmpty()
  originalFilename: string;

  @ApiProperty({ description: 'File MIME type' })
  @IsString()
  @IsNotEmpty()
  mimetype: string;

  @ApiProperty({ description: 'File size in bytes' })
  @IsNumber()
  @Min(1)
  @Max(50 * 1024 * 1024) // 50MB
  fileSize: number;

  @ApiProperty({ description: 'Upload folder', required: false })
  @IsString()
  @IsOptional()
  folderId?: string;
}

// Step 1: Request pre-signed URLs (no DB writes)
export class RequestPreSignedUrlsDto {
  @ApiProperty({ description: 'File metadata array' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FileMetadataDto)
  files: FileMetadataDto[];
}

export class PreSignedUrlResponseDto {
  @ApiProperty({ description: 'Temporary session ID for frontend tracking' })
  sessionId: string;

  @ApiProperty({ description: 'Pre-signed URL data for each file' })
  preSignedData: PreSignedFileData[];

  @ApiProperty({ description: 'Expiration time in seconds' })
  expiresIn: number;
}

export class PreSignedFileData {
  @ApiProperty({ description: 'S3 key for the file' })
  s3Key: string;

  @ApiProperty({ description: 'Pre-signed URL for upload' })
  preSignedUrl: string;

  @ApiProperty({ description: 'Original filename' })
  originalFilename: string;

  @ApiProperty({ description: 'File size' })
  fileSize: number;

  @ApiProperty({ description: 'MIME type' })
  mimetype: string;
}

// Step 2: Create resource with upload records
export class CreateResourceWithUploadsDto {
  @ApiProperty({ description: 'User ID' })
  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({ description: 'Document title' })
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value.trim())
  title: string;

  @ApiProperty({ description: 'Document description' })
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value.trim())
  description: string;

  @ApiProperty({ enum: DocumentCategory, required: false })
  @IsEnum(DocumentCategory)
  @IsOptional()
  category?: DocumentCategory;

  @ApiProperty({ enum: VisibilityType })
  @IsEnum(VisibilityType)
  visibility: VisibilityType;

  @ApiProperty({ description: 'File data with S3 keys' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FileUploadDataDto)
  files: FileUploadDataDto[];
}

export class FileUploadDataDto {
  @ApiProperty({ description: 'Original filename' })
  @IsString()
  @IsNotEmpty()
  originalFilename: string;

  @ApiProperty({ description: 'File MIME type' })
  @IsString()
  @IsNotEmpty()
  mimetype: string;

  @ApiProperty({ description: 'File size in bytes' })
  @IsNumber()
  @Min(1)
  fileSize: number;

  @ApiProperty({ description: 'S3 key from pre-signed URL' })
  @IsString()
  @IsNotEmpty()
  s3Key: string;
}

export class ResourceResponseDto {
  @ApiProperty({ description: 'Created resource' })
  resource: {
    id: string;
    title: string;
    description: string;
    category?: string;
    visibility: VisibilityType;
    status: string;
    created_at: Date;
  };

  @ApiProperty({ description: 'Created upload records' })
  uploads: {
    id: string;
    user_id: string;
    resource_id: string;
    file_name: string;
    mime_type: string;
    file_size: number;
    s3_key: string;
    status: string;
    created_at: Date;
  }[];
}

// Step 3: Complete upload (optional verification)
export class CompleteUploadDto {
  @ApiProperty({ description: 'Resource ID' })
  @IsUUID()
  @IsNotEmpty()
  resourceId: string;

  @ApiProperty({ description: 'S3 keys of uploaded files' })
  @IsArray()
  @IsString({ each: true })
  s3Keys: string[];
}

// Legacy DTOs (keeping for backward compatibility)
export class CreateUploadDto {
  @ApiProperty({ description: 'Document title' })
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value.trim())
  title: string;

  @ApiProperty({ description: 'Document description' })
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value.trim())
  description: string;

  @ApiProperty({ enum: VisibilityType })
  @IsEnum(VisibilityType)
  visibility: VisibilityType;

  @ApiProperty({ description: 'File metadata array' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FileMetadataDto)
  files: FileMetadataDto[];

  @ApiProperty({ description: 'S3 keys of uploaded files' })
  @IsArray()
  @IsString({ each: true })
  s3Keys: string[];
}

export class RetryUploadDto {
  @ApiProperty({ description: 'Upload session ID' })
  @IsString()
  @IsNotEmpty()
  uploadId: string;

  @ApiProperty({ description: 'File ID to retry' })
  @IsString()
  @IsNotEmpty()
  fileId: string;
}