import { Module } from '@nestjs/common';
import { LogsController } from './logs.controller';
import { NotificationsController } from './notifications.controller';
import { LogsService } from './logs.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [LogsController, NotificationsController],
  providers: [LogsService],
  exports: [LogsService],
})
export class LogsModule {}
