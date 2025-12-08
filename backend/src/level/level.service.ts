import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateClassificationDto, UpdateClassificationDto } from './level.dto';

@Injectable()
export class ClassificationLevelsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.classification_levels.findMany({
      orderBy: { name: 'asc' },
      include: {
        tags: {
          select: {
            id: true,
            name: true,
            description: true
          },
          orderBy: { name: 'asc' }
        }
      }
    });
  }

  async findOne(id: string) {
    return this.prisma.classification_levels.findUnique({
      where: { id },
      include: { tags: true }
    });
  }

  async create(createClassificationDto: CreateClassificationDto) {
    try {
      return await this.prisma.classification_levels.create({
        data: {
          name: createClassificationDto.name,
          description: createClassificationDto.description
        }
      });
    } catch (error: any) {
      if (error.code === 'P2002') {
        throw new BadRequestException('Classification level name already exists');
      }
      throw error;
    }
  }

  async update(id: string, updateClassificationDto: UpdateClassificationDto) {
    try {
      return await this.prisma.classification_levels.update({
        where: { id },
        data: {
          name: updateClassificationDto.name,
          description: updateClassificationDto.description
        }
      });
    } catch (error: any) {
      if (error.code === 'P2002') {
        throw new BadRequestException('Classification level name already exists');
      }
      if (error.code === 'P2025') {
        throw new BadRequestException('Classification level not found');
      }
      throw error;
    }
  }

  async delete(id: string) {
    try {
      return await this.prisma.classification_levels.delete({
        where: { id }
      });
    } catch (error: any) {
      if (error.code === 'P2025') {
        throw new BadRequestException('Classification level not found');
      }
      if (error.code === 'P2003') {
        throw new BadRequestException('Cannot delete classification level with existing folders');
      }
      throw error;
    }
  }
}