import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateTagDto, UpdateTagDto } from './tag.dto';

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

  async findOne(id: string) {
    return this.prisma.tags.findUnique({
      where: { id },
      include: { classification_levels: true }
    });
  }

  async create(createTagDto: CreateTagDto) {
    try {
      return await this.prisma.tags.create({
        data: {
          name: createTagDto.name,
          description: createTagDto.description,
          level_id: createTagDto.levelId,
        }
      });
    } catch (error: any) {
      if (error.code === 'P2002') {
        throw new BadRequestException('Tag name already exists for this classification level');
      }
      throw error;
    }
  }

  async update(id: string, updateTagDto: UpdateTagDto) {
    try {
      return await this.prisma.tags.update({
        where: { id },
        data: {
          name: updateTagDto.name,
          description: updateTagDto.description,
        }
      });
    } catch (error: any) {
      if (error.code === 'P2002') {
        throw new BadRequestException('Tag name already exists for this classification level');
      }
      if (error.code === 'P2025') {
        throw new BadRequestException('Tag not found');
      }
      throw error;
    }
  }

  async delete(id: string) {
    try {
      return await this.prisma.tags.delete({
        where: { id }
      });
    } catch (error: any) {
      if (error.code === 'P2025') {
        throw new BadRequestException('Tag not found');
      }
      throw error;
    }
  }
}