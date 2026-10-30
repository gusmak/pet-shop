import { Controller, Get, Injectable, Module, Query } from '@nestjs/common';
import { IsOptional, IsString } from 'class-validator';
import { PrismaService } from '../prisma/prisma.service';
import { Auth } from '../auth/decorators/auth.decorator';
import { Trim } from '../common/normalize';

class ListCustomersQuery {
  @IsOptional()
  @Trim()
  @IsString()
  q?: string;
}

@Injectable()
export class CustomersService {
  constructor(private prisma: PrismaService) {}

  async list(q?: string) {
    const users = await this.prisma.user.findMany({
      where: q
        ? {
            OR: [
              { fullName: { contains: q, mode: 'insensitive' } },
              { email: { contains: q, mode: 'insensitive' } },
              { phone: { contains: q.replace(/[\s.\-]/g, '') } },
            ],
          }
        : undefined,
      include: { group: true, _count: { select: { pets: true, bookings: true } } },
      orderBy: { createdAt: 'desc' },
      take: 500,
    });

    // Tổng chi tiêu = tổng các lịch đã hoàn thành.
    const spent = await this.prisma.booking.groupBy({
      by: ['userId'],
      where: { status: 'COMPLETED', userId: { in: users.map((u) => u.id) } },
      _sum: { total: true },
    });

    return users.map((u) => ({
      id: u.id,
      fullName: u.fullName,
      email: u.email,
      phone: u.phone,
      group: u.group.key,
      pets: u._count.pets,
      bookings: u._count.bookings,
      totalSpent: spent.find((s) => s.userId === u.id)?._sum.total ?? 0,
      isActive: u.isActive,
      createdAt: u.createdAt.toISOString().slice(0, 10),
    }));
  }
}

@Controller('api/admin/customers')
@Auth('admin.access', 'customers.view')
export class CustomersController {
  constructor(private readonly customers: CustomersService) {}

  @Get()
  list(@Query() query: ListCustomersQuery) {
    return this.customers.list(query.q);
  }
}

@Module({
  controllers: [CustomersController],
  providers: [CustomersService],
})
export class CustomersModule {}
