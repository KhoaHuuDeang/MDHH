import {
  Controller,
  Get,
  Patch,
  Param,
  Query,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AdminOrdersService } from './admin-orders.service';
import {
  AdminOrdersQueryDto,
  UpdateOrderStatusDto,
  AdminOrdersResponseDto,
  AdminOrderStatsDto,
} from './admin-orders.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';

@ApiTags('Admin - Order Management')
@Controller('admin/orders')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@ApiBearerAuth()
export class AdminOrdersController {
  constructor(private readonly adminOrdersService: AdminOrdersService) {}

  @Get()
  @ApiOperation({ summary: 'Get all orders with pagination and filters' })
  @ApiResponse({
    status: 200,
    description: 'Orders retrieved successfully',
    type: AdminOrdersResponseDto,
  })
  async getOrders(@Query() query: AdminOrdersQueryDto) {
    const result = await this.adminOrdersService.getOrders(query);
    return {
      message: 'Orders retrieved successfully',
      status: 200,
      result,
    };
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get order statistics' })
  @ApiResponse({
    status: 200,
    description: 'Order stats retrieved successfully',
    type: AdminOrderStatsDto,
  })
  async getOrderStats() {
    const result = await this.adminOrdersService.getOrderStats();
    return {
      message: 'Order statistics retrieved successfully',
      status: 200,
      result,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get order details by ID' })
  @ApiResponse({
    status: 200,
    description: 'Order details retrieved successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Order not found',
  })
  async getOrderById(@Param('id') id: string) {
    return this.adminOrdersService.getOrderById(id);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update order status' })
  @ApiResponse({
    status: 200,
    description: 'Order status updated successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Order not found',
  })
  async updateOrderStatus(
    @Param('id') id: string,
    @Body() dto: UpdateOrderStatusDto
  ) {
    return this.adminOrdersService.updateOrderStatus(id, dto);
  }
}
