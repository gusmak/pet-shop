import { StaffPosition } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import type { AuthUser } from '../auth/strategies/jwt.strategy';
declare const STAFF_GROUPS: readonly ["admin", "monitor"];
export declare class CreateStaffDto {
    fullName: string;
    email: string;
    phone: string;
    password: string;
    group: (typeof STAFF_GROUPS)[number];
    position: StaffPosition;
    specialties?: string[];
}
export declare class UpdateStaffDto {
    fullName?: string;
    phone?: string;
    group?: (typeof STAFF_GROUPS)[number];
    position?: StaffPosition;
    specialties?: string[];
    isActive?: boolean;
    password?: string;
}
export declare class StaffService {
    private prisma;
    constructor(prisma: PrismaService);
    private readonly include;
    list(): Promise<{
        id: string;
        fullName: string;
        email: string;
        phone: string;
        position: import(".prisma/client").$Enums.StaffPosition;
        specialties: string[];
        group: string;
        store: string;
        isActive: boolean;
        isSuper: boolean;
        hireDate: string;
        lastLoginAt: Date | null;
    }[]>;
    create(dto: CreateStaffDto): Promise<{
        id: string;
        fullName: string;
        email: string;
        phone: string;
        position: import(".prisma/client").$Enums.StaffPosition;
        specialties: string[];
        group: string;
        store: string;
        isActive: boolean;
        isSuper: boolean;
        hireDate: string;
        lastLoginAt: Date | null;
    }>;
    update(id: string, dto: UpdateStaffDto, actor: AuthUser): Promise<{
        id: string;
        fullName: string;
        email: string;
        phone: string;
        position: import(".prisma/client").$Enums.StaffPosition;
        specialties: string[];
        group: string;
        store: string;
        isActive: boolean;
        isSuper: boolean;
        hireDate: string;
        lastLoginAt: Date | null;
    }>;
    remove(id: string, actor: AuthUser): Promise<{
        success: boolean;
    }>;
}
export {};
