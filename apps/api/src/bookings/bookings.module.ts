import { Module } from '@nestjs/common';
import { SchedulingModule } from '../scheduling/scheduling.module.js';
import {
  AdminBookingsController,
  BookingsController,
} from './bookings.controller.js';
import { BookingsService } from './bookings.service.js';

@Module({
  imports: [SchedulingModule],
  controllers: [BookingsController, AdminBookingsController],
  providers: [BookingsService],
})
export class BookingsModule {}
