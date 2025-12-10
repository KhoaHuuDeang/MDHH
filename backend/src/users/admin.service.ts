import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  AdminUsersQueryDto,
  AdminUsersResponseDto,
  AdminUserItemDto,
  DisableUserDto,
  EnableUserDto
} from './admin-users.dto';

@Injectable()
export class AdminService {
  private readonly OFFSET_PAGE_LIMIT = 20;
  private readonly DEFAULT_LIMIT = 10;

  constructor(private prisma: PrismaService) {}

  async getUsers(query: AdminUsersQueryDto): Promise<AdminUsersResponseDto> {
    const { page, cursor, search, limit = this.DEFAULT_LIMIT } = query;
    
    // Determine pagination strategy
    const useOffset = !cursor && (!page || page <= this.OFFSET_PAGE_LIMIT);
    
    if (useOffset) {
      return this.getUsersWithOffset(page || 1, limit, search);
    } else {
      return this.getUsersWithCursor(cursor, limit, search);
    }
  }

  private async getUsersWithOffset(page: number, limit: number, search?: string) {
    const offset = (page - 1) * limit;
    
    const whereClause = this.buildWhereClause(search);
    const orderBy = this.buildOrderBy();
    
    const [users, total] = await Promise.all([
      this.prisma.users.findMany({
        where: whereClause,
        select: this.getUserSelectFields(),
        orderBy,
        skip: offset,
        take: limit,
      }),
      this.prisma.users.count({ where: whereClause })
    ]);

    const totalPages = Math.ceil(total / limit);
    
    return {
      users: await this.enhanceUsersWithProviders(users),
      pagination: {
        hasNext: page < totalPages,
        hasPrevious: page > 1,
        currentPage: page,
        totalPages,
        total,
        ...(page === this.OFFSET_PAGE_LIMIT && page < totalPages && {
          nextCursor: this.createCursor(users[users.length - 1])
        })
      },
      meta: {
        paginationType: 'offset' as const,
        searchActive: !!search
      }
    };
  }

  private async getUsersWithCursor(cursor: string | undefined, limit: number, search?: string) {
    const cursorData = cursor ? this.parseCursor(cursor) : null;
    
    const whereClause = {
      ...this.buildWhereClause(search),
      ...(cursorData && {
        OR: [
          { created_at: { lt: cursorData.created_at } },
          {
            created_at: cursorData.created_at,
            id: { lt: cursorData.id }
          }
        ]
      })
    };

    const users = await this.prisma.users.findMany({
      where: whereClause,
      select: this.getUserSelectFields(),
      orderBy: this.buildOrderBy(),
      take: limit + 1, // +1 to check hasNext
    });

    const hasNext = users.length > limit;
    if (hasNext) users.pop();

    return {
      users: await this.enhanceUsersWithProviders(users),
      pagination: {
        hasNext,
        hasPrevious: !!cursor,
        ...(hasNext && { nextCursor: this.createCursor(users[users.length - 1]) }),
        ...(cursor && { prevCursor: this.createPrevCursor(users[0]) })
      },
      meta: {
        paginationType: 'cursor' as const,
        searchActive: !!search
      }
    };
  }

  private createCursor(user: any): string {
    return Buffer.from(`${user.created_at.toISOString()}:${user.id}`).toString('base64');
  }

  private createPrevCursor(user: any): string {
    // For previous cursor, we need to reverse the logic
    return Buffer.from(`${user.created_at.toISOString()}:${user.id}:prev`).toString('base64');
  }

  private parseCursor(cursor: string): { created_at: Date; id: string; direction?: string } {
    const decoded = Buffer.from(cursor, 'base64').toString();
    const parts = decoded.split(':');
    return {
      created_at: new Date(parts[0]),
      id: parts[1],
      direction: parts[2] || 'next'
    };
  }

  private buildWhereClause(search?: string) {
    if (!search) return {};

    return {
      OR: [
        { username: { contains: search, mode: 'insensitive' as const } },
        { email: { contains: search, mode: 'insensitive' as const } },
        { displayname: { contains: search, mode: 'insensitive' as const } }
      ]
    };
  }

  private buildOrderBy() {
    return [
      { created_at: 'desc' as const },
      { id: 'desc' as const }
    ];
  }

  private getUserSelectFields() {
    return {
      id: true,
      username: true,
      displayname: true,
      email: true,
      created_at: true,
      is_disabled: true,
      disabled_until: true,
      disabled_reason: true,
      disabled_by: true,
      disabled_at: true,
      roles: {
        select: {
          name: true
        }
      },
      accounts: {
        select: {
          provider: true
        }
      }
    };
  }

