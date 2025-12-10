import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LogType } from '@prisma/client';

@Injectable()
export class LogsService {
  constructor(private prisma: PrismaService) {}

  async getNotifications(userId: string, unreadOnly: boolean, page: number, limit: number) {
    const skip = (page - 1) * limit;

    const where = {
      user_id: userId,
      ...(unreadOnly && { is_read: false }),
    };

    const [logs, total] = await Promise.all([
      this.prisma.logs.findMany({
        where,
        include: {
          actor: {
            select: {
              id: true,
              displayname: true,
              username: true,
              avatar: true,
            },
          },
        },
        orderBy: { created_at: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.logs.count({ where }),
    ]);

    return {
      logs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async markAsRead(logId: string, userId: string) {
    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(logId)) {
      throw new NotFoundException('Log not found');
    }

    const log = await this.prisma.logs.findFirst({
      where: { id: logId, user_id: userId },
    });

    if (!log) {
      throw new NotFoundException('Log not found');
    }

    return this.prisma.logs.update({
      where: { id: logId },
      data: { is_read: true },
    });
  }

  async markAllAsRead(userId: string) {
    return this.prisma.logs.updateMany({
      where: { user_id: userId, is_read: false },
      data: { is_read: true },
    });
  }

  async createLog(data: {
    userId: string;
    actorId?: string;
    type: LogType;
    entityType?: string;
    entityId?: string;
    message?: string;
  }) {
    return this.prisma.logs.create({
      data: {
        user_id: data.userId,
        actor_id: data.actorId,
        type: data.type,
        entity_type: data.entityType,
        entity_id: data.entityId,
        message: data.message,
      },
    });
  }

  async getUserActivities(userId: string, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    const [activities, total] = await Promise.all([
      this.prisma.logs.findMany({
        where: { user_id: userId },
        include: {
          actor: {
            select: {
              id: true,
              displayname: true,
              username: true,
              avatar: true,
            },
          },
        },
        orderBy: { created_at: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.logs.count({ where: { user_id: userId } }),
    ]);

    return {
      activities,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getUnreadCount(userId: string) {
    const unreadCount = await this.prisma.logs.count({
      where: {
        user_id: userId,
        is_read: false,
      },
    });

    return { unreadCount };
  }
}
