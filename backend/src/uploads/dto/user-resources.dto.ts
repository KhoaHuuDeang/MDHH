import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsEnum, IsDate } from 'class-validator';
import { Type } from 'class-transformer';

export enum ResourceVisibility {
  PUBLIC = 'PUBLIC',
  PRIVATE = 'PRIVATE'
}

export class PaginationDto {
  @ApiProperty({ description: 'Current page number' })
  @IsNumber()
  page: number;

  @ApiProperty({ description: 'Number of items per page' })
  @IsNumber()
  limit: number;

  @ApiProperty({ description: 'Total number of items' })
  @IsNumber()
  total: number;

  @ApiProperty({ description: 'Total number of pages' })
  @IsNumber()
  totalPages: number;
}

export class ResourceDetailsDto {
  @ApiProperty({ description: 'Resource title' })
  @IsString()
  title: string;

  @ApiProperty({ description: 'Resource description' })
  @IsString()
  description: string;

  @ApiProperty({ description: 'Resource visibility', enum: ResourceVisibility })
  @IsEnum(ResourceVisibility)
  visibility: ResourceVisibility;

  @ApiProperty({ description: 'Resource category' })
  @IsString()
  category: string;

  @ApiProperty({ description: 'Folder name containing this resource' })
  @IsString()
  folder_name: string;

  @ApiProperty({ description: 'Folder classification level name' })
  @IsString()
  folder_classification: string;

  @ApiProperty({ description: 'Folder tags (comma-separated)' })
  @IsString()
  folder_tags: string;

  @ApiProperty({ description: 'Number of upvotes for this resource' })
  @IsNumber()
  upvotes_count: number;

  @ApiProperty({ description: 'Number of downloads for this resource' })
  @IsNumber()
  downloads_count: number;
}

export class ResourceItemDto {
  @ApiProperty({ description: 'Upload ID' })
  @IsString()
  upload_id: string;

  @ApiProperty({ description: 'Resource ID' })
  @IsString()
  resource_id: string;

  @ApiProperty({ description: 'User ID who uploaded the resource' })
  @IsString()
  user_id: string;

  @ApiProperty({ description: 'File size in bytes' })
  @IsNumber()
  file_size: number;

  @ApiProperty({ description: 'MIME type of the file' })
  @IsString()
  mime_type: string;

  @ApiProperty({ description: 'Upload creation timestamp' })
  @IsDate()
  created_at: Date;

  @ApiProperty({ description: 'Moderation status of upload', enum: ['APPROVED', 'PENDING_APPROVAL', 'REJECTED'] })
  @IsString()
  moderation_status: string;

  @ApiPropertyOptional({ description: 'Reason for rejection if rejected' })
  @IsOptional()
  @IsString()
  moderation_reason?: string | null;

  @ApiProperty({ description: 'Resource details with social metrics', type: ResourceDetailsDto })
  resource_details: ResourceDetailsDto;
}

export class UserResourcesResponseDto {
  @ApiProperty({ 
    description: 'Array of user resources with upload info',
    type: [ResourceItemDto]
  })
  resources: ResourceItemDto[];

  @ApiProperty({ description: 'Pagination information', type: PaginationDto })
  pagination: PaginationDto;
}

// Query parameters for filtering and pagination
export class GetUserResourcesQueryDto {
  @ApiPropertyOptional({ description: 'Page number', default: 1 })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Items per page', default: 10 })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  limit?: number = 10;

  @ApiPropertyOptional({ description: 'Filter by resource status' })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({ description: 'Search by title or description' })
  @IsOptional()
  @IsString()
  search?: string;
}