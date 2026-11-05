import {
  Body,
  ConflictException,
  Controller,
  Get,
  Injectable,
  Module,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { IsBoolean, IsEmail, IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { Auth } from '../auth/decorators/auth.decorator';
import { Lowercase, NormalizePhone, Trim } from '../common/normalize';

class ListCustomersQuery {
  @IsOptional()
  @Trim()
  @IsString()
  q?: string;
}

const PHONE_RULE = { message: 'Số điện thoại không hợp lệ' };

class CreateCustomerDto {
  @Lowercase()
  @IsEmail()
  email: string;

  @Trim()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  fullName: string;

  @IsOptional()
  @NormalizePhone()
  @Matches(/^(0|\+84)[0-9]{9}$/, PHONE_RULE)
  phone?: string;

  @IsString()
  @MinLength(6)
  @MaxLength(100)
  password: string;
}

class UpdateCustomerDto {
  @IsOptional()
  @Trim()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  fullName?: string;

  @IsOptional()
  @NormalizePhone()
  @Matches(/^(0|\+84)[0-9]{9}$/, PHONE_RULE)
  phone?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  // Đặt lại mật khẩu cho khách (quên mật khẩu).
  @IsOptional()
  @IsString()
  @MinLength(6)
  @MaxLength(100)
  password?: string;
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

  // Admin tạo tài khoản khách (luôn vào nhóm Customer).
  async create(dto: CreateCustomerDto) {
    const [dupEmail, dupStaff, dupPhone, group] = await Promise.all([
      this.prisma.user.findUnique({ where: { email: dto.email } }),
      this.prisma.staff.findUnique({ where: { email: dto.email } }),
      dto.phone ? this.prisma.user.findUnique({ where: { phone: dto.phone } }) : null,
      this.prisma.group.findUniqueOrThrow({ where: { key: 'customer' } }),
    ]);
    if (dupEmail || dupStaff) throw new ConflictException('Email đã được sử dụng');
    if (dupPhone) throw new ConflictException('Số điện thoại đã được sử dụng');

    await this.prisma.user.create({
      data: {
        email: dto.email,
        phone: dto.phone,
        fullName: dto.fullName,
        passwordHash: await bcrypt.hash(dto.password, 10),
        groupId: group.id,
      },
    });
    return this.find(dto.email);
  }

  async update(id: string, dto: UpdateCustomerDto) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('Không tìm thấy khách hàng');
    if (dto.phone && dto.phone !== user.phone) {
      if (await this.prisma.user.findUnique({ where: { phone: dto.phone } })) {
        throw new ConflictException('Số điện thoại đã được sử dụng');
      }
    }

    const { password, ...rest } = dto;
    await this.prisma.user.update({
      where: { id },
      data: { ...rest, ...(password && { passwordHash: await bcrypt.hash(password, 10), passwordChangedAt: new Date() }) },
    });
    return this.find(user.email);
  }

  private async find(email: string) {
    return (await this.list(email)).find((c) => c.email === email);
  }
}

@Controller('api/admin/customers')
export class CustomersController {
  constructor(private readonly customers: CustomersService) {}

  @Get()
  @Auth('admin.access', 'customers.view')
  list(@Query() query: ListCustomersQuery) {
    return this.customers.list(query.q);
  }

  // Tạo / sửa / khóa / đặt lại mật khẩu khách: cần quyền "Quản lý nhóm & tài khoản".
  @Post()
  @Auth('admin.access', 'groups.manage')
  create(@Body() dto: CreateCustomerDto) {
    return this.customers.create(dto);
  }

  @Patch(':id')
  @Auth('admin.access', 'groups.manage')
  update(@Param('id') id: string, @Body() dto: UpdateCustomerDto) {
    return this.customers.update(id, dto);
  }
}

@Module({
  controllers: [CustomersController],
  providers: [CustomersService],
})
export class CustomersModule {}
