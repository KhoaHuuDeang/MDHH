import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LogsService } from '../logs/logs.service';
import {
  AdminUploadsQueryDto,
  AdminUploadsResponseDto,
  AdminUploadItemDto,
  DeleteUploadDto,
  AdminCommentsQueryDto,
  AdminCommentsResponseDto,
  AdminCommentItemDto,
  DeleteCommentDto,
  AdminFoldersQueryDto,
  AdminFoldersResponseDto,
  AdminFolderItemDto,
  DeleteFolderDto,
} from './admin-moderation.dto';

@Injectable()
export class AdminModerationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logsService: LogsService,
  ) {}

  // ========== UPLOADS MODERATION ==========
  async getUploads(query: AdminUploadsQueryDto): Promise<AdminUploadsResponseDto> {
    const page = query.page || 1;
    const limit = Math.min(query.limit || 20, 100);
    const skip = (page - 1) * limit;
    const sortBy = query.sortBy || 'created_at';
    const sortOrder = query.sortOrder || 'desc';

    const where: any = {};
    if (query.search) {
      where.OR = [
        { file_name: { contains: query.search, mode: 'insensitive' } },
        { resources: { title: { contains: query.search, mode: 'insensitive' } } },
      ];
    }
    if (query.status) {
      where.status = query.status;
    }
    if (query.moderation_status) {
      where.moderation_status = query.moderation_status;
    }

    const [uploads, total] = await Promise.all([
      this.prisma.uploads.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        select: {
          id: true,
          user_id: true,
          resource_id: true,
          file_name: true,
          mime_type: true,
          file_size: true,
          s3_key: true,
          status: true,
          moderation_status: true,
          moderation_reason: true,
          moderated_by: true,
          moderated_at: true,
          created_at: true,
          uploaded_at: true,
          title: true,
          description: true,
          visibility: true,
          users: {
            select: {
              id: true,
              username: true,
              email: true,
            },
          },
          resources: {
            select: {
              id: true,
              title: true,
            },
          },
        },
      }),
      this.prisma.uploads.count({ where }),
    ]);

    const items: AdminUploadItemDto[] = uploads.map((upload) => ({
      id: upload.id,
      user_id: upload.user_id,
      resource_id: upload.resource_id,
      file_name: upload.file_name,
      mime_type: upload.mime_type,
      file_size: upload.file_size,
      s3_key: upload.s3_key,
      status: upload.status,
      moderation_status: upload.moderation_status,
      moderation_reason: upload.moderation_reason,
      moderated_by: upload.moderated_by,
      moderated_at: upload.moderated_at,
      created_at: upload.created_at,
      uploaded_at: upload.uploaded_at,
      title: upload.title,
      description: upload.description,
      visibility: upload.visibility,
      user: upload.users
        ? {
            id: upload.users.id,
            username: upload.users.username,
            email: upload.users.email,
          }
        : undefined,
      resource: upload.resources
        ? {
            id: upload.resources.id,
            title: upload.resources.title,
          }
        : undefined,
    }));

    return {
      uploads: items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async deleteUpload(dto: DeleteUploadDto): Promise<{ message: string; result: any }> {
    const upload = await this.prisma.uploads.findUnique({
      where: { id: dto.uploadId },
    });

    if (!upload) {
      throw new NotFoundException('Upload not found');
    }

    const deleted = await this.prisma.uploads.delete({
      where: { id: dto.uploadId },
    });

    return {
      message: `Upload deleted successfully${dto.reason ? `: ${dto.reason}` : ''}`,
      result: deleted,
    };
  }

  async flagUpload(uploadId: string, reason: string, userId: string): Promise<{ message: string; result: any }> {
    const upload = await this.prisma.uploads.findUnique({
      where: { id: uploadId },
    });

    if (!upload) {
      throw new NotFoundException('Upload not found');
    }

    // Workflow: flag behavior depends on moderation_status
    // If APPROVED: delete the upload (dangerous content in approved file)
    // If REJECTED: clear the flag status (already rejected)
    // Otherwise: set status to FLAGGED

    if (upload.moderation_status === 'APPROVED') {
      // Delete approved files that are flagged (dangerous content)
      await this.prisma.uploads.delete({
        where: { id: uploadId },
      });

      return {
        message: `Approved upload deleted due to flag: ${reason}`,
        result: { id: uploadId, deleted: true },
      };
    }

    if (upload.moderation_status === 'REJECTED') {
      // Clear flag status for rejected files (already filtered)
      const updated = await this.prisma.uploads.update({
        where: { id: uploadId },
        data: {
          moderation_status: 'REJECTED', // Keep as rejected
          moderation_reason: upload.moderation_reason, // Keep original rejection reason
          moderated_by: upload.moderated_by, // Keep original moderator
          moderated_at: upload.moderated_at, // Keep original date
        },
      });

      return {
        message: `Flag cleared for rejected upload (file already filtered)`,
        result: updated,
      };
    }

    // For PENDING_APPROVAL or FLAGGED: set status to FLAGGED
    const updated = await this.prisma.uploads.update({
      where: { id: uploadId },
      data: {
        moderation_status: 'FLAGGED',
        moderation_reason: reason,
        moderated_by: userId,
        moderated_at: new Date(),
      },
    });

    return {
      message: `Upload flagged: ${reason}`,
      result: updated,
    };
  }


  async approveUpload(uploadId: string, adminId: string): Promise<{ message: string; status: string; result: any }> {
    const upload = await this.prisma.uploads.findUnique({
      where: { id: uploadId },
    });

    if (!upload) {
      throw new NotFoundException('Upload not found');
    }

    const updated = await this.prisma.uploads.update({
      where: { id: uploadId },
      data: {
        moderation_status: 'APPROVED',
        moderated_by: adminId,
        moderated_at: new Date(),
      },
    });

    // Create APPROVED notification log
    if (upload.user_id) {
      await this.logsService.createLog({
        userId: upload.user_id,
        actorId: adminId,
        type: 'APPROVED',
        entityType: 'upload',
        entityId: uploadId,
        message: `Your upload "${upload.file_name}" has been approved`,
      });
    }

    return {
      message: 'Upload approved successfully',
      status: 'success',
      result: updated,
    };
  }

  async rejectUpload(uploadId: string, adminId: string, reason: string): Promise<{ message: string; status: string; result: any }> {
    const upload = await this.prisma.uploads.findUnique({
      where: { id: uploadId },
    });

    if (!upload) {
      throw new NotFoundException('Upload not found');
    }

    const updated = await this.prisma.uploads.update({
      where: { id: uploadId },
      data: {
        moderation_status: 'REJECTED',
        moderation_reason: reason,
        moderated_by: adminId,
        moderated_at: new Date(),
      },
    });

    // Create DECLINED notification log
    if (upload.user_id) {
      await this.logsService.createLog({
        userId: upload.user_id,
        actorId: adminId,
        type: 'DECLINED',
        entityType: 'upload',
        entityId: uploadId,
        message: `Your upload "${upload.file_name}" was rejected. Reason: ${reason}`,
      });
    }

    return {
      message: 'Upload rejected successfully',
      status: 'success',
      result: updated,
    };
  }

  // ========== COMMENTS MODERATION ==========
  async getComments(query: AdminCommentsQueryDto): Promise<AdminCommentsResponseDto> {
    const page = query.page || 1;
    const limit = Math.min(query.limit || 20, 100);
    const skip = (page - 1) * limit;
    const sortBy = query.sortBy || 'created_at';
    const sortOrder = query.sortOrder || 'desc';

    const where: any = {};
    if (query.search) {
      where.OR = [
        { content: { contains: query.search, mode: 'insensitive' } },
        { users: { username: { contains: query.search, mode: 'insensitive' } } },
        { users: { email: { contains: query.search, mode: 'insensitive' } } },
      ];
    }
    if (query.is_deleted !== undefined) {
      where.is_deleted = query.is_deleted;
    }

    const [comments, total] = await Promise.all([
      this.prisma.comments.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        select: {
          id: true,
          user_id: true,
          resource_id: true,
          folder_id: true,
          parent_id: true,
          content: true,
          is_deleted: true,
          created_at: true,
          updated_at: true,
          users: {
            select: {
              id: true,
              username: true,
              email: true,
            },
          },
          resources: {
            select: {
              id: true,
              title: true,
            },
          },
          folders: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      }),
      this.prisma.comments.count({ where }),
    ]);

    const items: AdminCommentItemDto[] = comments.map((comment) => ({
      id: comment.id,
      user_id: comment.user_id,
      resource_id: comment.resource_id,
      folder_id: comment.folder_id,
      parent_id: comment.parent_id,
      content: comment.content,
      is_deleted: comment.is_deleted,
      created_at: comment.created_at,
      updated_at: comment.updated_at,
      user: comment.users
        ? {
            id: comment.users.id,
            username: comment.users.username,
            email: comment.users.email,
          }
        : undefined,
      resource: comment.resources
        ? {
            id: comment.resources.id,
            title: comment.resources.title,
          }
        : undefined,
      folder: comment.folders
        ? {
            id: comment.folders.id,
            name: comment.folders.name,
          }
        : undefined,
    }));

    return {
      comments: items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async deleteComment(dto: DeleteCommentDto): Promise<{ message: string }> {
    const comment = await this.prisma.comments.findUnique({
      where: { id: dto.commentId },
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    await this.prisma.comments.update({
      where: { id: dto.commentId },
      data: { is_deleted: true, content: '[Deleted by admin]' },
    });

    return {
      message: `Comment deleted successfully${dto.reason ? `: ${dto.reason}` : ''}`,
    };
  }

  // ========== FOLDERS MODERATION ==========
  async getFolders(query: AdminFoldersQueryDto): Promise<AdminFoldersResponseDto> {
    const page = query.page || 1;
    const limit = Math.min(query.limit || 20, 100);
    const skip = (page - 1) * limit;
    const sortBy = query.sortBy || 'created_at';
    const sortOrder = query.sortOrder || 'desc';

    const where: any = {};
    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
        { users: { username: { contains: query.search, mode: 'insensitive' } } },
      ];
    }
    if (query.visibility) {
      where.visibility = query.visibility;
    }

    const [folders, total] = await Promise.all([
      this.prisma.folders.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        select: {
          id: true,
          name: true,
          description: true,
          visibility: true,
          user_id: true,
          classification_level_id: true,
          created_at: true,
          updated_at: true,
          users: {
            select: {
              id: true,
              username: true,
              email: true,
            },
          },
          classification_levels: {
            select: {
              id: true,
              name: true,
            },
          },
          _count: {
            select: {
              folder_files: true,
              comments: true,
              follows: true,
            },
          },
        },
      }),
      this.prisma.folders.count({ where }),
    ]);

    const items: AdminFolderItemDto[] = folders.map((folder) => ({
      id: folder.id,
      name: folder.name,
      description: folder.description,
      visibility: folder.visibility,
      user_id: folder.user_id,
      classification_level_id: folder.classification_level_id,
      created_at: folder.created_at,
      updated_at: folder.updated_at,
      user: folder.users
        ? {
            id: folder.users.id,
            username: folder.users.username,
            email: folder.users.email,
          }
        : undefined,
      classification_level: folder.classification_levels
        ? {
            id: folder.classification_levels.id,
            name: folder.classification_levels.name,
          }
        : undefined,
      _count: folder._count,
    }));

    return {
      folders: items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async deleteFolder(dto: DeleteFolderDto): Promise<{ message: string }> {
    const folder = await this.prisma.folders.findUnique({
      where: { id: dto.folderId },
    });

    if (!folder) {
      throw new NotFoundException('Folder not found');
    }

    // Delete all related data in the correct order to avoid foreign key constraints
    // 1. Delete notification targets related to this folder
    await this.prisma.notification_targets.deleteMany({
      where: { folder_id: dto.folderId },
    });

    // 2. Delete ratings for this folder (ratings_folders has Cascade, but let's be explicit)
    await this.prisma.ratings_folders.deleteMany({
      where: { folder_id: dto.folderId },
    });

    // 3. Delete follows for this folder
    await this.prisma.follows.deleteMany({
      where: { folder_id: dto.folderId },
    });

    // 4. Delete comments on this folder
    await this.prisma.comments.deleteMany({
      where: { folder_id: dto.folderId },
    });

    // 5. Delete folder-file associations
    await this.prisma.folder_files.deleteMany({
      where: { folder_id: dto.folderId },
    });

    // 6. Delete folder-tag associations
    await this.prisma.folder_tags.deleteMany({
      where: { folder_id: dto.folderId },
    });

    // 7. Finally, delete the folder itself
    await this.prisma.folders.delete({
      where: { id: dto.folderId },
    });

    return {
      message: `Folder deleted successfully${dto.reason ? `: ${dto.reason}` : ''}`,
    };
  }
}
