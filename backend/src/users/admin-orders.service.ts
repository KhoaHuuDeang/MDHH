import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PaymentService } from '../payment/payment.service';
import {
  AdminOrdersQueryDto,
  UpdateOrderStatusDto,
  AdminOrderDto,
  AdminOrdersResponseDto,
  AdminOrderStatsDto,
  OrderStatus,
} from './admin-orders.dto';

@Injectable()
export class AdminOrdersService {
  constructor(
    private prisma: PrismaService,
    private paymentService: PaymentService
  ) {}

  async getOrders(query: AdminOrdersQueryDto): Promise<AdminOrdersResponseDto> {
    const { page = 1, limit = 10, status, user_id, start_date, end_date } = query;
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};
    if (status) where.status = status;
    if (user_id) where.user_id = user_id;
    if (start_date || end_date) {
      where.created_at = {};
      if (start_date) where.created_at.gte = new Date(start_date);
      if (end_date) where.created_at.lte = new Date(end_date);
    }

    // Execute queries in parallel
    const [orders, total] = await Promise.all([
      this.prisma.orders.findMany({
        where,
        skip,
        take: limit,
        orderBy: { created_at: 'desc' },
        include: {
          users: {
            select: {
              username: true,
              email: true,
            },
          },
          order_items: {
            include: {
              souvenirs: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      }),
      this.prisma.orders.count({ where }),
    ]);

    // Map to DTO
    const ordersDto: AdminOrderDto[] = orders.map((order) => ({
      id: order.id,
      user_id: order.user_id,
      username: order.users.username || 'N/A',
      user_email: order.users.email || 'N/A',
      total_amount: Number(order.total_amount),
      status: order.status as OrderStatus,
      payment_method: order.payment_method || undefined,
      payment_ref: order.payment_ref || undefined,
      created_at: order.created_at,
      updated_at: order.updated_at,
      order_items: order.order_items.map((item) => ({
        id: item.id,
        souvenir_id: item.souvenir_id,
        quantity: item.quantity,
        price: Number(item.price),
        souvenir_name: item.souvenirs.name,
      })),
    }));

    return {
      orders: ordersDto,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getOrderById(orderId: string) {
    const order = await this.prisma.orders.findUnique({
      where: { id: orderId },
      include: {
        users: {
          select: {
            username: true,
            email: true,
            displayname: true,
          },
        },
        order_items: {
          include: {
            souvenirs: true,
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    const orderDto: AdminOrderDto = {
      id: order.id,
      user_id: order.user_id,
      username: order.users.username || 'N/A',
      user_email: order.users.email || 'N/A',
      total_amount: Number(order.total_amount),
      status: order.status as OrderStatus,
      payment_method: order.payment_method || undefined,
      payment_ref: order.payment_ref || undefined,
      created_at: order.created_at,
      updated_at: order.updated_at,
      order_items: order.order_items.map((item) => ({
        id: item.id,
        souvenir_id: item.souvenir_id,
        quantity: item.quantity,
        price: Number(item.price),
        souvenir_name: item.souvenirs.name,
      })),
    };

    return {
      message: 'Order retrieved successfully',
      status: 200,
      result: orderDto,
    };
  }

  async updateOrderStatus(orderId: string, dto: UpdateOrderStatusDto) {
    const order = await this.prisma.orders.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    const updatedOrder = await this.prisma.orders.update({
      where: { id: orderId },
      data: {
        status: dto.status,
        updated_at: new Date(),
      },
      include: {
        users: {
          select: {
            username: true,
            email: true,
          },
        },
        order_items: {
          include: {
            souvenirs: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    const orderDto: AdminOrderDto = {
      id: updatedOrder.id,
      user_id: updatedOrder.user_id,
      username: updatedOrder.users.username || 'N/A',
      user_email: updatedOrder.users.email || 'N/A',
      total_amount: Number(updatedOrder.total_amount),
      status: updatedOrder.status as OrderStatus,
      payment_method: updatedOrder.payment_method || undefined,
      payment_ref: updatedOrder.payment_ref || undefined,
      created_at: updatedOrder.created_at,
      updated_at: updatedOrder.updated_at,
      order_items: updatedOrder.order_items.map((item) => ({
        id: item.id,
        souvenir_id: item.souvenir_id,
        quantity: item.quantity,
        price: Number(item.price),
        souvenir_name: item.souvenirs.name,
      })),
    };

    return {
      message: 'Order status updated successfully',
      status: 200,
      result: orderDto,
    };
  }

  async getOrderStats(): Promise<AdminOrderStatsDto> {
    // Use queryRaw for optimized statistics
    const stats = await this.prisma.$queryRaw<any[]>`
      SELECT
        COUNT(*)::int as "totalOrders",
        COALESCE(SUM(total_amount), 0)::int as "totalRevenue",
        (SELECT COUNT(*)::int FROM "orders" WHERE created_at >= NOW() - INTERVAL '7 days') as "recentOrders"
      FROM "orders"
    `;

    const ordersByStatus = await this.prisma.$queryRaw<any[]>`
      SELECT
        status,
        COUNT(*)::int as count,
        COALESCE(SUM(total_amount), 0)::int as "totalAmount"
      FROM "orders"
      GROUP BY status
      ORDER BY count DESC
    `;

    const result = stats[0];

    return {
      totalOrders: result.totalOrders,
      totalRevenue: result.totalRevenue,
      recentOrders: result.recentOrders,
      ordersByStatus: ordersByStatus.map((s) => ({
        status: s.status,
        count: s.count,
        totalAmount: s.totalAmount,
      })),
    };
  }
}
