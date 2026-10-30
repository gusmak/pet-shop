import { PrismaService } from '../prisma/prisma.service';
import type { AuthUser } from '../auth/strategies/jwt.strategy';
export declare class StatsService {
    private prisma;
    constructor(prisma: PrismaService);
    dashboard(user: AuthUser): Promise<{
        totalBookings: number;
        pending: number;
        counts: {
            [k: string]: number;
        };
        recent: {
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
    } | {
        revenue: number;
        activeServices: number;
        totalBookings: number;
        pending: number;
        counts: {
            [k: string]: number;
        };
        recent: {
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
    }>;
}
export declare class StatsController {
    private readonly stats;
    constructor(stats: StatsService);
    dashboard(user: AuthUser): Promise<{
        totalBookings: number;
        pending: number;
        counts: {
            [k: string]: number;
        };
        recent: {
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
    } | {
        revenue: number;
        activeServices: number;
        totalBookings: number;
        pending: number;
        counts: {
            [k: string]: number;
        };
        recent: {
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
    }>;
}
export declare class StatsModule {
}
