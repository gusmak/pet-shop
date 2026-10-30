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
exports.GroupsService = exports.SetPermissionsDto = void 0;
const common_1 = require("@nestjs/common");
const class_validator_1 = require("class-validator");
const prisma_service_1 = require("../prisma/prisma.service");
class SetPermissionsDto {
    permissions;
}
exports.SetPermissionsDto = SetPermissionsDto;
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ArrayUnique)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], SetPermissionsDto.prototype, "permissions", void 0);
const CUSTOMER_ALLOWED = ['account.view'];
let GroupsService = class GroupsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
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
        const members = (id) => (staffCounts.find((c) => c.groupId === id)?._count._all ?? 0) + (userCounts.find((c) => c.groupId === id)?._count._all ?? 0);
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
    async setPermissions(key, dto) {
        const group = await this.prisma.group.findUnique({ where: { key } });
        if (!group)
            throw new common_1.NotFoundException('Không tìm thấy nhóm');
        if (group.isLocked)
            throw new common_1.BadRequestException('Nhóm này có quyền cố định, không chỉnh được');
        const perms = await this.prisma.permission.findMany({ where: { key: { in: dto.permissions } } });
        const unknown = dto.permissions.filter((k) => !perms.some((p) => p.key === k));
        if (unknown.length)
            throw new common_1.BadRequestException(`Quyền không tồn tại: ${unknown.join(', ')}`);
        if (key === 'customer' && dto.permissions.some((k) => !CUSTOMER_ALLOWED.includes(k))) {
            throw new common_1.BadRequestException('Nhóm Customer chỉ có thể được cấp quyền: ' + CUSTOMER_ALLOWED.join(', '));
        }
        await this.prisma.$transaction([
            this.prisma.groupPermission.deleteMany({ where: { groupId: group.id } }),
            this.prisma.groupPermission.createMany({ data: perms.map((p) => ({ groupId: group.id, permissionId: p.id })) }),
        ]);
        return this.list();
    }
};
exports.GroupsService = GroupsService;
exports.GroupsService = GroupsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], GroupsService);
//# sourceMappingURL=groups.service.js.map