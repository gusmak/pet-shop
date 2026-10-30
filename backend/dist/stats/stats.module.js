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
exports.StatsModule = exports.StatsController = exports.StatsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const auth_decorator_1 = require("../auth/decorators/auth.decorator");
const current_user_decorator_1 = require("../auth/decorators/current-user.decorator");
const bookings_service_1 = require("../bookings/bookings.service");
let StatsService = class StatsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async dashboard(user) {
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
            recent: recent.map(bookings_service_1.toBookingDto),
        };
        if (!user.permissions.includes('dashboard.revenue'))
            return base;
        return {
            ...base,
            revenue: grouped.find((g) => g.status === 'COMPLETED')?._sum.total ?? 0,
            activeServices: await this.prisma.service.count({ where: { isActive: true } }),
        };
    }
};
exports.StatsService = StatsService;
exports.StatsService = StatsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], StatsService);
let StatsController = class StatsController {
    stats;
    constructor(stats) {
        this.stats = stats;
    }
    dashboard(user) {
        return this.stats.dashboard(user);
    }
};
exports.StatsController = StatsController;
__decorate([
    (0, auth_decorator_1.Auth)('admin.access'),
    (0, common_1.Get)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], StatsController.prototype, "dashboard", null);
exports.StatsController = StatsController = __decorate([
    (0, common_1.Controller)('api/admin/stats'),
    __metadata("design:paramtypes", [StatsService])
], StatsController);
let StatsModule = class StatsModule {
};
exports.StatsModule = StatsModule;
exports.StatsModule = StatsModule = __decorate([
    (0, common_1.Module)({
        controllers: [StatsController],
        providers: [StatsService],
    })
], StatsModule);
//# sourceMappingURL=stats.module.js.map