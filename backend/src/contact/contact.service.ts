import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateContactDto } from './dto/create-contact.dto';

@Injectable()
export class ContactService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateContactDto) {
    await this.prisma.contactMessage.create({
      data: { name: dto.name, email: dto.email, phone: dto.phone, subject: dto.subject, message: dto.message },
    });
    return { success: true, message: 'Cảm ơn bạn! Chúng tôi sẽ phản hồi trong 24 giờ.' };
  }
}
