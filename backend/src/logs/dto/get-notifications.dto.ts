import { IsOptional, IsString, IsIn } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class GetNotificationsDto {
  @ApiPropertyOptional({
    description: 'Filter for unread notifications only',
    example: 'true',
    enum: ['true', 'false'],
  })
  @IsOptional()
  @IsString()
  @IsIn(['true', 'false'])
  unread?: string;

  @ApiPropertyOptional({
    description: 'Page number for pagination',
    example: '1',
    default: '1',
  })
  @IsOptional()
  @IsString()
  page?: string;

  @ApiPropertyOptional({
    description: 'Number of items per page',
    example: '20',
    default: '20',
  })
  @IsOptional()
  @IsString()
  limit?: string;
}
