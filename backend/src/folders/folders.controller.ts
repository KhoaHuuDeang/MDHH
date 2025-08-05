import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ApiOperation, ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { FoldersService } from './folders.service';
import { CreateFolderDto, UpdateFolderDto } from './folders.dto';

@ApiTags('folders')
@Controller('folders')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class FoldersController {
  constructor(private readonly foldersService: FoldersService) {}

  @Get()
  @ApiOperation({ summary: 'Get user folders' })
  async getUserFolders(@Request() req) {
    return this.foldersService.getUserFolders(req.user.id);
  }

  @Post()
  @ApiOperation({ summary: 'Create new folder' })
  async create(@Body() createFolderDto: CreateFolderDto, @Request() req) {
    return this.foldersService.create(createFolderDto, req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get folder details' })
  async findOne(@Param('id') id: string, @Request() req) {
    return this.foldersService.findOne(id, req.user.id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update folder' })
  async update(@Param('id') id: string, @Body() updateFolderDto: UpdateFolderDto, @Request() req) {
    return this.foldersService.update(id, updateFolderDto, req.user.id);
  }

}