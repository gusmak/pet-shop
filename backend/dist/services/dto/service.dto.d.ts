import { PetSize } from '@prisma/client';
export declare class VariantDto {
    size: PetSize;
    price: number;
}
export declare class CreateServiceDto {
    name: string;
    category: string;
    description: string;
    basePrice: number;
    duration: number;
    features?: string[];
    isActive?: boolean;
    isFeatured?: boolean;
    isPopular?: boolean;
    variants?: VariantDto[];
}
export declare class UpdateServiceDto {
    name?: string;
    category?: string;
    description?: string;
    basePrice?: number;
    duration?: number;
    features?: string[];
    isActive?: boolean;
    isFeatured?: boolean;
    isPopular?: boolean;
    variants?: VariantDto[];
}
