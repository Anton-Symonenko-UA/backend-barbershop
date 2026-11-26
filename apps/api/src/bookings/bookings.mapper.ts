import type {
  AdminBooking,
  BookingDetails,
  BookingStatus,
} from '@barbershop/shared';

// Скасувати або перенести запис сам клієнт може не пізніше ніж за 2 години
export const CHANGE_CUTOFF_MIN = 120;

export const bookingSelect = {
  id: true,
  status: true,
  startsAt: true,
  endsAt: true,
  priceCents: true,
  comment: true,
  createdAt: true,
  barberId: true,
  serviceId: true,
  barber: { select: { id: true, name: true } },
  service: { select: { id: true, name: true } },
  customer: { select: { id: true, name: true, phone: true } },
} as const;

export type BookingRow = {
  id: string;
  status: BookingStatus;
  startsAt: Date;
  endsAt: Date;
  priceCents: number;
  comment: string | null;
  createdAt: Date;
  barberId: string;
  serviceId: string;
  barber: { id: string; name: string };
  service: { id: string; name: string };
  customer: { id: string; name: string; phone: string };
};

export function canCustomerChange(
  row: Pick<BookingRow, 'status' | 'startsAt'>,
  now = new Date(),
) {
  return (
    (row.status === 'PENDING' || row.status === 'CONFIRMED') &&
    row.startsAt.getTime() - now.getTime() >= CHANGE_CUTOFF_MIN * 60_000
  );
}

export function toBookingDetails(
  row: BookingRow,
  now = new Date(),
): BookingDetails {
  return {
    id: row.id,
    status: row.status,
    startsAt: row.startsAt.toISOString(),
    endsAt: row.endsAt.toISOString(),
    priceCents: row.priceCents,
    barber: row.barber,
    service: row.service,
    customerName: row.customer.name,
    canChange: canCustomerChange(row, now),
  };
}

export function toAdminBooking(row: BookingRow): AdminBooking {
  return {
    id: row.id,
    status: row.status,
    startsAt: row.startsAt.toISOString(),
    endsAt: row.endsAt.toISOString(),
    priceCents: row.priceCents,
    comment: row.comment,
    barber: row.barber,
    service: row.service,
    customer: row.customer,
    createdAt: row.createdAt.toISOString(),
  };
}
