import {
  Controller,
  Get,
  Post,
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
  EnableUserDto
} from './admin-users.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Admin - User Management')
@Controller('admin/users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

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
    const adminId = req.user.userId; // Extract admin ID from JWT
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
}