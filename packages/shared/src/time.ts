// Часовий пояс барбершопу. Робочі години зберігаються у хвилинах від півночі за цим поясом,
// а записи в базі в UTC. Перехід на літній/зимовий час рахує Intl, без сторонніх бібліотек.
export const SHOP_TIME_ZONE = 'Europe/Kyiv';

// Крок сітки слотів і мінімальний час до запису
export const SLOT_STEP_MIN = 15;
export const MIN_LEAD_MIN = 60;
// На скільки днів уперед можна записатися
export const BOOKING_HORIZON_DAYS = 30;

const formatters = new Map<string, Intl.DateTimeFormat>();

function formatter(timeZone: string) {
  let f = formatters.get(timeZone);
  if (!f) {
    f = new Intl.DateTimeFormat('en-US', {
      timeZone,
      hourCycle: 'h23',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      weekday: 'short',
    });
    formatters.set(timeZone, f);
  }
  return f;
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function parts(instant: Date, timeZone: string) {
  const p: Record<string, string> = {};
  for (const { type, value } of formatter(timeZone).formatToParts(instant)) p[type] = value;
  return {
    year: Number(p.year),
    month: Number(p.month),
    day: Number(p.day),
    hour: Number(p.hour),
    minute: Number(p.minute),
    second: Number(p.second),
    weekday: WEEKDAYS.indexOf(p.weekday),
  };
}

/** Зсув пояса від UTC у хвилинах для конкретного моменту (Київ: +120 взимку, +180 влітку). */
export function timeZoneOffsetMin(instant: Date, timeZone = SHOP_TIME_ZONE): number {
  const p = parts(instant, timeZone);
  const asUtc = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second);
  const truncated = Math.floor(instant.getTime() / 1000) * 1000;
  return Math.round((asUtc - truncated) / 60_000);
}

/** Місцева дата `YYYY-MM-DD` + хвилини від півночі → момент у UTC. */
export function zonedToUtc(date: string, minutes: number, timeZone = SHOP_TIME_ZONE): Date {
  const [y, m, d] = date.split('-').map(Number);
  const naive = Date.UTC(y, m - 1, d, 0, minutes);
  const first = timeZoneOffsetMin(new Date(naive), timeZone);
  let utc = naive - first * 60_000;
  const second = timeZoneOffsetMin(new Date(utc), timeZone);
  if (second !== first) utc = naive - second * 60_000;
  return new Date(utc);
}

/** Момент у UTC → місцева дата, хвилини від півночі і день тижня (0 = неділя). */
export function utcToZoned(instant: Date, timeZone = SHOP_TIME_ZONE) {
  const p = parts(instant, timeZone);
  const pad = (n: number) => String(n).padStart(2, '0');
  return {
    date: `${p.year}-${pad(p.month)}-${pad(p.day)}`,
    minutes: p.hour * 60 + p.minute,
    weekday: p.weekday,
  };
}

/** День тижня для місцевої дати `YYYY-MM-DD` (0 = неділя). */
export function weekdayOf(date: string): number {
  const [y, m, d] = date.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay();
}

/** Додати дні до місцевої дати `YYYY-MM-DD`. */
export function addDays(date: string, days: number): string {
  const [y, m, d] = date.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d + days)).toISOString().slice(0, 10);
}

/** 570 → "09:30" */
export function formatMinutes(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

/** Телефон у вигляді +380XXXXXXXXX, щоб один клієнт не ставав двома. */
export function normalizePhone(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  if (digits.length === 10 && digits.startsWith('0')) return `+38${digits}`;
  if (digits.length === 12 && digits.startsWith('380')) return `+${digits}`;
  return `+${digits}`;
}
