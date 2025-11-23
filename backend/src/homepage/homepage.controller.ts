import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { HomepageService } from './homepage.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { HomepageResponseDto, SearchFilesQueryDto, SearchFilesResponseDto } from './dto/homepage.dto';

@ApiTags('Homepage')
@Controller('homepage')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class HomepageController {
  constructor(private readonly homepageService: HomepageService) {}

  @Get()
  @ApiOperation({ summary: 'Get homepage data' })
  @ApiResponse({
    status: 200,
    description: 'Return homepage aggregated data including recent files, popular files, and popular folders',
    type: HomepageResponseDto
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error - Failed to fetch homepage data'
  })
  async getHomepageData(): Promise<HomepageResponseDto> {
    return this.homepageService.getHomepageData();
  }

  @Get('search')
  @ApiOperation({
    summary: 'Search and filter files',
    description: 'Search files by query and filter by classification level and tags'
  })
  @ApiResponse({
    status: 200,
    description: 'Search completed successfully',
    type: SearchFilesResponseDto
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error - Failed to search files'
  })
  async searchFiles(@Query() queryDto: SearchFilesQueryDto): Promise<SearchFilesResponseDto> {
    return this.homepageService.searchFiles(queryDto);
  }
}