import { Module } from '@nestjs/common';
import { TagsController } from './tag.controller';
import { TagsService } from './tag.service';

@Module({
  controllers: [TagsController],
  providers: [TagsService],
  exports: [TagsService],
})
export class TagsModule {}