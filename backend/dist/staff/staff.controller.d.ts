import { CreateStaffDto, StaffService, UpdateStaffDto } from './staff.service';
import type { AuthUser } from '../auth/strategies/jwt.strategy';
export declare class StaffController {
    private readonly staff;
    constructor(staff: StaffService);
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
    update(id: string, dto: UpdateStaffDto, user: AuthUser): Promise<{
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
    remove(id: string, user: AuthUser): Promise<{
        success: boolean;
    }>;
}
