import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, BookingStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { addMinutes, vnNow } from '../common/normalize';
import type { AuthUser } from '../auth/strategies/jwt.strategy';
import { CreateBookingDto, ListBookingsQuery, UpdateBookingStatusDto } from './dto/booking.dto';

const include = { services: { include: { service: true } } } satisfies Prisma.BookingInclude;
type BookingRow = Prisma.BookingGetPayload<{ include: typeof include }>;

// Trạng thái kết thúc không đổi được nữa.
const TRANSITIONS: Record<BookingStatus, BookingStatus[]> = {
  PENDING: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW'],
  IN_PROGRESS: ['COMPLETED', 'CANCELLED'],
  COMPLETED: [],
  CANCELLED: [],
  NO_SHOW: [],
};

// Không tính các lịch đã hủy/không đến vào sức chứa của khung giờ.
const INACTIVE: BookingStatus[] = ['CANCELLED', 'NO_SHOW'];

// Hình dạng gọn cho FE (khớp web/lib/demo.ts: DemoBooking), status chữ thường.
export const toBookingDto = (b: BookingRow) => ({
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

@Injectable()
export class BookingsService {
  constructor(private prisma: PrismaService) {}

  // Khách vãng lai hoặc khách đã đăng nhập (auth.type === 'customer') đều đặt được.
  async create(dto: CreateBookingDto, auth: AuthUser | null) {
    const now = vnNow();
    if (dto.date < now.date || (dto.date === now.date && dto.time <= now.time)) {
      throw new BadRequestException('Thời gian đặt lịch phải ở tương lai');
    }

    // Mỗi phần tử là id hoặc slug của dịch vụ; loại trùng.
    const refs = [...new Set(dto.services)];
    const [store, found] = await Promise.all([
      this.prisma.store.findFirst({ where: { isActive: true }, orderBy: { createdAt: 'asc' } }),
      this.prisma.service.findMany({
        where: { isActive: true, OR: [{ id: { in: refs } }, { slug: { in: refs } }] },
        include: { variants: true },
      }),
    ]);
    if (!store) throw new BadRequestException('Cửa hàng chưa được cấu hình');

    const picked = refs.map((r) => found.find((s) => s.id === r || s.slug === r));
    if (picked.some((s) => !s)) throw new BadRequestException('Có dịch vụ không tồn tại hoặc đã ngừng hoạt động');
    const chosen = picked as typeof found;

    // Mỗi nhóm chỉ chọn một dịch vụ — tránh những tổ hợp vô nghĩa như "tắm cơ bản" + "tắm spa cao cấp".
    if (new Set(chosen.map((s) => s.categoryId)).size < chosen.length) {
      throw new BadRequestException('Mỗi nhóm dịch vụ chỉ được chọn một (vd: một loại tắm, một kiểu cắt tỉa)');
    }

    // Giá theo size thú cưng (không có thì dùng giá gốc); thời lượng là tổng các dịch vụ.
    const lines = chosen.map((s) => {
      const variant = s.variants.find((v) => v.isActive && v.size === dto.petSize);
      return { serviceId: s.id, variantId: variant?.id, price: variant?.price ?? s.basePrice, duration: s.duration };
    });
    const total = lines.reduce((sum, l) => sum + l.price, 0);
    const endTime = addMinutes(
      dto.time,
      lines.reduce((sum, l) => sum + l.duration, 0),
    );
    if (dto.time < store.openTime || endTime > store.closeTime) {
      throw new BadRequestException(`Ngoài giờ làm việc (${store.openTime} - ${store.closeTime}), tổng thời lượng dịch vụ đã chọn kết thúc lúc ${endTime}`);
    }

    const date = new Date(`${dto.date}T00:00:00.000Z`);
    const userId = auth?.type === 'customer' ? auth.sub : null;

    const booking = await this.prisma.$transaction(async (tx) => {
      // Khóa theo (cửa hàng, ngày, giờ) để hai người đặt cùng lúc không vượt sức chứa.
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${`${store.id}|${dto.date}|${dto.time}`}))`;

      const taken = await tx.booking.count({
        where: { storeId: store.id, date, startTime: dto.time, status: { notIn: INACTIVE } },
      });
      if (taken >= store.slotCapacity) throw new ConflictException('Khung giờ này đã kín, vui lòng chọn giờ khác');

      // Khách đã đăng nhập: lưu hồ sơ thú cưng (tạo mới nếu chưa có cùng tên).
      let petId: string | null = null;
      if (userId) {
        const pet =
          (await tx.pet.findFirst({ where: { ownerId: userId, name: dto.petName, isActive: true } })) ??
          (await tx.pet.create({
            data: { ownerId: userId, name: dto.petName, species: dto.petSpecies, size: dto.petSize },
          }));
        petId = pet.id;
      }

      const created = await tx.booking.create({
        data: {
          bookingNumber: `TMP-${crypto.randomUUID()}`, // thay bằng mã đẹp ngay bên dưới
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

    return toBookingDto(booking);
  }

  // Khách vãng lai tra cứu bằng mã + SĐT (cả hai phải khớp).
  async lookup(number: string, phone: string) {
    const booking = await this.prisma.booking.findFirst({
      where: { bookingNumber: number.toUpperCase(), customerPhone: phone },
      include,
    });
    if (!booking) throw new NotFoundException('Không tìm thấy lịch hẹn');
    return toBookingDto(booking);
  }

  async listMine(userId: string) {
    const rows = await this.prisma.booking.findMany({ where: { userId }, include, orderBy: { createdAt: 'desc' } });
    return rows.map(toBookingDto);
  }

  async cancelMine(userId: string, id: string) {
    const booking = await this.prisma.booking.findUnique({ where: { id } });
    // Trả 404 cho cả "không tồn tại" lẫn "của người khác" để không lộ id.
    if (!booking || booking.userId !== userId) throw new NotFoundException('Không tìm thấy lịch hẹn');
    if (booking.status !== 'PENDING' && booking.status !== 'CONFIRMED') {
      throw new BadRequestException('Chỉ hủy được lịch đang chờ hoặc đã xác nhận');
    }
    const updated = await this.prisma.booking.update({
      where: { id },
      data: { status: 'CANCELLED', cancelledAt: new Date(), cancelReason: 'Khách hủy' },
      include,
    });
    return toBookingDto(updated);
  }

  // ── Quản trị ────────────────────────────────────────────────
  async adminList(query: ListBookingsQuery) {
    const where: Prisma.BookingWhereInput = {
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
      this.prisma.booking.groupBy({ by: ['status'], _count: { _all: true } }), // số liệu thẻ thống kê (toàn bộ)
    ]);

    return {
      items: rows.map(toBookingDto),
      total,
      page,
      pageSize,
      counts: Object.fromEntries(grouped.map((g) => [g.status.toLowerCase(), g._count._all])),
    };
  }

  async updateStatus(id: string, dto: UpdateBookingStatusDto, actor: AuthUser) {
    if (actor.type !== 'admin') throw new ForbiddenException('Chỉ nhân viên mới đổi được trạng thái');
    const booking = await this.prisma.booking.findUnique({ where: { id } });
    if (!booking) throw new NotFoundException('Không tìm thấy lịch hẹn');
    if (!TRANSITIONS[booking.status].includes(dto.status)) {
      throw new BadRequestException(`Không thể chuyển từ ${booking.status} sang ${dto.status}`);
    }
    const updated = await this.prisma.booking.update({
      where: { id },
      data: {
        status: dto.status,
        ...(dto.status === 'CANCELLED' && { cancelledAt: new Date(), cancelReason: dto.reason ?? 'Cửa hàng hủy' }),
        ...(dto.status === 'COMPLETED' && { completedAt: new Date() }),
        assignedToId: booking.assignedToId ?? actor.sub, // người xử lý đầu tiên
      },
      include,
    });
    return toBookingDto(updated);
  }
}
