import { Module } from '@nestjs/common';
import { VotesController } from './votes.controller';
import { VotesService } from './votes.service';

@Module({
  controllers: [VotesController],
  providers: [VotesService],
  exports: [VotesService] // Export service for use in other modules
})
export class VotesModule {}