import { PrismaService } from '../prisma/prisma.service';
export declare class SetPermissionsDto {
    permissions: string[];
}
export declare class GroupsService {
    private prisma;
    constructor(prisma: PrismaService);
    list(): Promise<{
        groups: {
            key: string;
            name: string;
            description: string | null;
            isLocked: boolean;
            memberCount: number;
            permissions: string[];
        }[];
        permissions: {
            key: string;
            label: string;
        }[];
    }>;
    setPermissions(key: string, dto: SetPermissionsDto): Promise<{
        groups: {
            key: string;
            name: string;
            description: string | null;
            isLocked: boolean;
            memberCount: number;
            permissions: string[];
        }[];
        permissions: {
            key: string;
            label: string;
        }[];
    }>;
}
