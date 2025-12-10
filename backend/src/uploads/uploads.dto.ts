import { IsString, IsNotEmpty, IsArray, IsOptional, IsEnum, IsNumber, Min, Max, ValidateNested, IsUUID, IsObject } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export enum VisibilityType {
  PUBLIC = 'PUBLIC',
  PRIVATE = 'PRIVATE',
}

export enum DocumentCategory {
  LECTURE = 'LECTURE',
  EXERCISE = 'EXERCISE',
  EXAM = 'EXAM',
  REFERENCE = 'REFERENCE',
  OTHER = 'OTHER'
}


export class FileMetadataDto {
  @IsString() @IsNotEmpty()
  originalFilename: string;

  @IsString() @IsNotEmpty()
  mimetype: string;

  @IsNumber() @Min(1) @Max(50 * 1024 * 1024)
  fileSize: number;

  user_id?: string;
  resource_id?: string;
  file_name?: string;
  s3_key?: string;

  @IsEnum(['pending', 'uploading', 'completed', 'failed'])
  status?: 'pending' | 'uploading' | 'completed' | 'failed' = 'pending';
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

export class NewFolderDataDto {
  @IsString() @IsNotEmpty()
  name: string;

  @IsString() @IsNotEmpty()
  description: string;

  @IsUUID() @IsNotEmpty()
  folderClassificationId: string;

  @IsArray() @IsString({ each: true }) @IsOptional()
  folderTagIds?: string[];
}
export class FolderManagementDto {
  @IsUUID()
  @IsOptional()
  @ApiProperty({ description: 'Selected existing folder ID', required: false })
  selectedFolderId?: string;

  @IsObject()
  @IsOptional()
  @ValidateNested()
  @Type(() => NewFolderDataDto)
  @ApiProperty({ description: 'New folder creation data', required: false })
  newFolderData?: NewFolderDataDto;
}
export class FileUploadDataDto {
  @IsString() @IsNotEmpty()
  originalFilename: string;

  @IsString() @IsNotEmpty()
  mimetype: string;

  @IsNumber() @Min(1)
  fileSize: number;

  @IsString() @IsNotEmpty()
  s3Key: string;

  // Per-file metadata
  @IsString() @IsNotEmpty()
  title: string;

  @IsString() @IsNotEmpty()
  description: string;

  @IsEnum(VisibilityType)
  fileVisibility: VisibilityType;
}
export class CreateResourceWithUploadsDto {
  @IsString() @IsNotEmpty()
  @ApiProperty({ description: 'Resource title', example: 'Advanced Mathematics Chapter 5' })
  title: string;

  @IsString() @IsNotEmpty()
  @ApiProperty({ description: 'Resource description', maxLength: 1000 })
  description: string;

  @IsEnum(VisibilityType)
  @ApiProperty({ enum: VisibilityType, description: 'Resource visibility' })
  visibility: VisibilityType;

  @IsObject()
  @ValidateNested()
  @Type(() => FolderManagementDto)
  @ApiProperty({ description: 'Folder selection or creation data' })
  folderManagement: FolderManagementDto;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FileUploadDataDto)
  @ApiProperty({ type: [FileUploadDataDto], description: 'File upload data array' })
  files: FileUploadDataDto[];
}
export class ResourceResponseDto {
  @ApiProperty({ description: 'Created resource' })
  resource: {
    id: string;
    title: string;
    description: string;
    category?: string;
    visibility: VisibilityType;
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

  @ApiProperty({ description: 'Folder ID if resource was linked to folder', required: false })
  folderId?: string;
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

export class CompleteResourceCreationResponse {
  @ApiProperty({ description: 'Created resource with metadata' })
  resource: {
    id: string;
    title: string;
    description: string;
    category?: string;
    visibility: VisibilityType;
    status: string;
    created_at: Date;
  };

  @ApiProperty({ description: 'Upload records with S3 keys' })
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

  @ApiProperty({ description: 'Folder ID where resource was placed', required: false })
  folderId?: string;

  @ApiProperty({ description: 'Success message' })
  message: string;
}