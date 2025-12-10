import { Controller, Get, Patch, Param, Query, Request, UseGuards, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { LogsService } from './logs.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GetNotificationsDto } from './dto/get-notifications.dto';
import { NotificationsResponseDto, LogDto } from './dto/log-response.dto';

/**
 * Convenience controller for notifications at /notifications endpoint
 * This aliases the /logs/notifications endpoints for better API ergonomics
 */
@ApiTags('Notifications')
@ApiBearerAuth()
@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly logsService: LogsService) {}

  @Get()
  @ApiOperation({
    summary: 'Get user notifications',
    description: 'Retrieve notifications for the authenticated user with optional filters and pagination'
  })
  @ApiResponse({
    status: 200,
    description: 'Notifications retrieved successfully',
    type: NotificationsResponseDto
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing authentication token'
  })
  async getNotifications(
    @Request() req: any,
    @Query() query: GetNotificationsDto,
  ) {
    const userId = req.user.userId || req.user.user_id;
    const isUnreadOnly = query.unread === 'true';
    const pageNum = query.page ? parseInt(query.page) : 1;
    const limitNum = query.limit ? parseInt(query.limit) : 20;

    const result = await this.logsService.getNotifications(userId, isUnreadOnly, pageNum, limitNum);

    return {
      message: 'Notifications retrieved successfully',
      status: HttpStatus.OK,
      result,
    };
  }

  @Get('unread-count')
  @ApiOperation({
    summary: 'Get unread notification count',
    description: 'Get count of unread notifications for the authenticated user'
  })
  @ApiResponse({
    status: 200,
    description: 'Unread count retrieved successfully',
    schema: {
      example: {
        message: 'Unread count retrieved successfully',
        status: 200,
        result: { unreadCount: 5 }
      }
    }
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing authentication token'
  })
  async getUnreadCount(@Request() req: any) {
    const userId = req.user.userId || req.user.user_id;
    const result = await this.logsService.getUnreadCount(userId);

    return {
      message: 'Unread count retrieved successfully',
      status: HttpStatus.OK,
      result,
    };
  }

  @Patch(':id/read')
  @ApiOperation({
    summary: 'Mark notification as read',
    description: 'Mark a specific notification as read for the authenticated user'
  })
  @ApiParam({
    name: 'id',
    description: 'Notification ID',
    example: '1c4718f5-c790-4bf4-8351-564a8bdfc511'
  })
  @ApiResponse({
    status: 200,
    description: 'Notification marked as read successfully',
    type: LogDto
  })
  @ApiResponse({
    status: 404,
    description: 'Notification not found'
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing authentication token'
  })
  async markAsRead(@Param('id') id: string, @Request() req: any) {
    const userId = req.user.userId || req.user.user_id;
    const result = await this.logsService.markAsRead(id, userId);

    return {
      message: 'Notification marked as read successfully',
      status: HttpStatus.OK,
      result,
    };
  }

  @Patch('read-all')
  @ApiOperation({
    summary: 'Mark all notifications as read',
    description: 'Mark all unread notifications as read for the authenticated user'
  })
  @ApiResponse({
    status: 200,
    description: 'All notifications marked as read successfully',
    schema: {
      example: {
        message: 'All notifications marked as read successfully',
        status: 200,
        result: { count: 5 }
      }
    }
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing authentication token'
  })
  async markAllAsRead(@Request() req: any) {
    const userId = req.user.userId || req.user.user_id;
    const result = await this.logsService.markAllAsRead(userId);

    return {
      message: 'All notifications marked as read successfully',
      status: HttpStatus.OK,
      result,
    };
  }
}
