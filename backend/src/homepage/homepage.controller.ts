import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { HomepageService } from './homepage.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { HomepageResponseDto, SearchFilesQueryDto, SearchFilesResponseDto } from './dto/homepage.dto';

@ApiTags('Homepage')
@Controller('homepage')
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
  async getHomepageData(
    @Query('recentLimit') recentLimit?: number,
    @Query('popularLimit') popularLimit?: number,
    @Query('folderLimit') folderLimit?: number,
  ): Promise<HomepageResponseDto> {
    return this.homepageService.getHomepageData(recentLimit, popularLimit, folderLimit);
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


  @Get('stats')
  @ApiOperation({ summary: 'Get public statistics' })
  @ApiResponse({
    status: 200,
    description: 'Return public statistics for landing page'
  })
  async getPublicStats(): Promise<any> {
    const stats = await this.homepageService.getPublicStats();
    return {
      message: 'Public statistics retrieved successfully',
      status: 200,
      result: stats
    };
  }
}