import { Body, Controller, Get, Patch } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { UpdateSettingsDto } from './dto/update-settings.dto';
import { Auth } from '../auth/decorators/auth.decorator';

// Công khai: trang đặt lịch cần biết giờ mở/đóng cửa để sinh khung giờ hẹn.
@Controller('api/settings')
export class SettingsController {
  constructor(private readonly settings: SettingsService) {}

  @Get()
  get() {
    return this.settings.get();
  }
}

// Quản trị: đọc/ghi cấu hình hệ thống từ trang "Hệ thống".
@Controller('api/admin/settings')
@Auth('admin.access', 'settings.manage')
export class AdminSettingsController {
  constructor(private readonly settings: SettingsService) {}

  @Get()
  get() {
    return this.settings.get();
  }

  @Patch()
  update(@Body() dto: UpdateSettingsDto) {
    return this.settings.update(dto);
  }
}