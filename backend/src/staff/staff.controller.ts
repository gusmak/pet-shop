import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { CreateStaffDto, StaffService, UpdateStaffDto } from './staff.service';
import { Auth } from '../auth/decorators/auth.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthUser } from '../auth/strategies/jwt.strategy';

@Controller('api/admin/staff')
@Auth('admin.access', 'staff.manage')
export class StaffController {
  constructor(private readonly staff: StaffService) {}

  @Get()
  list() {
    return this.staff.list();
  }

  @Post()
  create(@Body() dto: CreateStaffDto) {
    return this.staff.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateStaffDto, @CurrentUser() user: AuthUser) {
    return this.staff.update(id, dto, user);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.staff.remove(id, user);
  }
}
