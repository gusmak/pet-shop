import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ArrayUnique, IsArray, IsString } from 'class-validator';
import { PrismaService } from '../prisma/prisma.service';

export class SetPermissionsDto {
  @IsArray()
  @ArrayUnique()
  @IsString({ each: true })
  permissions: string[];
}

// Khách hàng chỉ được phép những quyền "của chính mình" — các quyền quản trị cấp cho họ sẽ vô nghĩa và nguy hiểm.
const CUSTOMER_ALLOWED = ['account.view'];

@Injectable()
export class GroupsService {
  constructor(private prisma: PrismaService) {}

  async list() {
    const [groups, permissions, staffCounts, userCounts] = await Promise.all([
      this.prisma.group.findMany({
        include: { permissions: { include: { permission: true } } },
        orderBy: { createdAt: 'asc' },
      }),
      this.prisma.permission.findMany({ orderBy: { key: 'asc' } }),
      this.prisma.staff.groupBy({ by: ['groupId'], _count: { _all: true } }),
      this.prisma.user.groupBy({ by: ['groupId'], _count: { _all: true } }),
    ]);

    const members = (id: string) =>
      (staffCounts.find((c) => c.groupId === id)?._count._all ?? 0) + (userCounts.find((c) => c.groupId === id)?._count._all ?? 0);

    return {
      groups: groups.map((g) => ({
        key: g.key,
        name: g.name,
        description: g.description,
        isLocked: g.isLocked,
        memberCount: members(g.id),
        permissions: g.permissions.map((gp) => gp.permission.key),
      })),
      permissions: permissions.map((p) => ({ key: p.key, label: p.label })),
    };
  }

  async setPermissions(key: string, dto: SetPermissionsDto) {
    const group = await this.prisma.group.findUnique({ where: { key } });
    if (!group) throw new NotFoundException('Không tìm thấy nhóm');
    if (group.isLocked) throw new BadRequestException('Nhóm này có quyền cố định, không chỉnh được');

    const perms = await this.prisma.permission.findMany({ where: { key: { in: dto.permissions } } });
    const unknown = dto.permissions.filter((k) => !perms.some((p) => p.key === k));
    if (unknown.length) throw new BadRequestException(`Quyền không tồn tại: ${unknown.join(', ')}`);

    if (key === 'customer' && dto.permissions.some((k) => !CUSTOMER_ALLOWED.includes(k))) {
      throw new BadRequestException('Nhóm Customer chỉ có thể được cấp quyền: ' + CUSTOMER_ALLOWED.join(', '));
    }

    await this.prisma.$transaction([
      this.prisma.groupPermission.deleteMany({ where: { groupId: group.id } }),
      this.prisma.groupPermission.createMany({ data: perms.map((p) => ({ groupId: group.id, permissionId: p.id })) }),
    ]);
    return this.list();
  }
}
