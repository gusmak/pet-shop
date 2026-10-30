import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { CreateBookingDto, ListBookingsQuery, LookupBookingDto, UpdateBookingStatusDto } from './dto/booking.dto';
import { Auth } from '../auth/decorators/auth.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { OptionalJwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { AuthUser } from '../auth/strategies/jwt.strategy';

@Controller('api/bookings')
export class BookingsController {
  constructor(private readonly bookings: BookingsService) {}

  // Công khai: khách vãng lai hoặc đã đăng nhập. Đăng nhập thì lịch gắn vào tài khoản.
  @UseGuards(OptionalJwtAuthGuard)
  @Post()
  create(@Body() dto: CreateBookingDto, @CurrentUser() user: AuthUser | null) {
    return this.bookings.create(dto, user);
  }

  // Công khai: tra cứu bằng mã + SĐT.
  @Get('lookup')
  lookup(@Query() q: LookupBookingDto) {
    return this.bookings.lookup(q.number, q.phone);
  }

  @Auth('account.view')
  @Get('me')
  mine(@CurrentUser('sub') userId: string) {
    return this.bookings.listMine(userId);
  }

  @Auth('account.view')
  @Patch(':id/cancel')
  cancel(@CurrentUser('sub') userId: string, @Param('id') id: string) {
    return this.bookings.cancelMine(userId, id);
  }
}

@Controller('api/admin/bookings')
export class AdminBookingsController {
  constructor(private readonly bookings: BookingsService) {}

  @Auth('admin.access', 'bookings.view')
  @Get()
  list(@Query() query: ListBookingsQuery) {
    return this.bookings.adminList(query);
  }

  @Auth('admin.access', 'bookings.manage')
  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body() dto: UpdateBookingStatusDto, @CurrentUser() user: AuthUser) {
    return this.bookings.updateStatus(id, dto, user);
  }
}
