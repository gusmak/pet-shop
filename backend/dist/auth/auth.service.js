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
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const bcrypt = __importStar(require("bcrypt"));
const prisma_service_1 = require("../prisma/prisma.service");
const normalize_1 = require("../common/normalize");
const groupInclude = { include: { permissions: { include: { permission: true } } } };
const DUMMY_HASH = bcrypt.hashSync('petshop-dummy-password', 10);
const BAD_CREDENTIALS = 'Tên tài khoản hoặc mật khẩu không đúng';
let AuthService = class AuthService {
    prisma;
    jwt;
    constructor(prisma, jwt) {
        this.prisma = prisma;
        this.jwt = jwt;
    }
    token(payload) {
        return { accessToken: this.jwt.sign(payload), tokenType: 'Bearer', expiresIn: '7d' };
    }
    async login(dto) {
        const id = dto.identifier.includes('@') ? dto.identifier.toLowerCase() : (0, normalize_1.normalizePhone)(dto.identifier);
        const staff = id.includes('@')
            ? await this.prisma.staff.findUnique({ where: { email: id }, include: { group: groupInclude, store: true } })
            : null;
        if (staff) {
            const ok = await bcrypt.compare(dto.password, staff.passwordHash);
            if (!ok || !staff.isActive)
                throw new common_1.UnauthorizedException(BAD_CREDENTIALS);
            await this.prisma.staff.update({ where: { id: staff.id }, data: { lastLoginAt: new Date() } });
            return { ...this.token({ sub: staff.id, email: staff.email, type: 'admin' }), user: this.staffUser(staff) };
        }
        const user = await this.prisma.user.findFirst({
            where: { OR: [{ email: id }, { phone: id }] },
            include: { group: groupInclude },
        });
        const ok = await bcrypt.compare(dto.password, user?.passwordHash ?? DUMMY_HASH);
        if (!user || !ok || !user.isActive)
            throw new common_1.UnauthorizedException(BAD_CREDENTIALS);
        await this.prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
        return { ...this.token({ sub: user.id, email: user.email, type: 'customer' }), user: this.customerUser(user) };
    }
    async register(dto) {
        const dup = await this.prisma.user.findFirst({
            where: { OR: [{ email: dto.email }, ...(dto.phone ? [{ phone: dto.phone }] : [])] },
        });
        if (dup) {
            throw new common_1.ConflictException(dup.email === dto.email ? 'Email đã được sử dụng' : 'Số điện thoại đã được sử dụng');
        }
        if (await this.prisma.staff.findUnique({ where: { email: dto.email } })) {
            throw new common_1.ConflictException('Email đã được sử dụng');
        }
        const group = await this.prisma.group.findUniqueOrThrow({ where: { key: 'customer' } });
        const user = await this.prisma.user.create({
            data: {
                email: dto.email,
                phone: dto.phone,
                fullName: dto.fullName,
                passwordHash: await bcrypt.hash(dto.password, 10),
                groupId: group.id,
            },
            include: { group: groupInclude },
        });
        return { ...this.token({ sub: user.id, email: user.email, type: 'customer' }), user: this.customerUser(user) };
    }
    async getProfile(auth) {
        if (auth.type === 'admin') {
            const staff = await this.prisma.staff.findUnique({
                where: { id: auth.sub },
                include: { group: groupInclude, store: true },
            });
            if (!staff)
                throw new common_1.UnauthorizedException('Không tìm thấy tài khoản');
            return this.staffUser(staff);
        }
        const user = await this.prisma.user.findUnique({ where: { id: auth.sub }, include: { group: groupInclude } });
        if (!user)
            throw new common_1.UnauthorizedException('Không tìm thấy tài khoản');
        return this.customerUser(user);
    }
    async changePassword(auth, dto) {
        const model = auth.type === 'admin' ? this.prisma.staff : this.prisma.user;
        const account = await model.findUnique({ where: { id: auth.sub } });
        if (!account || !(await bcrypt.compare(dto.currentPassword, account.passwordHash))) {
            throw new common_1.BadRequestException('Mật khẩu hiện tại không đúng');
        }
        await model.update({
            where: { id: auth.sub },
            data: { passwordHash: await bcrypt.hash(dto.newPassword, 10) },
        });
        return { success: true };
    }
    permissionKeys(group) {
        return group.permissions.map((gp) => gp.permission.key);
    }
    staffUser(staff) {
        return {
            id: staff.id,
            email: staff.email,
            name: staff.fullName,
            phone: staff.phone,
            role: staff.group.key,
            permissions: this.permissionKeys(staff.group),
            position: staff.position,
            storeId: staff.storeId,
            storeName: staff.store.name,
            isSuper: staff.isSuperAdmin,
        };
    }
    customerUser(user) {
        return {
            id: user.id,
            email: user.email,
            name: user.fullName,
            phone: user.phone,
            role: user.group.key,
            permissions: this.permissionKeys(user.group),
            loyaltyPoints: user.loyaltyPoints,
        };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map