import { Module } from '@nestjs/common';
import { HomepageController } from './homepage.controller';
import { HomepageService } from './homepage.service';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [HomepageController],
  providers: [HomepageService, PrismaService],
  exports: [HomepageService]
})
export class HomepageModule {}