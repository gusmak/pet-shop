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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomersModule = exports.CustomersController = exports.CustomersService = void 0;
const common_1 = require("@nestjs/common");
const class_validator_1 = require("class-validator");
const prisma_service_1 = require("../prisma/prisma.service");
const auth_decorator_1 = require("../auth/decorators/auth.decorator");
const normalize_1 = require("../common/normalize");
class ListCustomersQuery {
    q;
}
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, normalize_1.Trim)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ListCustomersQuery.prototype, "q", void 0);
let CustomersService = class CustomersService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async list(q) {
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
};
exports.CustomersService = CustomersService;
exports.CustomersService = CustomersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CustomersService);
let CustomersController = class CustomersController {
    customers;
    constructor(customers) {
        this.customers = customers;
    }
    list(query) {
        return this.customers.list(query.q);
    }
};
exports.CustomersController = CustomersController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [ListCustomersQuery]),
    __metadata("design:returntype", void 0)
], CustomersController.prototype, "list", null);
exports.CustomersController = CustomersController = __decorate([
    (0, common_1.Controller)('api/admin/customers'),
    (0, auth_decorator_1.Auth)('admin.access', 'customers.view'),
    __metadata("design:paramtypes", [CustomersService])
], CustomersController);
let CustomersModule = class CustomersModule {
};
exports.CustomersModule = CustomersModule;
exports.CustomersModule = CustomersModule = __decorate([
    (0, common_1.Module)({
        controllers: [CustomersController],
        providers: [CustomersService],
    })
], CustomersModule);
//# sourceMappingURL=customers.module.js.map