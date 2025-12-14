import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsDate, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class FileDataDto {
  @ApiProperty({
    description: 'Unique identifier of the file',
    example: 'uuid-example-123'
  })
  @IsString()
  id: string;

  @ApiProperty({
    description: 'Title of the file',
    example: 'Introduction to React.js'
  })
  @IsString()
  title: string;

  @ApiProperty({
    description: 'Description of the file content',
    example: 'A comprehensive guide to getting started with React.js framework',
    required: false
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Category of the file',
    example: 'Web Development',
    required: false
  })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiProperty({
    description: 'Author/Creator of the file',
    example: 'Nguyễn Văn A'
  })
  @IsString()
  author: string;

  @ApiProperty({
    description: 'Creation date of the file',
    example: '2024-01-15T10:30:00Z'
  })
  @IsDate()
  @Type(() => Date)
  createdAt: Date;

  @ApiProperty({
    description: 'MIME type of the file',
    example: 'application/pdf'
  })
  @IsString()
  fileType: string;

  @ApiProperty({
    description: 'Number of times the file has been downloaded',
    example: 25,
    minimum: 0
  })
  @IsNumber()
  downloadCount: number;

  @ApiProperty({
    description: 'Name of the folder containing this file',
    example: 'Web Development Course',
    required: false
  })
  @IsOptional()
  @IsString()
  folderName?: string;

  @ApiProperty({
    description: 'Classification level of the folder containing this file',
    example: 'Beginner',
    required: false
  })
  @IsOptional()
  @IsString()
  classificationLevel?: string;

  @ApiProperty({
    description: 'Tags associated with this file',
    example: ['react', 'javascript', 'frontend'],
    required: false,
    type: [String]
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}

export class FolderDataDto {
  @ApiProperty({
    description: 'Unique identifier of the folder',
    example: 'uuid-folder-123'
  })
  @IsString()
  id: string;

  @ApiProperty({
    description: 'Name of the folder',
    example: 'Web Development Resources'
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Description of the folder content',
    example: 'Collection of web development tutorials and resources',
    required: false
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Author/Creator of the folder',
    example: 'PGS.TS Phạm Thị D'
  })
  @IsString()
  author: string;

  @ApiProperty({
    description: 'Number of users following this folder',
    example: 15,
    minimum: 0
  })
  @IsNumber()
  followCount: number;
}

export class HomepageResponseDto {
  @ApiProperty({
    description: 'List of recently created files',
    type: [FileDataDto],
    example: []
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FileDataDto)
  recentFiles: FileDataDto[];

  @ApiProperty({
    description: 'List of most downloaded/popular files',
    type: [FileDataDto],
    example: []
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FileDataDto)
  popularFiles: FileDataDto[];

  @ApiProperty({
    description: 'List of most downloaded files (different from popularFiles)',
    type: [FileDataDto],
    example: []
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FileDataDto)
  mostDownloadedFiles: FileDataDto[];
}

export class SearchFilesQueryDto {
  @ApiProperty({
    description: 'Search query for file title or description',
    example: 'react tutorial',
    required: false
  })
  @IsOptional()
  @IsString()
  query?: string;

  @ApiProperty({
    description: 'Classification level ID to filter by',
    example: 'uuid-classification-123',
    required: false
  })
  @IsOptional()
  @IsString()
  classificationLevelId?: string;

  @ApiProperty({
    description: 'Comma-separated tag IDs to filter by',
    example: 'uuid-tag-1,uuid-tag-2',
    required: false
  })
  @IsOptional()
  @IsString()
  tags?: string;

  @ApiProperty({
    description: 'Page number for pagination',
    example: 1,
    default: 1,
    required: false
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  page?: number;

  @ApiProperty({
    description: 'Number of items per page',
    example: 20,
    default: 20,
    required: false
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  limit?: number;
}

export class SearchFilesResponseDto {
  @ApiProperty({
    description: 'Search result message',
    example: 'Search completed successfully'
  })
  @IsString()
  message: string;

  @ApiProperty({
    description: 'HTTP status code',
    example: 200
  })
  @IsNumber()
  status: number;

  @ApiProperty({
    description: 'Search results data'
  })
  result: {
    files: FileDataDto[];
    total: number;
    hasMore: boolean;
    page: number;
    limit: number;
  };
}