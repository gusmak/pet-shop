import { BadRequestException, ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { normalizePhone } from '../common/normalize';
import { ChangePasswordDto, LoginDto, RegisterDto } from './dto/auth.dto';
import type { AuthUser, JwtPayload } from './strategies/jwt.strategy';

const groupInclude = { include: { permissions: { include: { permission: true } } } } as const;

// Hash giả để so sánh khi không tìm thấy tài khoản — tránh lộ "email có tồn tại hay không" qua thời gian phản hồi.
const DUMMY_HASH = bcrypt.hashSync('petshop-dummy-password', 10);

const BAD_CREDENTIALS = 'Tên tài khoản hoặc mật khẩu không đúng';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  private token(payload: JwtPayload) {
    return { accessToken: this.jwt.sign(payload), tokenType: 'Bearer', expiresIn: '7d' };
  }

  // Nhân viên đăng nhập bằng email; khách bằng email hoặc SĐT.
  async login(dto: LoginDto) {
    const id = dto.identifier.includes('@') ? dto.identifier.toLowerCase() : normalizePhone(dto.identifier);

    const staff = id.includes('@')
      ? await this.prisma.staff.findUnique({ where: { email: id }, include: { group: groupInclude, store: true } })
      : null;

    if (staff) {
      const ok = await bcrypt.compare(dto.password, staff.passwordHash);
      if (!ok || !staff.isActive) throw new UnauthorizedException(BAD_CREDENTIALS);
      await this.prisma.staff.update({ where: { id: staff.id }, data: { lastLoginAt: new Date() } });
      return { ...this.token({ sub: staff.id, email: staff.email, type: 'admin' }), user: this.staffUser(staff) };
    }

    const user = await this.prisma.user.findFirst({
      where: { OR: [{ email: id }, { phone: id }] },
      include: { group: groupInclude },
    });
    const ok = await bcrypt.compare(dto.password, user?.passwordHash ?? DUMMY_HASH);
    if (!user || !ok || !user.isActive) throw new UnauthorizedException(BAD_CREDENTIALS);

    await this.prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
    return { ...this.token({ sub: user.id, email: user.email, type: 'customer' }), user: this.customerUser(user) };
  }

  // Đăng ký trên website luôn vào nhóm Customer.
  async register(dto: RegisterDto) {
    const dup = await this.prisma.user.findFirst({
      where: { OR: [{ email: dto.email }, ...(dto.phone ? [{ phone: dto.phone }] : [])] },
    });
    if (dup) {
      throw new ConflictException(dup.email === dto.email ? 'Email đã được sử dụng' : 'Số điện thoại đã được sử dụng');
    }
    if (await this.prisma.staff.findUnique({ where: { email: dto.email } })) {
      throw new ConflictException('Email đã được sử dụng');
    }

    const group = await this.prisma.group.findUniqueOrThrow({ where: { key: 'customer' } });
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        phone: dto.phone,
        fullName: dto.fullName,
        passwordHash: await bcrypt.hash(dto.password, 10),
        groupId: group.id,
      },
      include: { group: groupInclude },
    });
    return { ...this.token({ sub: user.id, email: user.email, type: 'customer' }), user: this.customerUser(user) };
  }

  async getProfile(auth: AuthUser) {
    if (auth.type === 'admin') {
      const staff = await this.prisma.staff.findUnique({
        where: { id: auth.sub },
        include: { group: groupInclude, store: true },
      });
      if (!staff) throw new UnauthorizedException('Không tìm thấy tài khoản');
      return this.staffUser(staff);
    }
    const user = await this.prisma.user.findUnique({ where: { id: auth.sub }, include: { group: groupInclude } });
    if (!user) throw new UnauthorizedException('Không tìm thấy tài khoản');
    return this.customerUser(user);
  }

  async changePassword(auth: AuthUser, dto: ChangePasswordDto) {
    const model = auth.type === 'admin' ? this.prisma.staff : this.prisma.user;
    const account = await (model as typeof this.prisma.staff).findUnique({ where: { id: auth.sub } });
    if (!account || !(await bcrypt.compare(dto.currentPassword, account.passwordHash))) {
      throw new BadRequestException('Mật khẩu hiện tại không đúng');
    }
    await (model as typeof this.prisma.staff).update({
      where: { id: auth.sub },
      data: { passwordHash: await bcrypt.hash(dto.newPassword, 10) },
    });
    return { success: true };
  }

  // ── Hình dạng user trả về cho FE (khớp web/lib/demo.ts: DemoUser) ──────────
  private permissionKeys(group: { permissions: { permission: { key: string } }[] }) {
    return group.permissions.map((gp) => gp.permission.key);
  }

  private staffUser(staff: {
    id: string;
    email: string;
    fullName: string;
    phone: string;
    position: string;
    storeId: string;
    isSuperAdmin: boolean;
    store: { name: string };
    group: { key: string; permissions: { permission: { key: string } }[] };
  }) {
    return {
      id: staff.id,
      email: staff.email,
      name: staff.fullName,
      phone: staff.phone,
      role: staff.group.key,
      permissions: this.permissionKeys(staff.group),
      position: staff.position,
      storeId: staff.storeId,
      storeName: staff.store.name,
      isSuper: staff.isSuperAdmin,
    };
  }

  private customerUser(user: {
    id: string;
    email: string;
    fullName: string;
    phone: string | null;
    loyaltyPoints: number;
    group: { key: string; permissions: { permission: { key: string } }[] };
  }) {
    return {
      id: user.id,
      email: user.email,
      name: user.fullName,
      phone: user.phone,
      role: user.group.key,
      permissions: this.permissionKeys(user.group),
      loyaltyPoints: user.loyaltyPoints,
    };
  }
}
