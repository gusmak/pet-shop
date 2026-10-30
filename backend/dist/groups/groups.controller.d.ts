import { GroupsService, SetPermissionsDto } from './groups.service';
export declare class GroupsController {
    private readonly groups;
    constructor(groups: GroupsService);
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
