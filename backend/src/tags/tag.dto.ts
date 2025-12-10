import { IsString, IsOptional, IsUUID, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTagDto {
  @ApiProperty({ example: 'Important' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'Mark important files' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 'uuid' })
  @IsUUID()
  @IsNotEmpty()
  levelId: string;
}

export class UpdateTagDto {
  @ApiProperty({ example: 'Updated Tag Name' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ example: 'Updated description' })
  @IsString()
  @IsOptional()
  description?: string;
}

export class TagResponseDto {
  id: string;
  name: string;
  description: string;
  level_id: string;
  created_at: Date;
}
