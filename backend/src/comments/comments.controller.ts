import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('comments')
@UseGuards(JwtAuthGuard)
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Get('resource/:resourceId')
  async getResourceComments(@Param('resourceId') resourceId: string) {
    return this.commentsService.getResourceComments(resourceId);
  }

  @Get('folder/:folderId')
  async getFolderComments(@Param('folderId') folderId: string) {
    return this.commentsService.getFolderComments(folderId);
  }

  @Post('resource/:resourceId')
  async createResourceComment(
    @Param('resourceId') resourceId: string,
    @Body('content') content: string,
    @Body('parentId') parentId: string | undefined,
    @Request() req: any,
  ) {
    return this.commentsService.createComment({
      userId: req.user.userId,
      resourceId,
      content,
      parentId,
    });
  }

  @Post('folder/:folderId')
  async createFolderComment(
    @Param('folderId') folderId: string,
    @Body('content') content: string,
    @Body('parentId') parentId: string | undefined,
    @Request() req: any,
  ) {
    return this.commentsService.createComment({
      userId: req.user.userId,
      folderId,
      content,
      parentId,
    });
  }
}
