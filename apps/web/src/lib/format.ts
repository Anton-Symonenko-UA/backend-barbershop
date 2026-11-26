import { SHOP_TIME_ZONE } from '@barbershop/shared';

// Формати дат і цін. Час завжди показуємо за Києвом, незалежно від пояса браузера.

const uah = new Intl.NumberFormat('uk-UA', { maximumFractionDigits: 0 });
export const formatPrice = (cents: number) => `${uah.format(cents / 100)} ₴`;

const timeFmt = new Intl.DateTimeFormat('uk-UA', {
  timeZone: SHOP_TIME_ZONE,
  hour: '2-digit',
  minute: '2-digit',
});
const dateFmt = new Intl.DateTimeFormat('uk-UA', {
  timeZone: SHOP_TIME_ZONE,
  weekday: 'long',
  day: 'numeric',
  month: 'long',
});
const shortDateFmt = new Intl.DateTimeFormat('uk-UA', {
  timeZone: SHOP_TIME_ZONE,
  weekday: 'short',
  day: 'numeric',
  month: 'short',
});

export const formatTime = (iso: string | Date) => timeFmt.format(new Date(iso));
export const formatDate = (iso: string | Date) => dateFmt.format(new Date(iso));
export const formatShortDate = (iso: string | Date) => shortDateFmt.format(new Date(iso));
export const formatDateTime = (iso: string | Date) => `${formatDate(iso)}, ${formatTime(iso)}`;

/** Місцева дата YYYY-MM-DD як полудень за Києвом, щоб форматувати без зсуву дня. */
export const localDateToInstant = (date: string) => new Date(`${date}T12:00:00Z`);

export function pluralYears(n: number) {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return `${n} рік`;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return `${n} роки`;
  return `${n} років`;
}
