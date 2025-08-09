import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { CreateFolderDto, UpdateFolderDto } from './folders.dto';

@Injectable()
export class FoldersService {
  constructor(private prisma: PrismaService) {}

  async getUserFolders(userId: string) {
    return this.prisma.folders.findMany({
      where: { 
        user_id: userId,
      },
      include: {
        classification_levels: {
          select: { id: true, name: true }
        },
        folder_tags: {
          include: {
            tags: {
              select: { id: true, name: true }
            }
          }
        }
      },
      orderBy: { created_at: 'desc' }
    });
  }

  async create(createFolderDto: CreateFolderDto, userId: string) {
    // Start transaction for folder + tags
    return this.prisma.$transaction(async (tx) => {
      // Create folder
      const folder = await tx.folders.create({
        data: {
          name: createFolderDto.name,
          description: createFolderDto.description,
          visibility: createFolderDto.visibility || 'PUBLIC',
          user_id: userId,
          classification_level_id: createFolderDto.classificationLevelId,
        }
      });

      // Add tags if provided
      if (createFolderDto.tagIds && createFolderDto.tagIds.length > 0) {
        await tx.folder_tags.createMany({
          data: createFolderDto.tagIds.map(tagId => ({
            folder_id: folder.id,
            tag_id: tagId
          }))
        });
      }

      // Return folder with relations
      return tx.folders.findUnique({
        where: { id: folder.id },
        include: {
          classification_levels: true,
          folder_tags: {
            include: { tags: true }
          }
        }
      });
    });
  }

  async findOne(id: string, userId: string) {
    const folder = await this.prisma.folders.findFirst({
      where: { 
        id, 
        user_id: userId,
      },
      include: {
        classification_levels: true,
        folder_tags: {
          include: { tags: true }
        }
      }
    });

    if (!folder) {
      throw new NotFoundException('Folder not found');
    }

    return folder;
  }

  async update(id: string, updateFolderDto: UpdateFolderDto, userId: string) {
    const folder = await this.findOne(id, userId);

    return this.prisma.$transaction(async (tx) => {
      // Update folder
      const updatedFolder = await tx.folders.update({
        where: { id },
        data: {
          name: updateFolderDto.name,
          description: updateFolderDto.description,
          visibility: updateFolderDto.visibility,
          classification_level_id: updateFolderDto.classificationLevelId,
        }
      });

      // Update tags if provided
      if (updateFolderDto.tagIds !== undefined) {
        // Remove existing tags
        await tx.folder_tags.deleteMany({
          where: { folder_id: id }
        });

        // Add new tags
        if (updateFolderDto.tagIds.length > 0) {
          await tx.folder_tags.createMany({
            data: updateFolderDto.tagIds.map(tagId => ({
              folder_id: id,
              tag_id: tagId
            }))
          });
        }
      }

      return tx.folders.findUnique({
        where: { id },
        include: {
          classification_levels: true,
          folder_tags: {
            include: { tags: true }
          }
        }
      });
    });
  }
}