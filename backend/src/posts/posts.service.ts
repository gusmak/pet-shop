import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { IsBoolean, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { Post } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { Trim, slugify } from '../common/normalize';
import type { AuthUser } from '../auth/strategies/jwt.strategy';

export class CreatePostDto {
  @Trim()
  @IsString()
  @MinLength(3)
  @MaxLength(200)
  title: string;

  @Trim()
  @IsString()
  @MinLength(3)
  @MaxLength(500)
  excerpt: string;

  @IsString()
  @MinLength(1)
  @MaxLength(50_000)
  content: string;

  @IsOptional()
  @IsBoolean()
  published?: boolean;
}

export class UpdatePostDto {
  @IsOptional()
  @Trim()
  @IsString()
  @MinLength(3)
  @MaxLength(200)
  title?: string;

  @IsOptional()
  @Trim()
  @IsString()
  @MinLength(3)
  @MaxLength(500)
  excerpt?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(50_000)
  content?: string;

  @IsOptional()
  @IsBoolean()
  published?: boolean;
}

// Hình dạng khớp web/lib/demo.ts: DemoPost.
const toDto = (p: Post) => ({
  id: p.id,
  slug: p.slug,
  title: p.title,
  excerpt: p.excerpt,
  content: p.content,
  authorId: p.authorId,
  authorName: p.authorName,
  createdAt: p.createdAt.toISOString().slice(0, 10),
  published: p.isPublished,
});

@Injectable()
export class PostsService {
  constructor(private prisma: PrismaService) {}

  async listPublished() {
    const rows = await this.prisma.post.findMany({
      where: { isPublished: true },
      orderBy: { publishedAt: 'desc' },
    });
    return rows.map(toDto);
  }

  async findPublished(idOrSlug: string) {
    const post = await this.prisma.post.findFirst({
      where: { isPublished: true, OR: [{ id: idOrSlug }, { slug: idOrSlug }] },
    });
    if (!post) throw new NotFoundException('Không tìm thấy bài viết');
    return toDto(post);
  }

  async adminList() {
    const rows = await this.prisma.post.findMany({ orderBy: { createdAt: 'desc' } });
    return rows.map(toDto);
  }

  private async uniqueSlug(title: string) {
    const base = slugify(title) || 'bai-viet';
    let slug = base;
    for (let i = 2; await this.prisma.post.findUnique({ where: { slug } }); i++) slug = `${base}-${i}`;
    return slug;
  }

  async create(dto: CreatePostDto, actor: AuthUser) {
    // Tác giả phải là nhân viên (khách không có hồ sơ nhân viên để gắn bài).
    if (actor.type !== 'admin') throw new ForbiddenException('Chỉ nhân viên mới đăng được bài');
    const author = await this.prisma.staff.findUniqueOrThrow({ where: { id: actor.sub } });
    const published = dto.published ?? true;
    const post = await this.prisma.post.create({
      data: {
        slug: await this.uniqueSlug(dto.title),
        title: dto.title,
        excerpt: dto.excerpt,
        content: dto.content,
        authorId: author.id,
        authorName: author.fullName,
        isPublished: published,
        publishedAt: published ? new Date() : null,
      },
    });
    return toDto(post);
  }

  // Sửa/xóa: chủ bài, hoặc người có quyền posts.manage_all.
  private async loadManageable(id: string, actor: AuthUser) {
    const post = await this.prisma.post.findUnique({ where: { id } });
    if (!post) throw new NotFoundException('Không tìm thấy bài viết');
    if (post.authorId !== actor.sub && !actor.permissions.includes('posts.manage_all')) {
      throw new ForbiddenException('Bạn chỉ có thể sửa/xóa bài của mình');
    }
    return post;
  }

  async update(id: string, dto: UpdatePostDto, actor: AuthUser) {
    const post = await this.loadManageable(id, actor);
    const { published, ...rest } = dto;
    const updated = await this.prisma.post.update({
      where: { id },
      data: {
        ...rest,
        ...(published !== undefined && {
          isPublished: published,
          // giữ ngày đăng đầu tiên nếu từng đăng
          publishedAt: published ? (post.publishedAt ?? new Date()) : post.publishedAt,
        }),
      },
    });
    return toDto(updated);
  }

  async remove(id: string, actor: AuthUser) {
    await this.loadManageable(id, actor);
    await this.prisma.post.delete({ where: { id } });
    return { success: true };
  }
}
