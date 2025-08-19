import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ConfigModule } from '@nestjs/config';
import { UploadsModule } from './uploads/upload.module';
import { FoldersModule } from './folders/folders.module';
import { TagsModule } from './tags/tag.module';
import { ClassificationLevelsModule } from './level/level.module';
import { HomepageModule } from './homepage/homepage.module';
import { VotesModule } from './votes/votes.module';

@Module({
  imports: [AuthModule, UsersModule, ConfigModule.forRoot(), UploadsModule, FoldersModule, TagsModule, ClassificationLevelsModule, HomepageModule, VotesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
