import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ClassificationLevelsService } from './level.service';

@ApiTags('classification-levels')
@Controller('classification-levels')
export class ClassificationLevelsController {
  constructor(private readonly classificationLevelsService: ClassificationLevelsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all classification levels' })
  async getAll() {
    return this.classificationLevelsService.findAll();
  }
}