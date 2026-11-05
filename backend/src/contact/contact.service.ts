import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { CreateContactDto } from './dto/create-contact.dto';

@Injectable()
export class ContactService {
  constructor(
    private prisma: PrismaService,
    private mail: MailService,
  ) {}

  async create(dto: CreateContactDto) {
    await this.prisma.contactMessage.create({
      data: { name: dto.name, email: dto.email, phone: dto.phone, subject: dto.subject, message: dto.message },
    });
    // Báo cho cửa hàng qua email (nếu có cấu hình SMTP + email cửa hàng). Không chặn phản hồi cho khách.
    void this.notifyStore(dto).catch((e) => console.error('Gửi email thông báo liên hệ thất bại:', e instanceof Error ? e.message : e));
    return { success: true, message: 'Cảm ơn bạn! Chúng tôi sẽ phản hồi trong 24 giờ.' };
  }

  private async notifyStore(dto: CreateContactDto) {
    const store = await this.prisma.store.findFirst({ where: { isActive: true }, orderBy: { createdAt: 'asc' } });
    if (!store?.email) return;
    await this.mail.sendContactNotice(store.email, dto);
  }

  // ── Quản trị ────────────────────────────────────────────────
  list(unreadOnly: boolean) {
    return this.prisma.contactMessage.findMany({
      where: unreadOnly ? { isRead: false } : undefined,
      orderBy: { createdAt: 'desc' },
      take: 200,
    });
  }

  async setRead(id: string, isRead: boolean) {
    const found = await this.prisma.contactMessage.findUnique({ where: { id } });
    if (!found) throw new NotFoundException('Không tìm thấy tin nhắn');
    return this.prisma.contactMessage.update({ where: { id }, data: { isRead } });
  }
}
