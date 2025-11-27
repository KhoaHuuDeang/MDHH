import { IsOptional, IsString, IsNumber, IsBoolean, IsDateString, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class AdminUsersQueryDto {
  @ApiProperty({ required: false, description: 'Page number for offset pagination (1-20)' })
  @IsOptional()
  @Type(() => Number)
  page?: number;

  @ApiProperty({ required: false, description: 'Cursor for cursor-based pagination (base64 encoded)' })
  @IsOptional()
  @IsString()
  cursor?: string;

  @ApiProperty({ required: false, description: 'Search term for username, email, or displayname' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({ required: false, description: 'Number of items per page', default: 10 })
  @IsOptional()
  @Type(() => Number)
  limit?: number = 10;
}

export class AdminUserItemDto {
  @ApiProperty({ description: 'User ID' })
  id: string;

  @ApiProperty({ description: 'Username' })
  username: string;

  @ApiProperty({ description: 'Display name' })
  displayname: string;

  @ApiProperty({ description: 'Email address' })
  email: string;

  @ApiProperty({ description: 'User role' })
  role_name: string;

  @ApiProperty({ description: 'Account creation date' })
  created_at: Date;

  @ApiProperty({ description: 'Whether user is disabled' })
  is_disabled: boolean;

  @ApiProperty({ required: false, description: 'Disabled until date' })
  disabled_until?: Date;

  @ApiProperty({ required: false, description: 'Reason for disabling' })
  disabled_reason?: string;

  @ApiProperty({ required: false, description: 'Admin who disabled the user' })
  disabled_by?: string;

  @ApiProperty({ required: false, description: 'Date when user was disabled' })
  disabled_at?: Date;

  @ApiProperty({ description: 'OAuth providers connected', type: [String] })
  providers: string[];
}

export class AdminUsersResponseDto {
  @ApiProperty({ type: [AdminUserItemDto], description: 'List of users' })
  users: AdminUserItemDto[];

  @ApiProperty({ description: 'Pagination information' })
  pagination: {
    hasNext: boolean;
    hasPrevious: boolean;
    nextCursor?: string;
    prevCursor?: string;
    currentPage?: number;
    totalPages?: number;
    total?: number;
  };

  @ApiProperty({ description: 'Response metadata' })
  meta: {
    paginationType: 'offset' | 'cursor';
    searchActive: boolean;
  };
}

export class DisableUserDto {
  @ApiProperty({ required: false, description: 'Disable until specific date' })
  @IsOptional()
  @IsDateString()
  disabled_until?: string;

  @ApiProperty({ description: 'Reason for disabling the user' })
  @IsString()
  disabled_reason: string;
}

export class EnableUserDto {
  @ApiProperty({ required: false, description: 'Optional note about enabling' })
  @IsOptional()
  @IsString()
  note?: string;
}


export class UpdateUserRoleDto {
  @ApiProperty({ 
    description: 'New role for the user',
    enum: ['USER', 'ADMIN']
  })
  @IsEnum(['USER', 'ADMIN'])
  role: 'USER' | 'ADMIN';
}


export class AdminAnalyticsDto {
  @ApiProperty({ description: 'Total number of users' })
  totalUsers: number;

  @ApiProperty({ description: 'Total number of uploads/resources' })
  totalUploads: number;

  @ApiProperty({ description: 'Total number of comments' })
  totalComments: number;

  @ApiProperty({ description: 'Total number of folders' })
  totalFolders: number;

  @ApiProperty({ description: 'Number of active users (last 30 days)' })
  activeUsers: number;

  @ApiProperty({ description: 'Number of disabled users' })
  disabledUsers: number;

  @ApiProperty({ description: 'Statistics by user role' })
  usersByRole: {
    role: string;
    count: number;
  }[];

  @ApiProperty({ description: 'Recent activity counts (last 7 days)' })
  recentActivity: {
    newUsers: number;
    newUploads: number;
    newComments: number;
  };
}
