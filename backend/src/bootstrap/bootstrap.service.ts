import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ensureDefaultAccounts } from './default-accounts';

// Mỗi lần backend khởi động: tạo tài khoản mặc định còn thiếu từ biến môi trường (.env).
@Injectable()
export class BootstrapService implements OnApplicationBootstrap {
  private readonly logger = new Logger(BootstrapService.name);

  constructor(private prisma: PrismaService) {}

  async onApplicationBootstrap() {
    await ensureDefaultAccounts(this.prisma, process.env, (m) => this.logger.log(m));
  }
}
