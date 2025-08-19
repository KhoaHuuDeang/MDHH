import { Module } from '@nestjs/common';
import { VotesController } from './votes.controller';
import { VotesService } from './votes.service';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [VotesController],
  providers: [VotesService, PrismaService],
  exports: [VotesService] // Export service for use in other modules
})
export class VotesModule {}