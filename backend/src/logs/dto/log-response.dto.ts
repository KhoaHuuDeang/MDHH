import { ApiProperty } from '@nestjs/swagger';
import { LogType } from '@prisma/client';

export class ActorDto {
  @ApiProperty({ example: 'uuid' })
  id: string;

  @ApiProperty({ example: 'John Doe' })
  displayname: string;

  @ApiProperty({ example: 'johndoe' })
  username: string;

  @ApiProperty({ example: 'https://example.com/avatar.jpg', nullable: true })
  avatar: string | null;
}

export class LogDto {
  @ApiProperty({ example: 'uuid' })
  id: string;

  @ApiProperty({ example: 'uuid' })
  user_id: string;

  @ApiProperty({ example: 'uuid', nullable: true })
  actor_id: string | null;

  @ApiProperty({ enum: LogType, example: LogType.COMMENT })
  type: LogType;

  @ApiProperty({ example: 'resource', nullable: true })
  entity_type: string | null;

  @ApiProperty({ example: 'uuid', nullable: true })
  entity_id: string | null;

  @ApiProperty({ example: 'New comment on your resource', nullable: true })
  message: string | null;

  @ApiProperty({ example: false })
  is_read: boolean;

  @ApiProperty({ example: '2025-11-23T17:12:44.694Z' })
  created_at: Date;

  @ApiProperty({ type: ActorDto, nullable: true })
  actor?: ActorDto | null;
}

export class PaginationDto {
  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 20 })
  limit: number;

  @ApiProperty({ example: 100 })
  total: number;

  @ApiProperty({ example: 5 })
  totalPages: number;
}

export class NotificationsResponseDto {
  @ApiProperty({ type: [LogDto] })
  logs: LogDto[];

  @ApiProperty({ type: PaginationDto })
  pagination: PaginationDto;
}
