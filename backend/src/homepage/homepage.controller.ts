import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { HomepageService } from './homepage.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { HomepageResponseDto } from './dto/homepage.dto';

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
}