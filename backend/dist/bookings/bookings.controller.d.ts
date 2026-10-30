import { BookingsService } from './bookings.service';
import { CreateBookingDto, ListBookingsQuery, LookupBookingDto, UpdateBookingStatusDto } from './dto/booking.dto';
import type { AuthUser } from '../auth/strategies/jwt.strategy';
export declare class BookingsController {
    private readonly bookings;
    constructor(bookings: BookingsService);
    create(dto: CreateBookingDto, user: AuthUser | null): Promise<{
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
    lookup(q: LookupBookingDto): Promise<{
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
    mine(userId: string): Promise<{
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
    cancel(userId: string, id: string): Promise<{
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
export declare class AdminBookingsController {
    private readonly bookings;
    constructor(bookings: BookingsService);
    list(query: ListBookingsQuery): Promise<{
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
    updateStatus(id: string, dto: UpdateBookingStatusDto, user: AuthUser): Promise<{
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
