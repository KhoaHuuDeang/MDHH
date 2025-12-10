import { Module } from '@nestjs/common';
import { VotesController } from './votes.controller';
import { VotesService } from './votes.service';
import { LogsModule } from '../logs/logs.module';

@Module({
  imports: [LogsModule],
  controllers: [VotesController],
  providers: [VotesService],
  exports: [VotesService] // Export service for use in other modules
})
export class VotesModule {}