import { Module } from '@nestjs/common';
import { ClassificationLevelsController } from './level.controller';
import { ClassificationLevelsService } from './level.service';

@Module({
  controllers: [ClassificationLevelsController],
  providers: [ClassificationLevelsService],
  exports: [ClassificationLevelsService],
})
export class ClassificationLevelsModule {}