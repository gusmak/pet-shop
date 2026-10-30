"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostsService = exports.UpdatePostDto = exports.CreatePostDto = void 0;
const common_1 = require("@nestjs/common");
const class_validator_1 = require("class-validator");
const prisma_service_1 = require("../prisma/prisma.service");
const normalize_1 = require("../common/normalize");
class CreatePostDto {
    title;
    excerpt;
    content;
    published;
}
exports.CreatePostDto = CreatePostDto;
__decorate([
    (0, normalize_1.Trim)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(3),
    (0, class_validator_1.MaxLength)(200),
    __metadata("design:type", String)
], CreatePostDto.prototype, "title", void 0);
__decorate([
    (0, normalize_1.Trim)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(3),
    (0, class_validator_1.MaxLength)(500),
    __metadata("design:type", String)
], CreatePostDto.prototype, "excerpt", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(1),
    (0, class_validator_1.MaxLength)(50_000),
    __metadata("design:type", String)
], CreatePostDto.prototype, "content", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreatePostDto.prototype, "published", void 0);
class UpdatePostDto {
    title;
    excerpt;
    content;
    published;
}
exports.UpdatePostDto = UpdatePostDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, normalize_1.Trim)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(3),
    (0, class_validator_1.MaxLength)(200),
    __metadata("design:type", String)
], UpdatePostDto.prototype, "title", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, normalize_1.Trim)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(3),
    (0, class_validator_1.MaxLength)(500),
    __metadata("design:type", String)
], UpdatePostDto.prototype, "excerpt", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(1),
    (0, class_validator_1.MaxLength)(50_000),
    __metadata("design:type", String)
], UpdatePostDto.prototype, "content", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdatePostDto.prototype, "published", void 0);
const toDto = (p) => ({
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
let PostsService = class PostsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async listPublished() {
        const rows = await this.prisma.post.findMany({
            where: { isPublished: true },
            orderBy: { publishedAt: 'desc' },
        });
        return rows.map(toDto);
    }
    async findPublished(idOrSlug) {
        const post = await this.prisma.post.findFirst({
            where: { isPublished: true, OR: [{ id: idOrSlug }, { slug: idOrSlug }] },
        });
        if (!post)
            throw new common_1.NotFoundException('Không tìm thấy bài viết');
        return toDto(post);
    }
    async adminList() {
        const rows = await this.prisma.post.findMany({ orderBy: { createdAt: 'desc' } });
        return rows.map(toDto);
    }
    async uniqueSlug(title) {
        const base = (0, normalize_1.slugify)(title) || 'bai-viet';
        let slug = base;
        for (let i = 2; await this.prisma.post.findUnique({ where: { slug } }); i++)
            slug = `${base}-${i}`;
        return slug;
    }
    async create(dto, actor) {
        if (actor.type !== 'admin')
            throw new common_1.ForbiddenException('Chỉ nhân viên mới đăng được bài');
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
    async loadManageable(id, actor) {
        const post = await this.prisma.post.findUnique({ where: { id } });
        if (!post)
            throw new common_1.NotFoundException('Không tìm thấy bài viết');
        if (post.authorId !== actor.sub && !actor.permissions.includes('posts.manage_all')) {
            throw new common_1.ForbiddenException('Bạn chỉ có thể sửa/xóa bài của mình');
        }
        return post;
    }
    async update(id, dto, actor) {
        const post = await this.loadManageable(id, actor);
        const { published, ...rest } = dto;
        const updated = await this.prisma.post.update({
            where: { id },
            data: {
                ...rest,
                ...(published !== undefined && {
                    isPublished: published,
                    publishedAt: published ? (post.publishedAt ?? new Date()) : post.publishedAt,
                }),
            },
        });
        return toDto(updated);
    }
    async remove(id, actor) {
        await this.loadManageable(id, actor);
        await this.prisma.post.delete({ where: { id } });
        return { success: true };
    }
};
exports.PostsService = PostsService;
exports.PostsService = PostsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PostsService);
//# sourceMappingURL=posts.service.js.map