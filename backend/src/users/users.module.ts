import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';

@Module({
  controllers: [UsersController, AdminController],
  providers: [UsersService, AdminService],
  exports: [UsersService, AdminService],
})
export class UsersModule {}
