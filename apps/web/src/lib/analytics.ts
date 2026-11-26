// Події воронки запису. Шлемо в dataLayer (GTM) і gtag (GA4), якщо вони підключені.
// Без аналітики виклики нічого не роблять. Персональні дані (ім’я, телефон) не передаємо.

export type AnalyticsEvent =
  | { name: 'booking_start'; params: { source: string } }
  | { name: 'booking_step'; params: { step: 'service' | 'barber' | 'date' | 'slot' | 'contacts' } }
  | {
      name: 'booking_submitted';
      params: { service: string; barber: string; value: number; currency: 'UAH' };
    }
  | { name: 'booking_failed'; params: { reason: string } }
  | { name: 'booking_cancelled'; params: Record<string, never> }
  | { name: 'booking_rescheduled'; params: Record<string, never> }
  | { name: 'phone_click'; params: { location: string } }
  | { name: 'review_submitted'; params: { rating: number } };

type Gtag = (command: 'event', name: string, params: Record<string, unknown>) => void;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: Gtag;
  }
}

export function track(event: AnalyticsEvent) {
  if (typeof window === 'undefined') return;
  window.dataLayer?.push({ event: event.name, ...event.params });
  window.gtag?.('event', event.name, event.params);
}
