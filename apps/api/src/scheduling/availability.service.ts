import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  BOOKING_HORIZON_DAYS,
  MIN_LEAD_MIN,
  addDays,
  utcToZoned,
  weekdayOf,
  zonedToUtc,
  type Availability,
} from '@barbershop/shared';
import { PrismaService } from '../prisma/prisma.service.js';
import { computeSlots, type Interval } from './slots.js';

// Записи, що займають час майстра
export const ACTIVE_STATUSES = ['PENDING', 'CONFIRMED'] as const;

interface Options {
  serviceId: string;
  date: string;
  barberId?: string;
  /** Запис, який переносять: його власний час не вважається зайнятим */
  excludeBookingId?: string;
  now?: Date;
}

export interface BarberOffer {
  barberId: string;
  durationMin: number;
  priceCents: number;
}

@Injectable()
export class AvailabilityService {
  constructor(private readonly prisma: PrismaService) {}

  async getAvailability(options: Options): Promise<Availability> {
    const now = options.now ?? new Date();
    const { date } = options;
    const today = utcToZoned(now).date;
    if (date < today || date > addDays(today, BOOKING_HORIZON_DAYS)) {
      throw new BadRequestException(
        `Запис можливий на ${BOOKING_HORIZON_DAYS} днів уперед`,
      );
    }

    const service = await this.prisma.service.findFirst({
      where: { id: options.serviceId, isActive: true },
      select: { id: true, durationMin: true, priceCents: true },
    });
    if (!service) throw new NotFoundException('Послугу не знайдено');

    const dayStart = zonedToUtc(date, 0);
    const dayEnd = zonedToUtc(addDays(date, 1), 0);
    const weekday = weekdayOf(date);

    const barbers = await this.prisma.barber.findMany({
      where: {
        isActive: true,
        ...(options.barberId && { id: options.barberId }),
        services: { some: { serviceId: service.id } },
      },
      orderBy: { sortOrder: 'asc' },
      select: {
        id: true,
        services: {
          where: { serviceId: service.id },
          select: { durationMin: true, priceCents: true },
        },
        workingHours: {
          where: { weekday },
          select: { startMin: true, endMin: true },
        },
        timeOff: {
          where: { startsAt: { lt: dayEnd }, endsAt: { gt: dayStart } },
          select: { startsAt: true, endsAt: true },
        },
        bookings: {
          where: {
            status: { in: [...ACTIVE_STATUSES] },
            startsAt: { lt: dayEnd },
            endsAt: { gt: dayStart },
            ...(options.excludeBookingId && {
              id: { not: options.excludeBookingId },
            }),
          },
          select: { startsAt: true, endsAt: true },
        },
      },
    });
    if (options.barberId && barbers.length === 0) {
      throw new NotFoundException('Цей майстер не виконує обрану послугу');
    }

    const earliest = new Date(now.getTime() + MIN_LEAD_MIN * 60_000);
    const byStart = new Map<string, string[]>();
    for (const barber of barbers) {
      const busy: Interval[] = [...barber.timeOff, ...barber.bookings].map(
        (b) => ({
          start: b.startsAt,
          end: b.endsAt,
        }),
      );
      const slots = computeSlots({
        date,
        durationMin: barber.services[0]?.durationMin ?? service.durationMin,
        hours: barber.workingHours[0] ?? null,
        busy,
        earliest,
      });
      for (const s of slots) {
        const key = s.toISOString();
        byStart.set(key, [...(byStart.get(key) ?? []), barber.id]);
      }
    }

    return {
      date,
      durationMin: service.durationMin,
      slots: [...byStart.entries()]
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([startsAt, barberIds]) => ({ startsAt, barberIds })),
    };
  }

  /**
   * Перевіряє, що майстер вільний у цей час, і повертає тривалість і ціну.
   * Остаточний захист від подвійного запису: exclusion constraint у базі.
   */
  async assertSlotAvailable(
    barberId: string,
    serviceId: string,
    startsAt: Date,
    excludeBookingId?: string,
  ): Promise<BarberOffer> {
    const { date } = utcToZoned(startsAt);
    const availability = await this.getAvailability({
      serviceId,
      date,
      barberId,
      excludeBookingId,
    });
    const iso = startsAt.toISOString();
    if (!availability.slots.some((s) => s.startsAt === iso)) {
      throw new SlotTakenException();
    }
    return this.offer(barberId, serviceId);
  }

  async offer(barberId: string, serviceId: string): Promise<BarberOffer> {
    // findFirst, а не findUnique: Prisma 7 батчить паралельні findUnique за складеним ключем
    // в один запит і на адаптері pg плутає параметри (08P01 під одночасними записами)
    const link = await this.prisma.barberService.findFirst({
      where: {
        barberId,
        serviceId,
        barber: { isActive: true },
        service: { isActive: true },
      },
      select: {
        durationMin: true,
        priceCents: true,
        service: { select: { durationMin: true, priceCents: true } },
      },
    });
    if (!link)
      throw new NotFoundException('Цей майстер не виконує обрану послугу');
    return {
      barberId,
      durationMin: link.durationMin ?? link.service.durationMin,
      priceCents: link.priceCents ?? link.service.priceCents,
    };
  }
}

export class SlotTakenException extends ConflictException {
  constructor() {
    super('Цей час уже зайнятий. Оберіть інший слот.');
  }
}
