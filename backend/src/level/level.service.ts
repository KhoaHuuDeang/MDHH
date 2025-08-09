import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';

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
}