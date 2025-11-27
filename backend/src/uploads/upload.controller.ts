import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import {
  RequestPreSignedUrlsDto,
  PreSignedUrlResponseDto,
  CreateResourceWithUploadsDto,
  ResourceResponseDto,
  CompleteUploadDto,
} from './uploads.dto';
import {
  UserResourcesResponseDto,
  GetUserResourcesQueryDto,
} from './dto/user-resources.dto';
import { UploadsService } from './upload.service';

@ApiTags('uploads')
@Controller('uploads')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) { }

  /**
   * Step 1: Request pre-signed URLs for file uploads
   */
  @Post('request-presigned-urls')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Request pre-signed URLs for file uploads',
    description: 'Validates files and returns S3 pre-signed URLs. No database writes performed.'
  })
  @ApiResponse({
    status: 200,
    description: 'Pre-signed URLs generated successfully',
    type: PreSignedUrlResponseDto
  })
  @ApiResponse({ status: 400, description: 'Invalid file metadata' })
  async requestPreSignedUrls(
    @Body() requestDto: RequestPreSignedUrlsDto,
    @Request() req: any
  ): Promise<PreSignedUrlResponseDto> {
    return await this.uploadsService.requestPreSignedUrls(requestDto, req.user.userId);
  }

  /**
   * Step 2: Create resource with folder association
   */
@Post('create-resource')
  @ApiOperation({
    summary: 'Create resource with folder association',
    description: 'Creates resource + folder + links them via folder_files junction table.'
  })
  @ApiResponse({
    status: 201,
    description: 'Resource and folder created/linked successfully',
    type: ResourceResponseDto
  })
  @ApiResponse({ status: 400, description: 'Invalid resource data' })
  async createResourceWithUploads(
    @Body() createResourceDto: CreateResourceWithUploadsDto,
    @Request() req: any
  ): Promise<ResourceResponseDto> {
    return await this.uploadsService.createResourceWithUploads(createResourceDto,req.user.userId);
  }

  /**
   * Step 3: Complete upload process (optional verification)
   */
  @Post('complete/:resourceId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Complete upload process',
    description: 'Verifies S3 uploads and updates status to completed.'
  })
  @ApiResponse({ status: 200, description: 'Upload completed successfully' })
  @ApiResponse({ status: 400, description: 'S3 verification failed' })
  @ApiResponse({ status: 404, description: 'Resource not found' })
  async completeUpload(
    @Param('resourceId') resourceId: string,
    @Body() completeDto: CompleteUploadDto
  ): Promise<{ message: string }> {
    completeDto.resourceId = resourceId;
    await this.uploadsService.completeUpload(completeDto);
    return { message: 'Upload completed successfully' };
  }

  /**
   * Get user's uploads with pagination
   */
  @Get('my-uploads')
  @ApiOperation({ summary: 'Get user uploads with pagination' })
  @ApiResponse({ status: 200, description: 'User uploads retrieved successfully' })
  async getUserUploads(
    @Request() req: any,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('status') status?: string
  ) {
    return await this.uploadsService.getUserUploads(
      req.user.userId,
      parseInt(page),
      parseInt(limit),
      status
    );
  }

  /**
   * Get user's resources for listing page with social metrics
   */
  @Get('resources')
  @ApiOperation({ 
    summary: 'Get user resources for listing page',
    description: 'Returns user resources with social metrics, folder information, and pagination'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'User resources retrieved successfully',
    type: UserResourcesResponseDto
  })
  async getUserResources(
    @Request() req: any,
    @Query() queryDto: GetUserResourcesQueryDto
  ): Promise<UserResourcesResponseDto> {
    
    return await this.uploadsService.getUserResources(
      req.user.userId,
      queryDto.page || 1,
      queryDto.limit || 10,
      queryDto.status,
      queryDto.search
    );
  }

  /**
   * Generate download URL for uploaded file
   */
  @Get('download/:uploadId')
  @ApiOperation({ summary: 'Generate download URL for uploaded file' })
  @ApiResponse({ status: 200, description: 'Download URL generated successfully' })
  @ApiResponse({ status: 404, description: 'Upload not found' })
  async generateDownloadUrl(
    @Param('uploadId') uploadId: string,
    @Request() req: any
  ): Promise<{ message: string; status: number; result: { downloadUrl: string } }> {
    const downloadUrl = await this.uploadsService.generateDownloadUrl(uploadId, req.user.userId);
    return {
      message: 'Download URL generated successfully',
      status: 200,
      result: { downloadUrl }
    };
  }

  /**
   * Delete resource and associated files
   */
  @Delete('resource/:resourceId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete resource and associated files' })
  @ApiResponse({ status: 204, description: 'Resource deleted successfully' })
  @ApiResponse({ status: 404, description: 'Resource not found' })
  async deleteResource(
    @Param('resourceId') resourceId: string,
    @Request() req: any
  ): Promise<void> {
    await this.uploadsService.deleteResource(resourceId, req.user.userId);
  }



  @Delete('/delete-s3-file')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete single file from S3',
    description: 'Deletes a file from S3 bucket. Used for cleanup during upload cancellation.'
  })
  async deleteS3File(
    @Body() deleteDto: { s3Key: string },
    @Request() req: any
  ): Promise<void> {
    return await this.uploadsService.deleteS3File(deleteDto.s3Key, req.user.userId);
  }

  @Delete('/delete-multiple-s3-files')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete multiple files from S3',
    description: 'Batch delete files from S3 bucket.'
  })
  async deleteMultipleS3Files(
    @Body() deleteDto: { s3Keys: string[] },
    @Request() req: any
  ): Promise<void> {
    return await this.uploadsService.deleteMultipleS3Files(deleteDto.s3Keys, req.user.userId);
  }

  @Post('profile-image')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get presigned URL for profile image upload',
    description: 'Returns presigned URL for uploading avatar or banner images'
  })
  @ApiResponse({ status: 200, description: 'Presigned URL generated successfully' })
  async uploadProfileImage(
    @Body() body: { filename: string; mimetype: string; fileSize: number; imageType: 'avatar' | 'banner' },
    @Request() req: any
  ) {
    return await this.uploadsService.generateProfileImageUploadUrl(
      req.user.userId,
      body.filename,
      body.mimetype,
      body.fileSize,
      body.imageType
    );
  }
}