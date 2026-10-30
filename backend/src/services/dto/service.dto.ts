import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { PetSize } from '@prisma/client';
import { Trim, Uppercase } from '../../common/normalize';

export class VariantDto {
  @Uppercase()
  @IsEnum(PetSize)
  size: PetSize;

  @IsInt()
  @Min(0)
  @Max(100_000_000)
  price: number;
}

export class CreateServiceDto {
  @Trim()
  @IsString()
  @MinLength(2)
  @MaxLength(150)
  name: string;

  // slug hoặc id của danh mục
  @IsString()
  category: string;

  @Trim()
  @IsString()
  @MaxLength(1000)
  description: string;

  @IsInt()
  @Min(0)
  @Max(100_000_000)
  basePrice: number;

  @IsInt()
  @Min(5)
  @Max(1440)
  duration: number; // phút

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20)
  @IsString({ each: true })
  features?: string[];

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @IsOptional()
  @IsBoolean()
  isPopular?: boolean;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(5)
  @ValidateNested({ each: true })
  @Type(() => VariantDto)
  variants?: VariantDto[];
}

export class UpdateServiceDto {
  @IsOptional()
  @Trim()
  @IsString()
  @MinLength(2)
  @MaxLength(150)
  name?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @Trim()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100_000_000)
  basePrice?: number;

  @IsOptional()
  @IsInt()
  @Min(5)
  @Max(1440)
  duration?: number;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20)
  @IsString({ each: true })
  features?: string[];

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @IsOptional()
  @IsBoolean()
  isPopular?: boolean;

  // Có truyền thì thay toàn bộ bảng giá theo size
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(5)
  @ValidateNested({ each: true })
  @Type(() => VariantDto)
  variants?: VariantDto[];
}
