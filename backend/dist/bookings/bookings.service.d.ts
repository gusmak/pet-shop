import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import type { AuthUser } from '../auth/strategies/jwt.strategy';
import { CreateBookingDto, ListBookingsQuery, UpdateBookingStatusDto } from './dto/booking.dto';
declare const include: {
    services: {
        include: {
            service: true;
        };
    };
};
type BookingRow = Prisma.BookingGetPayload<{
    include: typeof include;
}>;
export declare const toBookingDto: (b: BookingRow) => {
    id: string;
    bookingNumber: string;
    customer: string;
    phone: string;
    pet: string;
    service: string;
    services: {
        name: string;
        price: number;
    }[];
    date: string;
    time: string;
    endTime: string;
    status: string;
    total: number;
    notes: string | null;
    cancelReason: string | null;
    userId: string | null;
};
export declare class BookingsService {
    private prisma;
    constructor(prisma: PrismaService);
    create(dto: CreateBookingDto, auth: AuthUser | null): Promise<{
        id: string;
        bookingNumber: string;
        customer: string;
        phone: string;
        pet: string;
        service: string;
        services: {
            name: string;
            price: number;
        }[];
        date: string;
        time: string;
        endTime: string;
        status: string;
        total: number;
        notes: string | null;
        cancelReason: string | null;
        userId: string | null;
    }>;
    lookup(number: string, phone: string): Promise<{
        id: string;
        bookingNumber: string;
        customer: string;
        phone: string;
        pet: string;
        service: string;
        services: {
            name: string;
            price: number;
        }[];
        date: string;
        time: string;
        endTime: string;
        status: string;
        total: number;
        notes: string | null;
        cancelReason: string | null;
        userId: string | null;
    }>;
    listMine(userId: string): Promise<{
        id: string;
        bookingNumber: string;
        customer: string;
        phone: string;
        pet: string;
        service: string;
        services: {
            name: string;
            price: number;
        }[];
        date: string;
        time: string;
        endTime: string;
        status: string;
        total: number;
        notes: string | null;
        cancelReason: string | null;
        userId: string | null;
    }[]>;
    cancelMine(userId: string, id: string): Promise<{
        id: string;
        bookingNumber: string;
        customer: string;
        phone: string;
        pet: string;
        service: string;
        services: {
            name: string;
            price: number;
        }[];
        date: string;
        time: string;
        endTime: string;
        status: string;
        total: number;
        notes: string | null;
        cancelReason: string | null;
        userId: string | null;
    }>;
    adminList(query: ListBookingsQuery): Promise<{
        items: {
            id: string;
            bookingNumber: string;
            customer: string;
            phone: string;
            pet: string;
            service: string;
            services: {
                name: string;
                price: number;
            }[];
            date: string;
            time: string;
            endTime: string;
            status: string;
            total: number;
            notes: string | null;
            cancelReason: string | null;
            userId: string | null;
        }[];
        total: number;
        page: number;
        pageSize: number;
        counts: {
            [k: string]: number;
        };
    }>;
    updateStatus(id: string, dto: UpdateBookingStatusDto, actor: AuthUser): Promise<{
        id: string;
        bookingNumber: string;
        customer: string;
        phone: string;
        pet: string;
        service: string;
        services: {
            name: string;
            price: number;
        }[];
        date: string;
        time: string;
        endTime: string;
        status: string;
        total: number;
        notes: string | null;
        cancelReason: string | null;
        userId: string | null;
    }>;
}
export {};
