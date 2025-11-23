import { IsUUID, IsOptional, IsString, IsInt, Min, IsEnum, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

// Upload Moderation DTOs
export class AdminUploadItemDto {
  id: string;
  user_id: string | null;
  resource_id: string | null;
  file_name: string | null;
  mime_type: string | null;
  file_size: number | null;
  s3_key: string | null;
  status: string | null;
  created_at: Date | null;
  uploaded_at: Date | null;
  user?: {
    id: string;
    username: string | null;
    email: string | null;
  };
  resource?: {
    id: string;
    title: string | null;
  };
}

export class AdminUploadsQueryDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  limit?: number;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(['PENDING', 'COMPLETED', 'FAILED'])
  status?: string;

  @IsOptional()
  @IsString()
  sortBy?: string;

  @IsOptional()
  @IsEnum(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc';
}

export class AdminUploadsResponseDto {
  uploads: AdminUploadItemDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export class DeleteUploadDto {
  @IsUUID()
  uploadId: string;

  @IsOptional()
  @IsString()
  reason?: string;
}

export class FlagUploadDto {
  @IsUUID()
  uploadId: string;

  @IsString()
  reason: string;
}

// Comment Moderation DTOs
export class AdminCommentItemDto {
  id: string;
  user_id: string | null;
  resource_id: string | null;
  folder_id: string | null;
  parent_id: string | null;
  content: string | null;
  is_deleted: boolean | null;
  created_at: Date | null;
  updated_at: Date | null;
  user?: {
    id: string;
    username: string | null;
    email: string | null;
  };
  resource?: {
    id: string;
    title: string | null;
  };
  folder?: {
    id: string;
    name: string | null;
  };
}

export class AdminCommentsQueryDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  limit?: number;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  is_deleted?: boolean;

  @IsOptional()
  @IsString()
  sortBy?: string;

  @IsOptional()
  @IsEnum(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc';
}

export class AdminCommentsResponseDto {
  comments: AdminCommentItemDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export class DeleteCommentDto {
  @IsUUID()
  commentId: string;

  @IsOptional()
  @IsString()
  reason?: string;
}

// Folder Moderation DTOs
export class AdminFolderItemDto {
  id: string;
  name: string | null;
  description: string | null;
  visibility: string | null;
  user_id: string;
  classification_level_id: string;
  created_at: Date | null;
  updated_at: Date | null;
  user?: {
    id: string;
    username: string | null;
    email: string | null;
  };
  classification_level?: {
    id: string;
    name: string | null;
  };
  _count?: {
    folder_files: number;
    comments: number;
    follows: number;
  };
}

export class AdminFoldersQueryDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  limit?: number;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(['PUBLIC', 'PRIVATE'])
  visibility?: string;

  @IsOptional()
  @IsString()
  sortBy?: string;

  @IsOptional()
  @IsEnum(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc';
}

export class AdminFoldersResponseDto {
  folders: AdminFolderItemDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export class DeleteFolderDto {
  @IsUUID()
  folderId: string;

  @IsOptional()
  @IsString()
  reason?: string;
}
