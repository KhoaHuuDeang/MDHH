import { Controller, Post, UseInterceptors, UploadedFile, Body, Get, Param, Delete } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { S3Service } from './aws.service';
import { ApiTags, ApiConsumes, ApiBody } from '@nestjs/swagger';

@ApiTags('uploads')
@Controller('uploads')
export class UploadsController {
  constructor(private readonly awsS3Service: S3Service) {}

  @Post()
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body('folder') folder: string = 'documents'
  ) {
    const key = await this.awsS3Service.uploadFile(file, folder);
    const url = await this.awsS3Service.getSignedUrl(key);
    
    return {
      key,
      url,
      filename: file.originalname,
      mimetype: file.mimetype,
      size: file.size
    };
  }

  @Get(':key')
  async getFileUrl(@Param('key') key: string) {
    const url = await this.awsS3Service.getSignedUrl(key);
    return { url };
  }

  @Delete(':key')
  async deleteFile(@Param('key') key: string) {
    await this.awsS3Service.deleteFile(key);
    return { success: true };
  }
}