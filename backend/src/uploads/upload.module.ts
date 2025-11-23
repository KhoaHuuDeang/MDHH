import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UploadsController } from './upload.controller';
import { UploadsService } from './upload.service';
import { S3Service } from 'src/Aws/aws.service';
import { JwtStrategy } from 'src/auth/jwt.strategy';
import { LogsModule } from '../logs/logs.module';

@Module({
  imports: [
    ConfigModule,
    LogsModule,
  ],
  controllers: [UploadsController],
  providers: [UploadsService, S3Service],
  exports: [UploadsService, S3Service],
})
export class UploadsModule {}