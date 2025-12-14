import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  Request
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import {
  AdminUsersQueryDto,
  AdminUsersResponseDto,
  DisableUserDto,
  EnableUserDto,
  UpdateUserRoleDto,
  AdminAnalyticsDto
} from './admin-users.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';

@ApiTags('Admin - User Management')
@Controller('admin/users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@ApiBearerAuth()
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('analytics')
  @ApiOperation({ summary: 'Get admin dashboard analytics' })
  @ApiResponse({
    status: 200,
    description: 'Analytics retrieved successfully',
    type: AdminAnalyticsDto
  })
  async getAnalytics() {
    return this.adminService.getAnalytics();
  }


  @Get('graph-data')
  @ApiOperation({ summary: 'Get graph data for dashboard' })
  @ApiResponse({
    status: 200,
    description: 'Graph data retrieved successfully'
  })
  async getGraphData() {
    return this.adminService.getGraphData();
  }

  @Get()
  @ApiOperation({ summary: 'Get users with hybrid pagination' })
  @ApiResponse({
    status: 200,
    description: 'Return paginated users list',
    type: AdminUsersResponseDto
  })
  async getUsers(@Query() query: AdminUsersQueryDto): Promise<AdminUsersResponseDto> {
    return this.adminService.getUsers(query);
  }

  @Post(':id/disable')
  @ApiOperation({ summary: 'Disable a user' })
  @ApiResponse({ status: 200, description: 'User disabled successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 400, description: 'User already disabled' })
  async disableUser(
    @Param('id') userId: string,
    @Body() disableUserDto: DisableUserDto,
    @Request() req: any
  ) {
    const adminId = req.user.userId;
    return this.adminService.disableUser(userId, adminId, disableUserDto);
  }

  @Post(':id/enable')
  @ApiOperation({ summary: 'Enable a user' })
  @ApiResponse({ status: 200, description: 'User enabled successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 400, description: 'User not disabled' })
  async enableUser(
    @Param('id') userId: string,
    @Body() enableUserDto: EnableUserDto,
    @Request() req: any
  ) {
    const adminId = req.user.userId;
    return this.adminService.enableUser(userId, adminId);
  }


  @Patch(':id/role')
  @ApiOperation({ summary: 'Update user role' })
  @ApiResponse({ status: 200, description: 'User role updated successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 400, description: 'Cannot change own role' })
  async updateUserRole(
    @Param('id') userId: string,
    @Body() updateUserRoleDto: UpdateUserRoleDto,
    @Request() req: any
  ) {
    const adminId = req.user.userId;
    return this.adminService.updateUserRole(userId, updateUserRoleDto.role, adminId);
  }
}