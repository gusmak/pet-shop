import { Module } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { AdminBookingsController, BookingsController } from './bookings.controller';

@Module({
  controllers: [BookingsController, AdminBookingsController],
  providers: [BookingsService],
})
export class BookingsModule {}
