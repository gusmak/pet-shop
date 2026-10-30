import { ConflictException, Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { slugify } from '../common/normalize';
import { CreateServiceDto, UpdateServiceDto } from './dto/service.dto';

const publicInclude = {
  category: true,
  variants: { where: { isActive: true }, orderBy: { price: 'asc' as const } },
};

@Injectable()
export class ServicesService {
  constructor(private prisma: PrismaService) {}

  // ── Công khai ───────────────────────────────────────────────
  findAll() {
    return this.prisma.service.findMany({
      where: { isActive: true, category: { isActive: true } },
      include: publicInclude,
      orderBy: { displayOrder: 'asc' },
    });
  }

  findBySlug(slug: string) {
    return this.prisma.service.findFirst({ where: { slug, isActive: true }, include: publicInclude });
  }

  findByCategory(categorySlug: string) {
    return this.prisma.service.findMany({
      where: { isActive: true, category: { slug: categorySlug, isActive: true } },
      include: publicInclude,
      orderBy: { displayOrder: 'asc' },
    });
  }

  findCategories() {
    return this.prisma.serviceCategory.findMany({ where: { isActive: true }, orderBy: { displayOrder: 'asc' } });
  }

  // ── Quản trị (services.manage) ──────────────────────────────
  adminList() {
    return this.prisma.service.findMany({
      include: { category: true, variants: true },
      orderBy: [{ displayOrder: 'asc' }, { createdAt: 'asc' }],
    });
  }

  private async resolveCategory(ref: string) {
    const category = await this.prisma.serviceCategory.findFirst({ where: { OR: [{ id: ref }, { slug: ref }] } });
    if (!category) throw new BadRequestException('Danh mục không tồn tại');
    return category;
  }

  private async uniqueSlug(name: string) {
    const base = slugify(name) || 'dich-vu';
    let slug = base;
    for (let i = 2; await this.prisma.service.findUnique({ where: { slug } }); i++) slug = `${base}-${i}`;
    return slug;
  }

  async create(dto: CreateServiceDto) {
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

  async update(id: string, dto: UpdateServiceDto) {
    const existing = await this.prisma.service.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Dịch vụ không tồn tại');

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

  async remove(id: string) {
    const existing = await this.prisma.service.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Dịch vụ không tồn tại');
    const used = await this.prisma.bookingService.count({ where: { serviceId: id } });
    if (used > 0) {
      throw new ConflictException('Dịch vụ đã có lịch đặt — hãy chuyển sang "Ngừng hoạt động" thay vì xóa');
    }
    await this.prisma.service.delete({ where: { id } });
    return { success: true };
  }
}
