import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { AuthorizationService } from '@nestjs/authorization';
import {
  addDays,
  normalizePhone,
  zonedToUtc,
  type AdminBooking,
  type AdminBookingsQuery,
  type BookingCreateInput,
  type BookingCreated,
  type BookingDetails,
  type BookingStatus,
} from '@barbershop/shared';
import { StaffPolicy } from '../auth/staff.policy.js';
import type { StaffUser } from '../auth/user.js';
import { isBookingOverlap } from '../common/prisma-errors.js';
import { PrismaService } from '../prisma/prisma.service.js';
import {
  ACTIVE_STATUSES,
  AvailabilityService,
  SlotTakenException,
} from '../scheduling/availability.service.js';
import {
  BookingEvent,
  type BookingEventName,
  type BookingEventPayload,
} from './booking.events.js';
import {
  bookingSelect,
  canCustomerChange,
  toAdminBooking,
  toBookingDetails,
  type BookingRow,
} from './bookings.mapper.js';
import { createManageToken, hashManageToken } from './manage-token.js';

// Дозволені переходи статусу з адмінки
const TRANSITIONS: Record<BookingStatus, BookingStatus[]> = {
  PENDING: ['CONFIRMED', 'CANCELLED', 'COMPLETED', 'NO_SHOW'],
  CONFIRMED: ['CANCELLED', 'COMPLETED', 'NO_SHOW', 'PENDING'],
  CANCELLED: [],
  COMPLETED: ['NO_SHOW'],
  NO_SHOW: ['COMPLETED'],
};

