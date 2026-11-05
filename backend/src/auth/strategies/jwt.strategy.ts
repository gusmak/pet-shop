import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { getJwtSecret } from '../jwt-secret';

export interface JwtPayload {
  sub: string;
  email: string;
  type: 'admin' | 'customer';
  // passwordChangedAt (ms) của tài khoản lúc cấp token; 0 nếu chưa từng đổi. Lệch => mật khẩu đã đổi sau đó.
  pwv?: number;
}

// Gắn vào request.user. Quyền luôn đọc từ DB mỗi request nên đổi nhóm/quyền có hiệu lực ngay.
export interface AuthUser {
  sub: string;
  email: string;
  type: 'admin' | 'customer';
  role: string; // key của nhóm: admin | monitor | customer
  permissions: string[];
  isSuperAdmin: boolean;
}

const groupInclude = { include: { permissions: { include: { permission: true } } } } as const;

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    config: ConfigService,
    private prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: getJwtSecret(config),
    });
  }

  async validate(payload: JwtPayload): Promise<AuthUser> {
    const account =
      payload.type === 'admin'
        ? await this.prisma.staff.findUnique({ where: { id: payload.sub }, include: { group: groupInclude } })
        : await this.prisma.user.findUnique({ where: { id: payload.sub }, include: { group: groupInclude } });

    if (!account || !account.isActive) {
      throw new UnauthorizedException('Tài khoản không tồn tại hoặc đã bị khóa');
    }
    // Đổi/đặt lại mật khẩu => mọi token cấp trước đó mất hiệu lực, buộc đăng nhập lại.
    if ((payload.pwv ?? 0) !== (account.passwordChangedAt?.getTime() ?? 0)) {
      throw new UnauthorizedException('Phiên đăng nhập đã hết hiệu lực, vui lòng đăng nhập lại');
    }

    return {
      sub: account.id,
      email: account.email,
      type: payload.type,
      role: account.group.key,
      permissions: account.group.permissions.map((gp) => gp.permission.key),
      isSuperAdmin: payload.type === 'admin' && 'isSuperAdmin' in account && account.isSuperAdmin,
    };
  }
}
