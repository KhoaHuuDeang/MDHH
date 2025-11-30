import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Query,
  Param,
  UseGuards,
  Request,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AdminModerationService } from './admin-moderation.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import {
  AdminUploadsQueryDto,
  AdminUploadsResponseDto,
  DeleteUploadDto,
  FlagUploadDto,
  ApproveUploadDto,
  RejectUploadDto,
  AdminCommentsQueryDto,
  AdminCommentsResponseDto,
  DeleteCommentDto,
  AdminFoldersQueryDto,
  AdminFoldersResponseDto,
  DeleteFolderDto,
} from './admin-moderation.dto';

@ApiTags('Admin - Content Moderation')
@Controller('admin/moderation')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@ApiBearerAuth()
export class AdminModerationController {
  constructor(private readonly moderationService: AdminModerationService) {}

  // ========== UPLOADS ENDPOINTS ==========
  @Get('uploads')
  @ApiOperation({ summary: 'Get all uploads for moderation' })
  @ApiResponse({ status: 200, type: AdminUploadsResponseDto })
  async getUploads(@Query() query: AdminUploadsQueryDto): Promise<AdminUploadsResponseDto> {
    return this.moderationService.getUploads(query);
  }

  @Delete('uploads/:id')
  @ApiOperation({ summary: 'Delete an upload' })
  @ApiResponse({ status: 200, description: 'Upload deleted successfully' })
  @ApiResponse({ status: 404, description: 'Upload not found' })
  async deleteUpload(
    @Param('id') uploadId: string,
    @Body() dto: DeleteUploadDto
  ): Promise<{ message: string; status: number; result: any }> {
    const serviceResult = await this.moderationService.deleteUpload({ ...dto, uploadId });
    return {
      message: serviceResult.message,
      status: HttpStatus.OK,
      result: serviceResult.result,
    };
  }

  @Post('uploads/:id/flag')
  @ApiOperation({ summary: 'Flag an upload as inappropriate' })
  @ApiResponse({ status: 200, description: 'Upload flagged successfully' })
  @ApiResponse({ status: 404, description: 'Upload not found' })
  async flagUpload(
    @Param('id') uploadId: string,
    @Body() dto: FlagUploadDto
  ): Promise<{ message: string; status: number; result: any }> {
    const serviceResult = await this.moderationService.flagUpload(uploadId, dto.reason);
    return {
      message: serviceResult.message,
      status: HttpStatus.OK,
      result: serviceResult.result,
    };
  }


  @Patch('uploads/:id/approve')
  @ApiOperation({ summary: 'Approve an upload' })
  @ApiResponse({ status: 200, description: 'Upload approved successfully' })
  @ApiResponse({ status: 404, description: 'Upload not found' })
  async approveUpload(
    @Param('id') uploadId: string,
    @Request() req: any,
  ): Promise<{ message: string; status: number; result: any }> {
    const serviceResult = await this.moderationService.approveUpload(uploadId, req.user.userId);
    return {
      message: serviceResult.message,
      status: HttpStatus.OK,
      result: serviceResult.result,
    };
  }

  @Patch('uploads/:id/reject')
  @ApiOperation({ summary: 'Reject an upload' })
  @ApiResponse({ status: 200, description: 'Upload rejected successfully' })
  @ApiResponse({ status: 404, description: 'Upload not found' })
  async rejectUpload(
    @Param('id') uploadId: string,
    @Body() dto: RejectUploadDto,
    @Request() req: any,
  ): Promise<{ message: string; status: number; result: any }> {
    const serviceResult = await this.moderationService.rejectUpload(uploadId, req.user.userId, dto.reason);
    return {
      message: serviceResult.message,
      status: HttpStatus.OK,
      result: serviceResult.result,
    };
  }

  // ========== COMMENTS ENDPOINTS ==========
  @Get('comments')
  @ApiOperation({ summary: 'Get all comments for moderation' })
  @ApiResponse({ status: 200, type: AdminCommentsResponseDto })
  async getComments(@Query() query: AdminCommentsQueryDto): Promise<AdminCommentsResponseDto> {
    return this.moderationService.getComments(query);
  }

  @Delete('comments/:id')
  @ApiOperation({ summary: 'Delete a comment (soft delete)' })
  @ApiResponse({ status: 200, description: 'Comment deleted successfully' })
  @ApiResponse({ status: 404, description: 'Comment not found' })
  async deleteComment(
    @Param('id') commentId: string,
    @Body() dto: DeleteCommentDto
  ): Promise<{ message: string }> {
    return this.moderationService.deleteComment({ ...dto, commentId });
  }

  // ========== FOLDERS ENDPOINTS ==========
  @Get('folders')
  @ApiOperation({ summary: 'Get all folders for moderation' })
  @ApiResponse({ status: 200, type: AdminFoldersResponseDto })
  async getFolders(@Query() query: AdminFoldersQueryDto): Promise<AdminFoldersResponseDto> {
    return this.moderationService.getFolders(query);
  }

  @Delete('folders/:id')
  @ApiOperation({ summary: 'Delete a folder' })
  @ApiResponse({ status: 200, description: 'Folder deleted successfully' })
  @ApiResponse({ status: 404, description: 'Folder not found' })
  async deleteFolder(
    @Param('id') folderId: string,
    @Body() dto: DeleteFolderDto
  ): Promise<{ message: string }> {
    return this.moderationService.deleteFolder({ ...dto, folderId });
  }
}
