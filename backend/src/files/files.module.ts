import { Module } from '@nestjs/common';
import { FilesController } from './files.controller';
import { FilesService } from './files.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AwsModule } from '../Aws/aws.module';
import { LogsModule } from '../logs/logs.module';

@Module({
  imports: [PrismaModule, AwsModule, LogsModule],
  controllers: [FilesController],
  providers: [FilesService],
  exports: [FilesService]
})
export class FilesModule {}
