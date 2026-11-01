import { Injectable, NotFoundException } from '@nestjs/common';
import type { Store } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateSettingsDto } from './dto/update-settings.dto';

@Injectable()
export class SettingsService {
  constructor(private prisma: PrismaService) {}

  // Trả về cửa hàng đang hoạt động (hệ thống hiện chỉ có một).
  private async active(): Promise<Store> {
    const store = await this.prisma.store.findFirst({
      where: { isActive: true },
      orderBy: { createdAt: 'asc' },
    });
    if (!store) throw new NotFoundException('Cửa hàng chưa được cấu hình');
    return store;
  }

  async get() {
    return this.toDto(await this.active());
  }

  async update(dto: UpdateSettingsDto) {
    const store = await this.active();
    const updated = await this.prisma.store.update({ where: { id: store.id }, data: dto });
    return this.toDto(updated);
  }

  private toDto(s: Store) {
    return {
      name: s.name,
      address: s.address,
      phone: s.phone,
      email: s.email,
      zaloLink: s.zaloLink,
      openTime: s.openTime,
      closeTime: s.closeTime,
      slotCapacity: s.slotCapacity,
    };
  }
}