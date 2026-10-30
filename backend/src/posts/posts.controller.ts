import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { CreatePostDto, PostsService, UpdatePostDto } from './posts.service';
import { Auth } from '../auth/decorators/auth.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthUser } from '../auth/strategies/jwt.strategy';

@Controller('api/posts')
export class PostsController {
  constructor(private readonly posts: PostsService) {}

  @Get()
  list() {
    return this.posts.listPublished();
  }

  @Get(':idOrSlug')
  get(@Param('idOrSlug') idOrSlug: string) {
    return this.posts.findPublished(idOrSlug);
  }
}

@Controller('api/admin/posts')
@Auth('admin.access', 'posts.write')
export class AdminPostsController {
  constructor(private readonly posts: PostsService) {}

  @Get()
  list() {
    return this.posts.adminList();
  }

  @Post()
  create(@Body() dto: CreatePostDto, @CurrentUser() user: AuthUser) {
    return this.posts.create(dto, user);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdatePostDto, @CurrentUser() user: AuthUser) {
    return this.posts.update(id, dto, user);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.posts.remove(id, user);
  }
}
