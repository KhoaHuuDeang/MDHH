import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';
import { ClassificationLevelsService } from './level.service';
import { CreateClassificationDto, UpdateClassificationDto } from './level.dto';

@ApiTags('classification-levels')
@Controller('classification-levels')
export class ClassificationLevelsController {
  constructor(private readonly classificationLevelsService: ClassificationLevelsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all classification levels' })
  async getAll() {
    return this.classificationLevelsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get classification level by ID' })
  async getOne(@Param('id') id: string) {
    return this.classificationLevelsService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create classification level (admin only)' })
  async create(@Body() createClassificationDto: CreateClassificationDto) {
    return this.classificationLevelsService.create(createClassificationDto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update classification level (admin only)' })
  async update(@Param('id') id: string, @Body() updateClassificationDto: UpdateClassificationDto) {
    return this.classificationLevelsService.update(id, updateClassificationDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete classification level (admin only)' })
  async delete(@Param('id') id: string) {
    return this.classificationLevelsService.delete(id);
  }
}