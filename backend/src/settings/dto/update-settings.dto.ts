import { IsEmail, IsInt, IsOptional, IsString, Matches, Max, MaxLength, Min } from 'class-validator';

const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

export class UpdateSettingsDto {
  @IsOptional()
  @IsString()
  @MaxLength(200)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  address?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  phone?: string;

  @IsOptional()
  @IsEmail()
  email?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  zaloLink?: string | null;

  @IsOptional()
  @Matches(TIME_RE, { message: 'Giờ phải đúng định dạng HH:mm' })
  openTime?: string;

  @IsOptional()
  @Matches(TIME_RE, { message: 'Giờ phải đúng định dạng HH:mm' })
  closeTime?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  slotCapacity?: number;
}