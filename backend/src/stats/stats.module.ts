import { Controller, Get, Injectable, Module } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Auth } from '../auth/decorators/auth.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { toBookingDto } from '../bookings/bookings.service';
import type { AuthUser } from '../auth/strategies/jwt.strategy';

@Injectable()
export class StatsService {
  constructor(private prisma: PrismaService) {}

  async dashboard(user: AuthUser) {
    const [grouped, recent] = await Promise.all([
      this.prisma.booking.groupBy({ by: ['status'], _count: { _all: true }, _sum: { total: true } }),
      this.prisma.booking.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: { services: { include: { service: true } } },
      }),
    ]);

    const counts = Object.fromEntries(grouped.map((g) => [g.status.toLowerCase(), g._count._all]));
    const base = {
      totalBookings: grouped.reduce((n, g) => n + g._count._all, 0),
      pending: counts.pending ?? 0,
      counts,
      recent: recent.map(toBookingDto),
    };

    // Doanh thu và số liệu dịch vụ chỉ trả cho nhóm có quyền dashboard.revenue.
    if (!user.permissions.includes('dashboard.revenue')) return base;
    return {
      ...base,
      revenue: grouped.find((g) => g.status === 'COMPLETED')?._sum.total ?? 0,
      activeServices: await this.prisma.service.count({ where: { isActive: true } }),
    };
  }
}

@Controller('api/admin/stats')
export class StatsController {
  constructor(private readonly stats: StatsService) {}

  @Auth('admin.access')
  @Get()
  dashboard(@CurrentUser() user: AuthUser) {
    return this.stats.dashboard(user);
  }
}

@Module({
  controllers: [StatsController],
  providers: [StatsService],
})
export class StatsModule {}
