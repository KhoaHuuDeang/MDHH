import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { AdminModerationService } from './admin-moderation.service';
import { AdminModerationController } from './admin-moderation.controller';

@Module({
  controllers: [UsersController, AdminController, AdminModerationController],
  providers: [UsersService, AdminService, AdminModerationService],
  exports: [UsersService, AdminService, AdminModerationService],
})
export class UsersModule {}
