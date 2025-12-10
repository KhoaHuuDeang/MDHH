import { Controller, Get, Param, Request, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { FilesService } from './files.service';

@ApiTags('files')
@Controller('files')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Get(':resourceId/download')
  @ApiOperation({ summary: 'Generate download URL for resource files' })
  @ApiResponse({ status: 200, description: 'Download URL generated successfully' })
  @ApiResponse({ status: 404, description: 'Resource not found' })
  async downloadResource(
    @Param('resourceId') resourceId: string,
    @Request() req: any
  ): Promise<{ message: string; status: number; result: { downloadUrl: string } }> {
    const downloadUrl = await this.filesService.generateResourceDownloadUrl(
      resourceId,
      req.user.userId
    );
    return {
      message: 'Download URL generated successfully',
      status: 200,
      result: { downloadUrl }
    };
  }
}
