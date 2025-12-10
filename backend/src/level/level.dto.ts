import { IsString, IsOptional, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateClassificationDto {
  @ApiProperty({ example: 'Confidential' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'Only for authorized access' })
  @IsString()
  @IsOptional()
  description?: string;
}

export class UpdateClassificationDto {
  @ApiProperty({ example: 'Confidential Updated' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ example: 'Updated description' })
  @IsString()
  @IsOptional()
  description?: string;
}

export class ClassificationResponseDto {
  id: string;
  name: string;
  description: string;
  created_at: Date;
  tags?: any[];
}
