import { SLOT_STEP_MIN, zonedToUtc } from '@barbershop/shared';

export interface Interval {
  start: Date;
  end: Date;
}

export interface SlotInput {
  /** Місцева дата YYYY-MM-DD */
  date: string;
  durationMin: number;
  /** Робочі години майстра в цей день (хвилини від півночі) або null, якщо вихідний */
  hours: { startMin: number; endMin: number } | null;
  /** Зайнятий час: інші записи й відпустки */
  busy: Interval[];
  /** Найраніший можливий початок (зараз + мінімальний час до запису) */
  earliest: Date;
  stepMin?: number;
}

export const overlaps = (a: Interval, b: Interval) =>
  a.start < b.end && b.start < a.end;

/** Початки вільних слотів одного майстра в один день. Чиста функція: легко тестувати. */
export function computeSlots({
  date,
  durationMin,
  hours,
  busy,
  earliest,
  stepMin = SLOT_STEP_MIN,
}: SlotInput): Date[] {
  if (!hours) return [];
  const slots: Date[] = [];
  for (let m = hours.startMin; m + durationMin <= hours.endMin; m += stepMin) {
    const start = zonedToUtc(date, m);
    if (start < earliest) continue;
    const slot = {
      start,
      end: new Date(start.getTime() + durationMin * 60_000),
    };
    if (busy.some((b) => overlaps(slot, b))) continue;
    slots.push(start);
  }
  return slots;
}
