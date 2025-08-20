import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UploadsController } from './upload.controller';
import { UploadsService } from './upload.service';
import { S3Service } from 'src/Aws/aws.service';
import { JwtStrategy } from 'src/auth/jwt.strategy';
@Module({
  imports: [
    ConfigModule,
  ],
  controllers: [UploadsController],
  providers: [UploadsService, S3Service],
  exports: [UploadsService, S3Service],
})
export class UploadsModule {}