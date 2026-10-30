"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StaffService = exports.UpdateStaffDto = exports.CreateStaffDto = void 0;
const common_1 = require("@nestjs/common");
const class_validator_1 = require("class-validator");
const client_1 = require("@prisma/client");
const bcrypt = __importStar(require("bcrypt"));
const prisma_service_1 = require("../prisma/prisma.service");
const normalize_1 = require("../common/normalize");
const STAFF_GROUPS = ['admin', 'monitor'];
class CreateStaffDto {
    fullName;
    email;
    phone;
    password;
    group;
    position;
    specialties;
}
exports.CreateStaffDto = CreateStaffDto;
__decorate([
    (0, normalize_1.Trim)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(2),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], CreateStaffDto.prototype, "fullName", void 0);
__decorate([
    (0, normalize_1.Lowercase)(),
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], CreateStaffDto.prototype, "email", void 0);
__decorate([
    (0, normalize_1.NormalizePhone)(),
    (0, class_validator_1.Matches)(/^(0|\+84)[0-9]{9}$/, { message: 'Số điện thoại không hợp lệ' }),
    __metadata("design:type", String)
], CreateStaffDto.prototype, "phone", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(6),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], CreateStaffDto.prototype, "password", void 0);
__decorate([
    (0, class_validator_1.IsIn)(STAFF_GROUPS),
    __metadata("design:type", Object)
], CreateStaffDto.prototype, "group", void 0);
__decorate([
    (0, normalize_1.Uppercase)(),
    (0, class_validator_1.IsEnum)(client_1.StaffPosition),
    __metadata("design:type", String)
], CreateStaffDto.prototype, "position", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], CreateStaffDto.prototype, "specialties", void 0);
class UpdateStaffDto {
    fullName;
    phone;
    group;
    position;
    specialties;
    isActive;
    password;
}
exports.UpdateStaffDto = UpdateStaffDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, normalize_1.Trim)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(2),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], UpdateStaffDto.prototype, "fullName", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, normalize_1.NormalizePhone)(),
    (0, class_validator_1.Matches)(/^(0|\+84)[0-9]{9}$/, { message: 'Số điện thoại không hợp lệ' }),
    __metadata("design:type", String)
], UpdateStaffDto.prototype, "phone", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(STAFF_GROUPS),
    __metadata("design:type", Object)
], UpdateStaffDto.prototype, "group", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, normalize_1.Uppercase)(),
    (0, class_validator_1.IsEnum)(client_1.StaffPosition),
    __metadata("design:type", String)
], UpdateStaffDto.prototype, "position", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], UpdateStaffDto.prototype, "specialties", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateStaffDto.prototype, "isActive", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(6),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], UpdateStaffDto.prototype, "password", void 0);
const toDto = (s) => ({
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
let StaffService = class StaffService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    include = { group: true, store: true };
    async list() {
        const rows = await this.prisma.staff.findMany({ include: this.include, orderBy: { createdAt: 'asc' } });
        return rows.map(toDto);
    }
    async create(dto) {
        const [emailTaken, phoneTaken, userEmail] = await Promise.all([
            this.prisma.staff.findUnique({ where: { email: dto.email } }),
            this.prisma.staff.findUnique({ where: { phone: dto.phone } }),
            this.prisma.user.findUnique({ where: { email: dto.email } }),
        ]);
        if (emailTaken || userEmail)
            throw new common_1.ConflictException('Email đã được sử dụng');
        if (phoneTaken)
            throw new common_1.ConflictException('Số điện thoại đã được sử dụng');
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
    async update(id, dto, actor) {
        const target = await this.prisma.staff.findUnique({ where: { id } });
        if (!target)
            throw new common_1.NotFoundException('Không tìm thấy nhân viên');
        if ((dto.group !== undefined || dto.isActive !== undefined) && (target.isSuperAdmin || target.id === actor.sub)) {
            throw new common_1.ForbiddenException(target.isSuperAdmin ? 'Super admin không thể đổi nhóm hoặc khóa' : 'Bạn không thể tự đổi nhóm hoặc khóa chính mình');
        }
        if (dto.phone && dto.phone !== target.phone && (await this.prisma.staff.findUnique({ where: { phone: dto.phone } }))) {
            throw new common_1.ConflictException('Số điện thoại đã được sử dụng');
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
    async remove(id, actor) {
        const target = await this.prisma.staff.findUnique({ where: { id } });
        if (!target)
            throw new common_1.NotFoundException('Không tìm thấy nhân viên');
        if (target.isSuperAdmin)
            throw new common_1.ForbiddenException('Không thể xóa super admin');
        if (target.id === actor.sub)
            throw new common_1.BadRequestException('Bạn không thể tự xóa tài khoản của mình');
        await this.prisma.staff.delete({ where: { id } });
        return { success: true };
    }
};
exports.StaffService = StaffService;
exports.StaffService = StaffService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], StaffService);
//# sourceMappingURL=staff.service.js.map