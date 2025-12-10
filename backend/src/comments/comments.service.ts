import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

interface CreateCommentDto {
  userId: string;
  resourceId?: string;
  folderId?: string;
  content: string;
  parentId?: string;
}

import { LogsService } from '../logs/logs.service';

@Injectable()
export class CommentsService {
  constructor(
    private prisma: PrismaService,
    private logsService: LogsService,
  ) {}

  async getResourceComments(resourceId: string) {
    const comments = await this.prisma.comments.findMany({
      where: {
        resource_id: resourceId,
        parent_id: null,
        is_deleted: false,
      },
      include: {
        users: {
          select: {
            id: true,
            displayname: true,
            username: true,
            avatar: true,
          },
        },
        other_comments: {
          where: { is_deleted: false },
          include: {
            users: {
              select: {
                id: true,
                displayname: true,
                username: true,
                avatar: true,
              },
            },
          },
          orderBy: { created_at: 'asc' },
        },
      },
      orderBy: { created_at: 'desc' },
    });

    return comments;
  }

  async getFolderComments(folderId: string) {
    const comments = await this.prisma.comments.findMany({
      where: {
        folder_id: folderId,
        parent_id: null,
        is_deleted: false,
      },
      include: {
        users: {
          select: {
            id: true,
            displayname: true,
            username: true,
            avatar: true,
          },
        },
        other_comments: {
          where: { is_deleted: false },
          include: {
            users: {
              select: {
                id: true,
                displayname: true,
                username: true,
                avatar: true,
              },
            },
          },
          orderBy: { created_at: 'asc' },
        },
      },
      orderBy: { created_at: 'desc' },
    });

    return comments;
  }

  async createComment(dto: CreateCommentDto) {
    const comment = await this.prisma.comments.create({
      data: {
        user_id: dto.userId,
        resource_id: dto.resourceId,
        folder_id: dto.folderId,
        content: dto.content,
        parent_id: dto.parentId,
        is_deleted: false,
      },
      include: {
        users: {
          select: {
            id: true,
            displayname: true,
            username: true,
            avatar: true,
          },
        },
      },
    });

    // Create notification log
    if (dto.resourceId) {
      const resource = await this.prisma.resources.findUnique({
        where: { id: dto.resourceId },
        include: { uploads: { select: { user_id: true } } },
      });
      const ownerId = resource?.uploads[0]?.user_id;
      
      if (ownerId && ownerId !== dto.userId) {
        await this.logsService.createLog({
          userId: ownerId,
          actorId: dto.userId,
          type: 'COMMENT',
          entityType: 'resource',
          entityId: dto.resourceId,
        });
      }
    } else if (dto.folderId) {
      const folder = await this.prisma.folders.findUnique({
        where: { id: dto.folderId },
        select: { user_id: true },
      });
      
      if (folder?.user_id && folder.user_id !== dto.userId) {
        await this.logsService.createLog({
          userId: folder.user_id,
          actorId: dto.userId,
          type: 'COMMENT',
          entityType: 'folder',
          entityId: dto.folderId,
        });
      }
    }

    return comment;
  }
}
