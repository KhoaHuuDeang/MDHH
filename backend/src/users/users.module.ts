import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { AdminStatsController } from './admin-stats.controller';
import { AdminModerationService } from './admin-moderation.service';
import { AdminModerationController } from './admin-moderation.controller';
import { AdminOrdersService } from './admin-orders.service';
import { AdminOrdersController } from './admin-orders.controller';
import { LogsModule } from '../logs/logs.module';
import { PaymentModule } from '../payment/payment.module';

@Module({
  imports: [LogsModule, PaymentModule],
  controllers: [UsersController, AdminController, AdminStatsController, AdminModerationController, AdminOrdersController],
  providers: [UsersService, AdminService, AdminModerationService, AdminOrdersService],
  exports: [UsersService, AdminService, AdminModerationService, AdminOrdersService],
})
export class UsersModule {}
