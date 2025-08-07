import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { TagsService } from './tag.service';

@ApiTags('tags')
@Controller('tags')
export class TagsController {
  constructor(private readonly tagsService: TagsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all tags' })
  async getAll() {
    return this.tagsService.findAll();
  }

  @Get('by-level/:levelId')
  @ApiOperation({ summary: 'Get tags by classification level' })
  async getByLevel(@Param('levelId') levelId: string) {
    console.log('api lấy tag được gọi')
    return this.tagsService.findByLevel(levelId);
  }
}