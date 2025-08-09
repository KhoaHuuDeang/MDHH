import { Module } from '@nestjs/common';
import { TagsController } from './tag.controller';
import { TagsService } from './tag.service';
import { PrismaService } from 'src/prisma.service';

@Module({
  controllers: [TagsController],
  providers: [TagsService, PrismaService],
  exports: [TagsService],
})
export class TagsModule {}