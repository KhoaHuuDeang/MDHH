import { IsString, IsNotEmpty, IsOptional, IsEnum, IsUUID, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateFolderDto {
  @ApiProperty({ description: 'Folder name' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Folder description', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ enum: ['PUBLIC', 'PRIVATE'] })
  @IsEnum(['PUBLIC', 'PRIVATE'])
  visibility: 'PUBLIC' | 'PRIVATE';

  @ApiProperty({ description: 'Classification level ID' })
  @IsUUID()
  @IsNotEmpty()
  classificationLevelId: string;

  @ApiProperty({ description: 'Array of tag IDs', required: false })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tagIds?: string[];
}

export class UpdateFolderDto {
  @ApiProperty({ description: 'Folder name', required: false })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ description: 'Folder description', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ enum: ['PUBLIC', 'PRIVATE'], required: false })
  @IsEnum(['PUBLIC', 'PRIVATE'])
  @IsOptional()
  visibility?: 'PUBLIC' | 'PRIVATE';

  @ApiProperty({ description: 'Classification level ID', required: false })
  @IsUUID()
  @IsOptional()
  classificationLevelId?: string;

  @ApiProperty({ description: 'Array of tag IDs', required: false })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tagIds?: string[];
}