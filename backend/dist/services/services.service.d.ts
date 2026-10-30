import { PrismaService } from '../prisma/prisma.service';
import { CreateServiceDto, UpdateServiceDto } from './dto/service.dto';
export declare class ServicesService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(): import(".prisma/client").Prisma.PrismaPromise<({
        category: {
            id: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            description: string | null;
            slug: string;
            displayOrder: number;
            icon: string | null;
        };
        variants: {
            id: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            size: import(".prisma/client").$Enums.PetSize;
            price: number;
            serviceId: string;
        }[];
    } & {
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        description: string;
        slug: string;
        basePrice: number;
        duration: number;
        features: string[];
        isFeatured: boolean;
        isPopular: boolean;
        categoryId: string;
        imageUrl: string | null;
        displayOrder: number;
    })[]>;
    findBySlug(slug: string): import(".prisma/client").Prisma.Prisma__ServiceClient<({
        category: {
            id: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            description: string | null;
            slug: string;
            displayOrder: number;
            icon: string | null;
        };
        variants: {
            id: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            size: import(".prisma/client").$Enums.PetSize;
            price: number;
            serviceId: string;
        }[];
    } & {
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        description: string;
        slug: string;
        basePrice: number;
        duration: number;
        features: string[];
        isFeatured: boolean;
        isPopular: boolean;
        categoryId: string;
        imageUrl: string | null;
        displayOrder: number;
    }) | null, null, import("@prisma/client/runtime/library").DefaultArgs>;
    findByCategory(categorySlug: string): import(".prisma/client").Prisma.PrismaPromise<({
        category: {
            id: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            description: string | null;
            slug: string;
            displayOrder: number;
            icon: string | null;
        };
        variants: {
            id: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            size: import(".prisma/client").$Enums.PetSize;
            price: number;
            serviceId: string;
        }[];
    } & {
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        description: string;
        slug: string;
        basePrice: number;
        duration: number;
        features: string[];
        isFeatured: boolean;
        isPopular: boolean;
        categoryId: string;
        imageUrl: string | null;
        displayOrder: number;
    })[]>;
    findCategories(): import(".prisma/client").Prisma.PrismaPromise<{
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        description: string | null;
        slug: string;
        displayOrder: number;
        icon: string | null;
    }[]>;
    adminList(): import(".prisma/client").Prisma.PrismaPromise<({
        category: {
            id: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            description: string | null;
            slug: string;
            displayOrder: number;
            icon: string | null;
        };
        variants: {
            id: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            size: import(".prisma/client").$Enums.PetSize;
            price: number;
            serviceId: string;
        }[];
    } & {
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        description: string;
        slug: string;
        basePrice: number;
        duration: number;
        features: string[];
        isFeatured: boolean;
        isPopular: boolean;
        categoryId: string;
        imageUrl: string | null;
        displayOrder: number;
    })[]>;
    private resolveCategory;
    private uniqueSlug;
    create(dto: CreateServiceDto): Promise<{
        category: {
            id: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            description: string | null;
            slug: string;
            displayOrder: number;
            icon: string | null;
        };
        variants: {
            id: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            size: import(".prisma/client").$Enums.PetSize;
            price: number;
            serviceId: string;
        }[];
    } & {
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        description: string;
        slug: string;
        basePrice: number;
        duration: number;
        features: string[];
        isFeatured: boolean;
        isPopular: boolean;
        categoryId: string;
        imageUrl: string | null;
        displayOrder: number;
    }>;
    update(id: string, dto: UpdateServiceDto): Promise<{
        category: {
            id: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            description: string | null;
            slug: string;
            displayOrder: number;
            icon: string | null;
        };
        variants: {
            id: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            size: import(".prisma/client").$Enums.PetSize;
            price: number;
            serviceId: string;
        }[];
    } & {
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        description: string;
        slug: string;
        basePrice: number;
        duration: number;
        features: string[];
        isFeatured: boolean;
        isPopular: boolean;
        categoryId: string;
        imageUrl: string | null;
        displayOrder: number;
    }>;
    remove(id: string): Promise<{
        success: boolean;
    }>;
}
