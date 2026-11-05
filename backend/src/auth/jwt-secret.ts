import { ConfigService } from '@nestjs/config';

const DEV_SECRET = 'petshop-jwt-secret-change-me';

// Production bắt buộc đặt JWT_SECRET riêng — không được rơi về secret mặc định đã public trong source.
export function getJwtSecret(config: ConfigService): string {
  const secret = config.get<string>('JWT_SECRET');
  if (secret) return secret;
  if (config.get<string>('NODE_ENV') === 'production') {
    throw new Error('JWT_SECRET là bắt buộc khi NODE_ENV=production');
  }
  return DEV_SECRET;
}

// Thời hạn token (vd 7d, 12h). Đọc từ JWT_EXPIRES_IN, mặc định 7 ngày.
export function jwtExpiresIn(config: ConfigService): string {
  return config.get<string>('JWT_EXPIRES_IN') || '7d';
}
