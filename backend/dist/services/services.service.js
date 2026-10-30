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
exports.ServicesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const normalize_1 = require("../common/normalize");
const publicInclude = {
    category: true,
    variants: { where: { isActive: true }, orderBy: { price: 'asc' } },
};
let ServicesService = class ServicesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    findAll() {
        return this.prisma.service.findMany({
            where: { isActive: true, category: { isActive: true } },
            include: publicInclude,
            orderBy: { displayOrder: 'asc' },
        });
    }
    findBySlug(slug) {
        return this.prisma.service.findFirst({ where: { slug, isActive: true }, include: publicInclude });
    }
    findByCategory(categorySlug) {
        return this.prisma.service.findMany({
            where: { isActive: true, category: { slug: categorySlug, isActive: true } },
            include: publicInclude,
            orderBy: { displayOrder: 'asc' },
        });
    }
    findCategories() {
        return this.prisma.serviceCategory.findMany({ where: { isActive: true }, orderBy: { displayOrder: 'asc' } });
    }
    adminList() {
        return this.prisma.service.findMany({
            include: { category: true, variants: true },
            orderBy: [{ displayOrder: 'asc' }, { createdAt: 'asc' }],
        });
    }
    async resolveCategory(ref) {
        const category = await this.prisma.serviceCategory.findFirst({ where: { OR: [{ id: ref }, { slug: ref }] } });
        if (!category)
            throw new common_1.BadRequestException('Danh mục không tồn tại');
        return category;
    }
    async uniqueSlug(name) {
        const base = (0, normalize_1.slugify)(name) || 'dich-vu';
        let slug = base;
        for (let i = 2; await this.prisma.service.findUnique({ where: { slug } }); i++)
            slug = `${base}-${i}`;
        return slug;
    }
    async create(dto) {
        const category = await this.resolveCategory(dto.category);
        const last = await this.prisma.service.aggregate({ _max: { displayOrder: true } });
        return this.prisma.service.create({
            data: {
                name: dto.name,
                slug: await this.uniqueSlug(dto.name),
                description: dto.description,
                basePrice: dto.basePrice,
                duration: dto.duration,
                features: dto.features ?? [],
                isActive: dto.isActive ?? true,
                isFeatured: dto.isFeatured ?? false,
                isPopular: dto.isPopular ?? false,
                displayOrder: (last._max.displayOrder ?? 0) + 1,
                categoryId: category.id,
                variants: { create: dto.variants?.map((v) => ({ size: v.size, price: v.price })) ?? [] },
            },
            include: { category: true, variants: true },
        });
    }
    async update(id, dto) {
        const existing = await this.prisma.service.findUnique({ where: { id } });
        if (!existing)
            throw new common_1.NotFoundException('Dịch vụ không tồn tại');
        const { category, variants, ...rest } = dto;
        const categoryId = category ? (await this.resolveCategory(category)).id : undefined;
        return this.prisma.$transaction(async (tx) => {
            if (variants) {
                await tx.serviceVariant.deleteMany({ where: { serviceId: id } });
                await tx.serviceVariant.createMany({ data: variants.map((v) => ({ serviceId: id, size: v.size, price: v.price })) });
            }
            return tx.service.update({
                where: { id },
                data: { ...rest, categoryId },
                include: { category: true, variants: true },
            });
        });
    }
    async remove(id) {
        const existing = await this.prisma.service.findUnique({ where: { id } });
        if (!existing)
            throw new common_1.NotFoundException('Dịch vụ không tồn tại');
        const used = await this.prisma.bookingService.count({ where: { serviceId: id } });
        if (used > 0) {
            throw new common_1.ConflictException('Dịch vụ đã có lịch đặt — hãy chuyển sang "Ngừng hoạt động" thay vì xóa');
        }
        await this.prisma.service.delete({ where: { id } });
        return { success: true };
    }
};
exports.ServicesService = ServicesService;
exports.ServicesService = ServicesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ServicesService);
//# sourceMappingURL=services.service.js.map