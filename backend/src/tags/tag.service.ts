import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class TagsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.tags.findMany({
      orderBy: { name: 'asc' },
      include: {
        classification_levels: {
          select: { id: true, name: true }
        }
      }
    });
  }

  async findByLevel(levelId: string) {
    return this.prisma.tags.findMany({
      where: { level_id: levelId },
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        description: true,
        level_id: true
      }
    });
  }

  async create(createTagDto: { name: string; description?: string; levelId: string }) {
    return this.prisma.tags.create({
      data: {
        name: createTagDto.name,
        description: createTagDto.description,
        level_id: createTagDto.levelId,
      }
    });
  }
}