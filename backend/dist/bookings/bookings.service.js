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
exports.BookingsService = exports.toBookingDto = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const normalize_1 = require("../common/normalize");
const include = { services: { include: { service: true } } };
const TRANSITIONS = {
    PENDING: ['CONFIRMED', 'CANCELLED'],
    CONFIRMED: ['IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW'],
    IN_PROGRESS: ['COMPLETED', 'CANCELLED'],
    COMPLETED: [],
    CANCELLED: [],
    NO_SHOW: [],
};
const INACTIVE = ['CANCELLED', 'NO_SHOW'];
const toBookingDto = (b) => ({
    id: b.id,
    bookingNumber: b.bookingNumber,
    customer: b.customerName,
    phone: b.customerPhone,
    pet: b.petName,
    service: b.services.map((s) => s.service.name).join(', '),
    services: b.services.map((s) => ({ name: s.service.name, price: s.price })),
    date: b.date.toISOString().slice(0, 10),
    time: b.startTime,
    endTime: b.endTime,
    status: b.status.toLowerCase(),
    total: b.total,
    notes: b.customerNotes,
    cancelReason: b.cancelReason,
    userId: b.userId,
});
exports.toBookingDto = toBookingDto;
let BookingsService = class BookingsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(dto, auth) {
        const now = (0, normalize_1.vnNow)();
        if (dto.date < now.date || (dto.date === now.date && dto.time <= now.time)) {
            throw new common_1.BadRequestException('Thời gian đặt lịch phải ở tương lai');
        }
        const refs = [...new Set(dto.services)];
        const [store, found] = await Promise.all([
            this.prisma.store.findFirst({ where: { isActive: true }, orderBy: { createdAt: 'asc' } }),
            this.prisma.service.findMany({
                where: { isActive: true, OR: [{ id: { in: refs } }, { slug: { in: refs } }] },
                include: { variants: true },
            }),
        ]);
        if (!store)
            throw new common_1.BadRequestException('Cửa hàng chưa được cấu hình');
        const picked = refs.map((r) => found.find((s) => s.id === r || s.slug === r));
        if (picked.some((s) => !s))
            throw new common_1.BadRequestException('Có dịch vụ không tồn tại hoặc đã ngừng hoạt động');
        const chosen = picked;
        if (new Set(chosen.map((s) => s.categoryId)).size < chosen.length) {
            throw new common_1.BadRequestException('Mỗi nhóm dịch vụ chỉ được chọn một (vd: một loại tắm, một kiểu cắt tỉa)');
        }
        const lines = chosen.map((s) => {
            const variant = s.variants.find((v) => v.isActive && v.size === dto.petSize);
            return { serviceId: s.id, variantId: variant?.id, price: variant?.price ?? s.basePrice, duration: s.duration };
        });
        const total = lines.reduce((sum, l) => sum + l.price, 0);
        const endTime = (0, normalize_1.addMinutes)(dto.time, lines.reduce((sum, l) => sum + l.duration, 0));
        if (dto.time < store.openTime || endTime > store.closeTime) {
            throw new common_1.BadRequestException(`Ngoài giờ làm việc (${store.openTime} - ${store.closeTime}), tổng thời lượng dịch vụ đã chọn kết thúc lúc ${endTime}`);
        }
        const date = new Date(`${dto.date}T00:00:00.000Z`);
        const userId = auth?.type === 'customer' ? auth.sub : null;
        const booking = await this.prisma.$transaction(async (tx) => {
            await tx.$executeRaw `SELECT pg_advisory_xact_lock(hashtext(${`${store.id}|${dto.date}|${dto.time}`}))`;
            const taken = await tx.booking.count({
                where: { storeId: store.id, date, startTime: dto.time, status: { notIn: INACTIVE } },
            });
            if (taken >= store.slotCapacity)
                throw new common_1.ConflictException('Khung giờ này đã kín, vui lòng chọn giờ khác');
            let petId = null;
            if (userId) {
                const pet = (await tx.pet.findFirst({ where: { ownerId: userId, name: dto.petName, isActive: true } })) ??
                    (await tx.pet.create({
                        data: { ownerId: userId, name: dto.petName, species: dto.petSpecies, size: dto.petSize },
                    }));
                petId = pet.id;
            }
            const created = await tx.booking.create({
                data: {
                    bookingNumber: `TMP-${crypto.randomUUID()}`,
                    userId,
                    petId,
                    customerName: dto.customerName,
                    customerPhone: dto.customerPhone,
                    customerEmail: dto.customerEmail,
                    petName: dto.petName,
                    petSpecies: dto.petSpecies,
                    petSize: dto.petSize,
                    storeId: store.id,
                    date,
                    startTime: dto.time,
                    endTime,
                    customerNotes: dto.notes,
                    total,
                    services: { create: lines.map((l) => ({ serviceId: l.serviceId, variantId: l.variantId, price: l.price, quantity: 1 })) },
                },
            });
            return tx.booking.update({
                where: { id: created.id },
                data: { bookingNumber: `BK-${now.date.replace(/-/g, '')}-${String(created.bookingSeq).padStart(4, '0')}` },
                include,
            });
        });
        return (0, exports.toBookingDto)(booking);
    }
    async lookup(number, phone) {
        const booking = await this.prisma.booking.findFirst({
            where: { bookingNumber: number.toUpperCase(), customerPhone: phone },
            include,
        });
        if (!booking)
            throw new common_1.NotFoundException('Không tìm thấy lịch hẹn');
        return (0, exports.toBookingDto)(booking);
    }
    async listMine(userId) {
        const rows = await this.prisma.booking.findMany({ where: { userId }, include, orderBy: { createdAt: 'desc' } });
        return rows.map(exports.toBookingDto);
    }
    async cancelMine(userId, id) {
        const booking = await this.prisma.booking.findUnique({ where: { id } });
        if (!booking || booking.userId !== userId)
            throw new common_1.NotFoundException('Không tìm thấy lịch hẹn');
        if (booking.status !== 'PENDING' && booking.status !== 'CONFIRMED') {
            throw new common_1.BadRequestException('Chỉ hủy được lịch đang chờ hoặc đã xác nhận');
        }
        const updated = await this.prisma.booking.update({
            where: { id },
            data: { status: 'CANCELLED', cancelledAt: new Date(), cancelReason: 'Khách hủy' },
            include,
        });
        return (0, exports.toBookingDto)(updated);
    }
    async adminList(query) {
        const where = {
            ...(query.status && { status: query.status }),
            ...(query.date && { date: new Date(`${query.date}T00:00:00.000Z`) }),
            ...(query.q && {
                OR: [
                    { bookingNumber: { contains: query.q, mode: 'insensitive' } },
                    { customerName: { contains: query.q, mode: 'insensitive' } },
                    { customerPhone: { contains: query.q.replace(/[\s.\-]/g, '') } },
                    { petName: { contains: query.q, mode: 'insensitive' } },
                ],
            }),
        };
        const page = query.page ?? 1;
        const pageSize = query.pageSize ?? 50;
        const [rows, total, grouped] = await Promise.all([
            this.prisma.booking.findMany({
                where,
                include,
                orderBy: [{ date: 'desc' }, { startTime: 'desc' }],
                skip: (page - 1) * pageSize,
                take: pageSize,
            }),
            this.prisma.booking.count({ where }),
            this.prisma.booking.groupBy({ by: ['status'], _count: { _all: true } }),
        ]);
        return {
            items: rows.map(exports.toBookingDto),
            total,
            page,
            pageSize,
            counts: Object.fromEntries(grouped.map((g) => [g.status.toLowerCase(), g._count._all])),
        };
    }
    async updateStatus(id, dto, actor) {
        if (actor.type !== 'admin')
            throw new common_1.ForbiddenException('Chỉ nhân viên mới đổi được trạng thái');
        const booking = await this.prisma.booking.findUnique({ where: { id } });
        if (!booking)
            throw new common_1.NotFoundException('Không tìm thấy lịch hẹn');
        if (!TRANSITIONS[booking.status].includes(dto.status)) {
            throw new common_1.BadRequestException(`Không thể chuyển từ ${booking.status} sang ${dto.status}`);
        }
        const updated = await this.prisma.booking.update({
            where: { id },
            data: {
                status: dto.status,
                ...(dto.status === 'CANCELLED' && { cancelledAt: new Date(), cancelReason: dto.reason ?? 'Cửa hàng hủy' }),
                ...(dto.status === 'COMPLETED' && { completedAt: new Date() }),
                assignedToId: booking.assignedToId ?? actor.sub,
            },
            include,
        });
        return (0, exports.toBookingDto)(updated);
    }
};
exports.BookingsService = BookingsService;
exports.BookingsService = BookingsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], BookingsService);
//# sourceMappingURL=bookings.service.js.map