import { Module } from '@nestjs/common';
import { ClassificationLevelsController } from './level.controller';
import { ClassificationLevelsService } from './level.service';
import { PrismaService } from 'src/prisma.service';

@Module({
  controllers: [ClassificationLevelsController],
  providers: [ClassificationLevelsService, PrismaService],
  exports: [ClassificationLevelsService],
})
export class ClassificationLevelsModule {}