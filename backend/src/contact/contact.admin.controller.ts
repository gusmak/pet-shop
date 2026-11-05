import { Body, Controller, Get, Param, Patch, Query } from '@nestjs/common';
import { IsBoolean } from 'class-validator';
import { Auth } from '../auth/decorators/auth.decorator';
import { ContactService } from './contact.service';

class SetReadDto {
  @IsBoolean()
  isRead: boolean;
}

// Tin nhắn khách gửi từ form liên hệ: nhân viên có quyền xem khách hàng đọc và đánh dấu đã đọc.
@Controller('api/admin/contact')
@Auth('admin.access', 'customers.view')
export class AdminContactController {
  constructor(private readonly contact: ContactService) {}

  @Get()
  list(@Query('unread') unread?: string) {
    return this.contact.list(unread === '1' || unread === 'true');
  }

  @Patch(':id')
  setRead(@Param('id') id: string, @Body() dto: SetReadDto) {
    return this.contact.setRead(id, dto.isRead);
  }
}
