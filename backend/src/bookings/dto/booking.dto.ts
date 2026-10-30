import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsEmail,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { BookingStatus, PetSize, PetSpecies } from '@prisma/client';
import { Lowercase, NormalizePhone, Trim, Uppercase } from '../../common/normalize';

export class CreateBookingDto {
  @Trim()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  customerName: string;

  @NormalizePhone()
  @Matches(/^(0|\+84)[0-9]{9}$/, { message: 'Số điện thoại không hợp lệ' })
  customerPhone: string;

  @IsOptional()
  @Lowercase()
  @IsEmail()
  customerEmail?: string;

  @Trim()
  @IsString()
  @MinLength(1)
  @MaxLength(60)
  petName: string;

  @Uppercase()
  @IsEnum(PetSpecies)
  petSpecies: PetSpecies;

  @Uppercase()
  @IsEnum(PetSize)
  petSize: PetSize;

  // Danh sách id hoặc slug dịch vụ (chọn nhiều, mỗi nhóm dịch vụ tối đa một)
  @IsArray()
  @ArrayMinSize(1, { message: 'Vui lòng chọn ít nhất một dịch vụ' })
  @ArrayMaxSize(5)
  @IsString({ each: true })
  services: string[];

  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'date phải có dạng YYYY-MM-DD' })
  date: string;

  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/, { message: 'time phải có dạng HH:mm' })
  time: string;

  @IsOptional()
  @Trim()
  @IsString()
  @MaxLength(500)
  notes?: string;
}

export class LookupBookingDto {
  @IsString()
  number: string;

  @NormalizePhone()
  @IsString()
  phone: string;
}

export class ListBookingsQuery {
  @IsOptional()
  @Trim()
  @IsString()
  q?: string;

  @IsOptional()
  @Uppercase()
  @IsEnum(BookingStatus)
  status?: BookingStatus;

  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  date?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(200)
  pageSize?: number;
}

export class UpdateBookingStatusDto {
  @Uppercase()
  @IsEnum(BookingStatus)
  status: BookingStatus;

  @IsOptional()
  @Trim()
  @IsString()
  @MaxLength(300)
  reason?: string;
}
