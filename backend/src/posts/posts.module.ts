import { Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { AdminPostsController, PostsController } from './posts.controller';

@Module({
  controllers: [PostsController, AdminPostsController],
  providers: [PostsService],
})
export class PostsModule {}
