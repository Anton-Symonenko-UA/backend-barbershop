import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { CurrentUser, Public } from '@nestjs/authentication';
import { Can } from '@nestjs/authorization';
import { Throttle } from '@nestjs/throttler';
import {
  adminBookingsQuerySchema,
  bookingCreateSchema,
  bookingRescheduleSchema,
  bookingStatusUpdateSchema,
  manageTokenSchema,
  type AdminBooking,
  type AdminBookingsQuery,
  type BookingCreateInput,
  type BookingCreated,
  type BookingDetails,
  type BookingRescheduleInput,
  type BookingStatusUpdate,
} from '@barbershop/shared';
import { StaffPolicy } from '../auth/staff.policy.js';
import type { StaffUser } from '../auth/user.js';
import { idParam } from '../common/schemas.js';
import { BookingsService } from './bookings.service.js';

@Public()
@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookings: BookingsService) {}

  // Захист від спаму: 5 записів за 10 хвилин з однієї IP
  @Post()
  @Throttle({ default: { limit: 5, ttl: 10 * 60_000 } })
  create(
    @Body({ schema: bookingCreateSchema }) body: BookingCreateInput,
  ): Promise<BookingCreated> {
    return this.bookings.create(body);
  }

  @Get('manage/:token')
  @Throttle({ default: { limit: 30, ttl: 60_000 } })
  find(
    @Param('token', { schema: manageTokenSchema }) token: string,
  ): Promise<BookingDetails> {
    return this.bookings.findByToken(token);
  }

  @Post('manage/:token/cancel')
  @HttpCode(200)
  @Throttle({ default: { limit: 10, ttl: 10 * 60_000 } })
  cancel(
    @Param('token', { schema: manageTokenSchema }) token: string,
  ): Promise<BookingDetails> {
    return this.bookings.cancelByToken(token);
  }

  @Post('manage/:token/reschedule')
  @HttpCode(200)
  @Throttle({ default: { limit: 10, ttl: 10 * 60_000 } })
  reschedule(
    @Param('token', { schema: manageTokenSchema }) token: string,
    @Body({ schema: bookingRescheduleSchema }) body: BookingRescheduleInput,
  ): Promise<BookingDetails> {
    return this.bookings.rescheduleByToken(token, body.startsAt);
  }
}

@Controller('admin/bookings')
export class AdminBookingsController {
  constructor(private readonly bookings: BookingsService) {}

  @Get()
  @Can(StaffPolicy, 'staff')
  list(
    @CurrentUser() user: StaffUser,
    @Query({ schema: adminBookingsQuerySchema }) query: AdminBookingsQuery,
  ): Promise<AdminBooking[]> {
    return this.bookings.listForStaff(user, query);
  }

  @Patch(':id/status')
  @Can(StaffPolicy, 'staff')
  updateStatus(
    @CurrentUser() user: StaffUser,
    @Param('id', { schema: idParam }) id: string,
    @Body({ schema: bookingStatusUpdateSchema }) body: BookingStatusUpdate,
  ): Promise<AdminBooking> {
    return this.bookings.updateStatus(user, id, body.status);
  }
}
