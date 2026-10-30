import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { IsArray, IsBoolean, IsEmail, IsEnum, IsIn, IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';
import { Staff, StaffPosition } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { Lowercase, NormalizePhone, Trim, Uppercase } from '../common/normalize';
import type { AuthUser } from '../auth/strategies/jwt.strategy';

// Nhân viên chỉ thuộc nhóm admin hoặc monitor (khách luôn ở nhóm customer).
const STAFF_GROUPS = ['admin', 'monitor'] as const;

export class CreateStaffDto {
  @Trim()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  fullName: string;

  @Lowercase()
  @IsEmail()
  email: string;

  @NormalizePhone()
  @Matches(/^(0|\+84)[0-9]{9}$/, { message: 'Số điện thoại không hợp lệ' })
  phone: string;

  @IsString()
  @MinLength(6)
  @MaxLength(100)
  password: string;

  @IsIn(STAFF_GROUPS)
  group: (typeof STAFF_GROUPS)[number];

  @Uppercase()
  @IsEnum(StaffPosition)
  position: StaffPosition;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  specialties?: string[];
}

export class UpdateStaffDto {
  @IsOptional()
  @Trim()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  fullName?: string;

  @IsOptional()
  @NormalizePhone()
  @Matches(/^(0|\+84)[0-9]{9}$/, { message: 'Số điện thoại không hợp lệ' })
  phone?: string;

  @IsOptional()
  @IsIn(STAFF_GROUPS)
  group?: (typeof STAFF_GROUPS)[number];

  @IsOptional()
  @Uppercase()
  @IsEnum(StaffPosition)
  position?: StaffPosition;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  specialties?: string[];

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  // Admin đặt lại mật khẩu cho nhân viên
  @IsOptional()
  @IsString()
  @MinLength(6)
  @MaxLength(100)
  password?: string;
}

type StaffWithGroup = Staff & { group: { key: string }; store: { name: string } };

const toDto = (s: StaffWithGroup) => ({
  id: s.id,
  fullName: s.fullName,
  email: s.email,
  phone: s.phone,
  position: s.position,
  specialties: s.specialties,
  group: s.group.key,
  store: s.store.name,
  isActive: s.isActive,
  isSuper: s.isSuperAdmin,
  hireDate: s.hireDate.toISOString().slice(0, 10),
  lastLoginAt: s.lastLoginAt,
});

@Injectable()
export class StaffService {
  constructor(private prisma: PrismaService) {}

  private readonly include = { group: true, store: true } as const;

  async list() {
    const rows = await this.prisma.staff.findMany({ include: this.include, orderBy: { createdAt: 'asc' } });
    return rows.map(toDto);
  }

  async create(dto: CreateStaffDto) {
    const [emailTaken, phoneTaken, userEmail] = await Promise.all([
      this.prisma.staff.findUnique({ where: { email: dto.email } }),
      this.prisma.staff.findUnique({ where: { phone: dto.phone } }),
      this.prisma.user.findUnique({ where: { email: dto.email } }),
    ]);
    if (emailTaken || userEmail) throw new ConflictException('Email đã được sử dụng');
    if (phoneTaken) throw new ConflictException('Số điện thoại đã được sử dụng');

    const [group, store, count] = await Promise.all([
      this.prisma.group.findUniqueOrThrow({ where: { key: dto.group } }),
      this.prisma.store.findFirstOrThrow({ where: { isActive: true }, orderBy: { createdAt: 'asc' } }),
      this.prisma.staff.count(),
    ]);

    const row = await this.prisma.staff.create({
      data: {
        fullName: dto.fullName,
        email: dto.email,
        phone: dto.phone,
        passwordHash: await bcrypt.hash(dto.password, 10),
        position: dto.position,
        specialties: dto.specialties ?? [],
        employeeCode: `NV${String(count + 1).padStart(3, '0')}${Date.now().toString(36).slice(-3).toUpperCase()}`,
        hireDate: new Date(),
        groupId: group.id,
        storeId: store.id,
      },
      include: this.include,
    });
    return toDto(row);
  }

  async update(id: string, dto: UpdateStaffDto, actor: AuthUser) {
    const target = await this.prisma.staff.findUnique({ where: { id } });
    if (!target) throw new NotFoundException('Không tìm thấy nhân viên');

    // Super admin: không đổi nhóm, không khóa. Không ai tự đổi nhóm/khóa chính mình.
    if ((dto.group !== undefined || dto.isActive !== undefined) && (target.isSuperAdmin || target.id === actor.sub)) {
      throw new ForbiddenException(
        target.isSuperAdmin ? 'Super admin không thể đổi nhóm hoặc khóa' : 'Bạn không thể tự đổi nhóm hoặc khóa chính mình',
      );
    }
    if (dto.phone && dto.phone !== target.phone && (await this.prisma.staff.findUnique({ where: { phone: dto.phone } }))) {
      throw new ConflictException('Số điện thoại đã được sử dụng');
    }

    const { group, password, ...rest } = dto;
    const row = await this.prisma.staff.update({
      where: { id },
      data: {
        ...rest,
        ...(group && { groupId: (await this.prisma.group.findUniqueOrThrow({ where: { key: group } })).id }),
        ...(password && { passwordHash: await bcrypt.hash(password, 10) }),
      },
      include: this.include,
    });
    return toDto(row);
  }

  async remove(id: string, actor: AuthUser) {
    const target = await this.prisma.staff.findUnique({ where: { id } });
    if (!target) throw new NotFoundException('Không tìm thấy nhân viên');
    if (target.isSuperAdmin) throw new ForbiddenException('Không thể xóa super admin');
    if (target.id === actor.sub) throw new BadRequestException('Bạn không thể tự xóa tài khoản của mình');
    await this.prisma.staff.delete({ where: { id } }); // bài viết/lịch đã xử lý giữ lại (author_id/assigned_to_id -> NULL)
    return { success: true };
  }
}
