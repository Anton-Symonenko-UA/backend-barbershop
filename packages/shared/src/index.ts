import { z } from 'zod';

// Спільні схеми: використовуються і для валідації в API, і для форм на сайті.

export const bookingCreateSchema = z.object({
  barberId: z.string().min(1),
  serviceId: z.string().min(1),
  startsAt: z.iso.datetime(),
  customerName: z.string().trim().min(2).max(80),
  customerPhone: z
    .string()
    .trim()
    .regex(/^\+?[0-9\s()-]{9,20}$/),
  comment: z.string().trim().max(500).optional(),
});
export type BookingCreateInput = z.infer<typeof bookingCreateSchema>;

export const BOOKING_STATUSES = [
  'PENDING',
  'CONFIRMED',
  'CANCELLED',
  'COMPLETED',
  'NO_SHOW',
] as const;
export type BookingStatus = (typeof BOOKING_STATUSES)[number];