@Injectable()
export class BookingsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly availability: AvailabilityService,
    private readonly authorization: AuthorizationService,
    private readonly events: EventEmitter2,
  ) {}

  async create(input: BookingCreateInput): Promise<BookingCreated> {
    // Пастка для ботів спрацювала: відповідаємо як на невалідний запит
    if (input.website) throw new BadRequestException();

    const startsAt = new Date(input.startsAt);
    const offer = await this.availability.assertSlotAvailable(
      input.barberId,
      input.serviceId,
      startsAt,
    );
    const endsAt = new Date(startsAt.getTime() + offer.durationMin * 60_000);
    const phone = normalizePhone(input.customerPhone);
    const { token, hash } = createManageToken();

    try {
      const row = await this.prisma.$transaction(async (tx) => {
        // Повторна перевірка перетину в транзакції. Якщо два запити пройдуть її одночасно,
        // другий insert зупинить exclusion constraint "Booking_no_overlap".
        const clash = await tx.booking.findFirst({
          where: {
            barberId: input.barberId,
            status: { in: [...ACTIVE_STATUSES] },
            startsAt: { lt: endsAt },
            endsAt: { gt: startsAt },
          },
          select: { id: true },
        });
        if (clash) throw new SlotTakenException();

        const customer = await tx.customer.upsert({
          where: { phone },
          update: { name: input.customerName },
          create: { phone, name: input.customerName },
          select: { id: true },
        });
        return tx.booking.create({
          data: {
            barberId: input.barberId,
            serviceId: input.serviceId,
            customerId: customer.id,
            startsAt,
            endsAt,
            priceCents: offer.priceCents,
            comment: input.comment || null,
            manageTokenHash: hash,
          },
          select: bookingSelect,
        });
      });
      this.emit(BookingEvent.Created, {
        bookingId: row.id,
        by: 'customer',
        manageToken: token,
      });
      return { ...toBookingDetails(row), manageToken: token };
    } catch (e) {
      if (isBookingOverlap(e)) throw new SlotTakenException();
      throw e;
    }
  }

  // ---------- Клієнт за посиланням ----------

  async findByToken(token: string): Promise<BookingDetails> {
    return toBookingDetails(await this.rowByToken(token));
  }

  async cancelByToken(token: string): Promise<BookingDetails> {
    const row = await this.rowByToken(token);
    this.assertCustomerCanChange(row);
    // Умовне оновлення: якщо статус змінився паралельно, нічого не скасуємо двічі
    const { count } = await this.prisma.booking.updateMany({
      where: { id: row.id, status: { in: [...ACTIVE_STATUSES] } },
      data: { status: 'CANCELLED' },
    });
    if (count === 0) throw new ConflictException('Запис уже не активний');
    this.emit(BookingEvent.Cancelled, { bookingId: row.id, by: 'customer' });
    return this.findByToken(token);
  }

  async rescheduleByToken(
    token: string,
    startsAtIso: string,
  ): Promise<BookingDetails> {
    const row = await this.rowByToken(token);
    this.assertCustomerCanChange(row);
    const startsAt = new Date(startsAtIso);
    const offer = await this.availability.assertSlotAvailable(
      row.barberId,
      row.serviceId,
      startsAt,
      row.id,
    );
    try {
      const { count } = await this.prisma.booking.updateMany({
        where: { id: row.id, status: { in: [...ACTIVE_STATUSES] } },
        data: {
          startsAt,
          endsAt: new Date(startsAt.getTime() + offer.durationMin * 60_000),
          reminderSentAt: null,
        },
      });
      if (count === 0) throw new ConflictException('Запис уже не активний');
    } catch (e) {
      if (isBookingOverlap(e)) throw new SlotTakenException();
      throw e;
    }
    this.emit(BookingEvent.Rescheduled, { bookingId: row.id, by: 'customer' });
    return this.findByToken(token);
  }

  // ---------- Адмінка ----------

  async listForStaff(
    user: StaffUser,
    query: AdminBookingsQuery,
  ): Promise<AdminBooking[]> {
    if (query.to < query.from)
      throw new BadRequestException('Дата «до» раніша за «від»');
    if (query.to > addDays(query.from, 62))
      throw new BadRequestException('Не більше 2 місяців за раз');
    // Майстер бачить лише свої записи, хоч би що прийшло в barberId
    const barberId =
      user.role === 'ADMIN' ? query.barberId : (user.barberId ?? '__none__');
    const rows = await this.prisma.booking.findMany({
      where: {
        startsAt: {
          gte: zonedToUtc(query.from, 0),
          lt: zonedToUtc(addDays(query.to, 1), 0),
        },
        ...(barberId && { barberId }),
        ...(query.status && { status: query.status }),
      },
      orderBy: { startsAt: 'asc' },
      select: bookingSelect,
    });
    return rows.map(toAdminBooking);
  }

  async updateStatus(
    user: StaffUser,
    id: string,
    status: BookingStatus,
  ): Promise<AdminBooking> {
    const row = await this.prisma.booking.findUnique({
      where: { id },
      select: bookingSelect,
    });
    if (!row) throw new NotFoundException('Запис не знайдено');
    await this.authorization.authorize(StaffPolicy, 'manageBooking', user, row);
    if (row.status === status) return toAdminBooking(row);
    if (!TRANSITIONS[row.status].includes(status)) {
      throw new ConflictException(
        `Не можна змінити статус ${row.status} на ${status}`,
      );
    }
    // Повернення в активний статус може зіткнутися з іншим записом
    try {
      const { count } = await this.prisma.booking.updateMany({
        where: { id, status: row.status },
        data: { status },
      });
      if (count === 0)
        throw new ConflictException(
          'Запис змінили паралельно, оновіть сторінку',
        );
    } catch (e) {
      if (isBookingOverlap(e)) throw new SlotTakenException();
      throw e;
    }
    if (status === 'CANCELLED')
      this.emit(BookingEvent.Cancelled, { bookingId: id, by: 'staff' });
    const updated = await this.prisma.booking.findUniqueOrThrow({
      where: { id },
      select: bookingSelect,
    });
    return toAdminBooking(updated);
  }

  private async rowByToken(token: string): Promise<BookingRow> {
    const row = await this.prisma.booking.findUnique({
      where: { manageTokenHash: hashManageToken(token) },
      select: bookingSelect,
    });
    if (!row) throw new NotFoundException('Запис не знайдено');
    return row;
  }

  private assertCustomerCanChange(row: BookingRow) {
    if (!canCustomerChange(row)) {
      throw new ConflictException(
        'Цей запис уже не можна змінити онлайн. Зателефонуйте нам, і ми допоможемо.',
      );
    }
  }

  private emit(
    event: BookingEventName,
    payload: Omit<BookingEventPayload, 'event'>,
  ) {
    this.events.emit(event, {
      ...payload,
      event,
    } satisfies BookingEventPayload);
  }
}
