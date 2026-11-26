import { z } from 'zod';

// Спільні схеми: використовуються і для валідації в API, і для форм на сайті.
// Повідомлення про помилки українською, бо їх бачать клієнти у формах.

const id = z.string().trim().min(1).max(64);
const localDate = z.iso.date({ error: 'Оберіть дату' });
const slug = z
  .string()
  .trim()
  .min(2)
  .max(60)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Лише латиниця, цифри й дефіси');

export const phoneSchema = z
  .string()
  .trim()
  .regex(/^\+?[0-9\s()-]{9,20}$/, 'Вкажіть номер у форматі +380 XX XXX XX XX');

export const BOOKING_STATUSES = [
  'PENDING',
  'CONFIRMED',
  'CANCELLED',
  'COMPLETED',
  'NO_SHOW',
] as const;
export type BookingStatus = (typeof BOOKING_STATUSES)[number];

export const ROLES = ['ADMIN', 'BARBER'] as const;
export type Role = (typeof ROLES)[number];

// ---------- Публічний запис ----------

export const bookingCreateSchema = z.object({
  barberId: id,
  serviceId: id,
  startsAt: z.iso.datetime({ offset: true, error: 'Оберіть час' }),
  customerName: z.string().trim().min(2, 'Вкажіть ім’я').max(80, 'Задовге ім’я'),
  customerPhone: phoneSchema,
  comment: z.string().trim().max(500, 'Не більше 500 символів').optional(),
  // Пастка для ботів: людина це поле не бачить і не заповнює
  website: z.string().max(0).optional(),
});
export type BookingCreateInput = z.infer<typeof bookingCreateSchema>;

export const availabilityQuerySchema = z.object({
  serviceId: id,
  date: localDate,
  barberId: id.optional(),
});
export type AvailabilityQuery = z.infer<typeof availabilityQuerySchema>;

export const manageTokenSchema = z.string().regex(/^[A-Za-z0-9_-]{32,64}$/);

export const bookingRescheduleSchema = z.object({
  startsAt: z.iso.datetime({ offset: true }),
});
export type BookingRescheduleInput = z.infer<typeof bookingRescheduleSchema>;

export const reviewCreateSchema = z.object({
  authorName: z.string().trim().min(2, 'Вкажіть ім’я').max(60),
  rating: z.coerce.number().int().min(1).max(5),
  text: z.string().trim().min(10, 'Напишіть хоча б кілька слів').max(1000),
  barberId: id.optional(),
  website: z.string().max(0).optional(),
});
export type ReviewCreateInput = z.infer<typeof reviewCreateSchema>;

// ---------- Адмінка ----------

export const loginSchema = z.object({
  email: z.email('Невірний email').trim().toLowerCase(),
  password: z.string().min(1, 'Вкажіть пароль').max(200),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const adminBookingsQuerySchema = z.object({
  from: localDate,
  to: localDate,
  barberId: id.optional(),
  status: z.enum(BOOKING_STATUSES).optional(),
});
export type AdminBookingsQuery = z.infer<typeof adminBookingsQuerySchema>;

export const bookingStatusUpdateSchema = z.object({
  status: z.enum(BOOKING_STATUSES),
});
export type BookingStatusUpdate = z.infer<typeof bookingStatusUpdateSchema>;

export const serviceUpsertSchema = z.object({
  slug,
  name: z.string().trim().min(2).max(80),
  description: z.string().trim().max(300).nullable().optional(),
  durationMin: z.coerce.number().int().min(5).max(480).multipleOf(5),
  priceCents: z.coerce.number().int().min(0).max(10_000_000),
  categoryId: id.nullable().optional(),
  isActive: z.boolean().default(true),
  sortOrder: z.coerce.number().int().min(0).max(1000).default(0),
});
export type ServiceUpsertInput = z.infer<typeof serviceUpsertSchema>;
export const serviceUpdateSchema = serviceUpsertSchema.partial();

export const barberUpsertSchema = z.object({
  slug,
  name: z.string().trim().min(2).max(80),
  title: z.string().trim().max(60).nullable().optional(),
  bio: z.string().trim().max(1000).nullable().optional(),
  specialty: z.string().trim().max(120).nullable().optional(),
  experienceSince: z.coerce.number().int().min(1970).max(2100).nullable().optional(),
  photoUrl: z.url().nullable().optional(),
  instagram: z.url().nullable().optional(),
  isActive: z.boolean().default(true),
  sortOrder: z.coerce.number().int().min(0).max(1000).default(0),
  serviceIds: z.array(id).max(100).optional(),
});
export type BarberUpsertInput = z.infer<typeof barberUpsertSchema>;
export const barberUpdateSchema = barberUpsertSchema.partial();

const minuteOfDay = z.number().int().min(0).max(1440);

export const workingHoursSchema = z
  .array(
    z
      .object({
        weekday: z.number().int().min(0).max(6),
        startMin: minuteOfDay,
        endMin: minuteOfDay,
      })
      .refine((h) => h.startMin < h.endMin, 'Кінець має бути пізніше за початок'),
  )
  .max(7)
  .refine(
    (days) => new Set(days.map((d) => d.weekday)).size === days.length,
    'Кожен день тижня лише один раз',
  );
export type WorkingHoursInput = z.infer<typeof workingHoursSchema>;

export const timeOffCreateSchema = z
  .object({
    startsAt: z.iso.datetime({ offset: true }),
    endsAt: z.iso.datetime({ offset: true }),
    reason: z.string().trim().max(200).optional(),
  })
  .refine((t) => new Date(t.endsAt) > new Date(t.startsAt), {
    message: 'Кінець має бути пізніше за початок',
    path: ['endsAt'],
  });
export type TimeOffCreateInput = z.infer<typeof timeOffCreateSchema>;

export const reviewModerationSchema = z.object({
  isPublished: z.boolean(),
});
