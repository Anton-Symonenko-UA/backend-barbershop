import { SHOP_TIME_ZONE } from '@barbershop/shared';

const dateTime = new Intl.DateTimeFormat('uk-UA', {
  timeZone: SHOP_TIME_ZONE,
  weekday: 'short',
  day: 'numeric',
  month: 'long',
  hour: '2-digit',
  minute: '2-digit',
});

/** "пт, 16 січня о 10:00" за київським часом */
export const formatDateTime = (d: Date) => dateTime.format(d);

const uah = new Intl.NumberFormat('uk-UA', { maximumFractionDigits: 0 });
export const formatPrice = (cents: number) => `${uah.format(cents / 100)} ₴`;
