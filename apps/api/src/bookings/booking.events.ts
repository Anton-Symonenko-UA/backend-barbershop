// Події запису: на них підписані сповіщення (Telegram адміну, SMS клієнту).
export const BookingEvent = {
  Created: 'booking.created',
  Cancelled: 'booking.cancelled',
  Rescheduled: 'booking.rescheduled',
} as const;

export type BookingEventName = (typeof BookingEvent)[keyof typeof BookingEvent];

export interface BookingEventPayload {
  event: BookingEventName;
  bookingId: string;
  /** Хто зробив зміну */
  by: 'customer' | 'staff';
  /** Лише для Created: секрет для посилання в SMS. Живе тільки в пам'яті процесу. */
  manageToken?: string;
}