  private async enhanceUsersWithProviders(users: any[]): Promise<AdminUserItemDto[]> {
    return users.map(user => ({
      id: user.id,
      username: user.username || '',
      displayname: user.displayname || '',
      email: user.email || '',
      role_name: user.roles.name,
      created_at: user.created_at,
      is_disabled: user.is_disabled || false,
      disabled_until: user.disabled_until,
      disabled_reason: user.disabled_reason,
      disabled_by: user.disabled_by,
      disabled_at: user.disabled_at,
      providers: user.accounts?.map((acc: any) => acc.provider).filter(Boolean) || []
    }));
  }

  async disableUser(userId: string, adminId: string, disableUserDto: DisableUserDto) {
    // Verify user exists
    const user = await this.prisma.users.findUnique({
      where: { id: userId },
      select: { id: true, is_disabled: true }
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.is_disabled) {
      throw new Error('User is already disabled');
    }

    return this.prisma.users.update({
      where: { id: userId },
      data: {
        is_disabled: true,
        disabled_until: disableUserDto.disabled_until ? new Date(disableUserDto.disabled_until) : null,
        disabled_reason: disableUserDto.disabled_reason,
        disabled_by: adminId,
        disabled_at: new Date(),
        updated_at: new Date()
      },
      select: this.getUserSelectFields()
    });
  }

  async enableUser(userId: string, adminId: string) {
    // Verify user exists
    const user = await this.prisma.users.findUnique({
      where: { id: userId },
      select: { id: true, is_disabled: true }
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.is_disabled) {
      throw new Error('User is not disabled');
    }

    return this.prisma.users.update({
      where: { id: userId },
      data: {
        is_disabled: false,
        disabled_until: null,
        disabled_reason: null,
        disabled_by: null,
        disabled_at: null,
        updated_at: new Date()
      },
      select: this.getUserSelectFields()
    });
  }


  async updateUserRole(userId: string, newRole: 'USER' | 'ADMIN', adminId: string) {
    // Verify user exists
    const user = await this.prisma.users.findUnique({
      where: { id: userId },
      select: { id: true, role_id: true }
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Prevent admin from changing their own role
    if (userId === adminId) {
      throw new Error('Cannot change your own role');
    }

    // Get the role ID for the new role
    const role = await this.prisma.roles.findUnique({
      where: { name: newRole }
    });

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    // Update user role
    return this.prisma.users.update({
      where: { id: userId },
      data: {
        role_id: role.id,
        updated_at: new Date()
      },
      select: this.getUserSelectFields()
    });
  }


  async getAnalytics() {
    const analytics = await this.prisma.$queryRaw<any[]>`
      SELECT 
        -- Total counts
        (SELECT COUNT(*)::int FROM "users") as "totalUsers",
        (SELECT COUNT(*)::int FROM "uploads") as "totalUploads",
        (SELECT COUNT(*)::int FROM "comments") as "totalComments",
        (SELECT COUNT(*)::int FROM "folders") as "totalFolders",
        
        -- Active users (last 30 days)
        (SELECT COUNT(DISTINCT u.id)::int 
         FROM "users" u
         LEFT JOIN "uploads" up ON up.user_id = u.id
         LEFT JOIN "comments" c ON c.user_id = u.id
         WHERE up.created_at >= NOW() - INTERVAL '30 days'
            OR c.created_at >= NOW() - INTERVAL '30 days'
        ) as "activeUsers",
        
        -- Disabled users
        (SELECT COUNT(*)::int FROM "users" WHERE is_disabled = true) as "disabledUsers",
        
        -- Recent activity (last 7 days)
        (SELECT COUNT(*)::int FROM "users" WHERE created_at >= NOW() - INTERVAL '7 days') as "newUsers",
        (SELECT COUNT(*)::int FROM "uploads" WHERE created_at >= NOW() - INTERVAL '7 days') as "newUploads",
        (SELECT COUNT(*)::int FROM "comments" WHERE created_at >= NOW() - INTERVAL '7 days') as "newComments"
    `;

    const usersByRole = await this.prisma.$queryRaw<any[]>`
      SELECT 
        r.name as role,
        COUNT(u.id)::int as count
      FROM "roles" r
      LEFT JOIN "users" u ON u.role_id = r.id
      GROUP BY r.name
      ORDER BY count DESC
    `;

    const stats = analytics[0];

    return {
      message: 'Analytics retrieved successfully',
      status: 200,
      result: {
        totalUsers: stats.totalUsers,
        totalUploads: stats.totalUploads,
        totalComments: stats.totalComments,
        totalFolders: stats.totalFolders,
        activeUsers: stats.activeUsers,
        disabledUsers: stats.disabledUsers,
        usersByRole: usersByRole,
        recentActivity: {
          newUsers: stats.newUsers,
          newUploads: stats.newUploads,
          newComments: stats.newComments,
        },
      },
    };
  }
}