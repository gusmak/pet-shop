import { PrismaService } from '../prisma/prisma.service';
declare class ListCustomersQuery {
    q?: string;
}
export declare class CustomersService {
    private prisma;
    constructor(prisma: PrismaService);
    list(q?: string): Promise<{
        id: string;
        fullName: string;
        email: string;
        phone: string | null;
        group: string;
        pets: number;
        bookings: number;
        totalSpent: number;
        isActive: boolean;
        createdAt: string;
    }[]>;
}
export declare class CustomersController {
    private readonly customers;
    constructor(customers: CustomersService);
    list(query: ListCustomersQuery): Promise<{
        id: string;
        fullName: string;
        email: string;
        phone: string | null;
        group: string;
        pets: number;
        bookings: number;
        totalSpent: number;
        isActive: boolean;
        createdAt: string;
    }[]>;
}
export declare class CustomersModule {
}
export {};
