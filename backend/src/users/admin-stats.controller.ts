import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { AdminAnalyticsDto } from './admin-users.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';

/**
 * Convenience controller for admin stats/analytics at /admin/stats endpoint
 * This aliases the /admin/users/analytics endpoint for better API ergonomics
 */
@ApiTags('Admin - Stats')
@Controller('admin/stats')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@ApiBearerAuth()
export class AdminStatsController {
  constructor(private readonly adminService: AdminService) {}

  @Get()
  @ApiOperation({ summary: 'Get admin dashboard analytics and stats' })
  @ApiResponse({
    status: 200,
    description: 'Analytics retrieved successfully',
    type: AdminAnalyticsDto
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing authentication token'
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin role required'
  })
  async getStats() {
    return this.adminService.getAnalytics();
  }
}
