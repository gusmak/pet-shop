import { IsEmail, IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';
import { Lowercase, NormalizePhone, Trim } from '../../common/normalize';

// Đăng nhập chung cho nhân viên (email) và khách (email hoặc SĐT).
export class LoginDto {
  @Trim()
  @IsString()
  @MinLength(3)
  identifier: string;

  @IsString()
  @MinLength(6)
  @MaxLength(100)
  password: string;
}

export class RegisterDto {
  @Lowercase()
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  @MaxLength(100)
  password: string;

  @Trim()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  fullName: string;

  @IsOptional()
  @NormalizePhone()
  @Matches(/^(0|\+84)[0-9]{9}$/, { message: 'Số điện thoại không hợp lệ' })
  phone?: string;
}

export class ChangePasswordDto {
  @IsString()
  currentPassword: string;

  @IsString()
  @MinLength(6)
  @MaxLength(100)
  newPassword: string;
}
