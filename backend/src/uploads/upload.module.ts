import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UploadsController } from './upload.controller';
import { UploadsService } from './upload.service';
import { S3Service } from 'src/Aws/aws.service';
import { PrismaService } from 'src/prisma.service';

@Module({
  imports: [
    ConfigModule,
  ],
  controllers: [UploadsController],
  providers: [UploadsService, S3Service, PrismaService],
  exports: [UploadsService, S3Service],
})
export class UploadsModule {}