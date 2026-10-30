import { IsEmail, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { Lowercase, NormalizePhone, Trim } from '../../common/normalize';

export class CreateContactDto {
  @Trim()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @Lowercase()
  @IsEmail()
  email: string;

  @IsOptional()
  @NormalizePhone()
  @IsString()
  @MaxLength(20)
  phone?: string;

  @Trim()
  @IsString()
  @MaxLength(100)
  subject: string;

  @Trim()
  @IsString()
  @MinLength(5)
  @MaxLength(2000)
  message: string;
}
