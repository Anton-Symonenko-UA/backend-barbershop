'use client';

import {
  BOOKING_HORIZON_DAYS,
  addDays,
  utcToZoned,
  type Availability,
  type AvailabilitySlot,
} from '@barbershop/shared';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { api, errorMessage } from '@/lib/api';
import { formatTime, localDateToInstant } from '@/lib/format';
import { Choice } from './choice';

const dayFmt = new Intl.DateTimeFormat('uk-UA', { timeZone: 'UTC', weekday: 'short' });
const numFmt = new Intl.DateTimeFormat('uk-UA', {
  timeZone: 'UTC',
  day: 'numeric',
  month: 'short',
});

const PARTS = [
  { label: 'Ранок', until: 12 * 60 },
  { label: 'День', until: 17 * 60 },
  { label: 'Вечір', until: 24 * 60 },
];

export function useAvailability(serviceId: string | null, date: string | null, barberId?: string) {
  return useQuery({
    queryKey: ['availability', serviceId, date, barberId ?? 'any'],
    enabled: Boolean(serviceId && date),
    staleTime: 30_000,
    queryFn: ({ signal }) => {
      const q = new URLSearchParams({ serviceId: serviceId!, date: date! });
      if (barberId) q.set('barberId', barberId);
      return api<Availability>(`/availability?${q}`, { signal });
    },
  });
}

/** Наступні дні для вибору (за київським часом). */
export function useDays(count = 14) {
  return useMemo(() => {
    const today = utcToZoned(new Date()).date;
    return Array.from({ length: Math.min(count, BOOKING_HORIZON_DAYS + 1) }, (_, i) =>
      addDays(today, i),
    );
  }, [count]);
}

export function DatePicker({
  value,
  onChange,
  labelledBy,
}: {
  value: string | null;
  onChange: (date: string) => void;
  labelledBy: string;
}) {
  const days = useDays();
  return (
    <div
      role="radiogroup"
      aria-labelledby={labelledBy}
      className="-mx-4 flex snap-x gap-2 overflow-x-auto px-4 pb-2 sm:mx-0 sm:flex-wrap sm:px-0"
    >
      {days.map((d, i) => {
        const instant = localDateToInstant(d);
        return (
          <Choice
            key={d}
            name="date"
            value={d}
            checked={value === d}
            onChange={onChange}
            className="w-[5.25rem] shrink-0 snap-start flex-col items-center px-1 py-3 text-center"
          >
            <span className="text-muted-foreground text-xs">
              {i === 0 ? 'Сьогодні' : i === 1 ? 'Завтра' : dayFmt.format(instant)}
            </span>
            <span className="mt-1 text-sm font-semibold tabular-nums">
              {numFmt.format(instant)}
            </span>
          </Choice>
        );
      })}
    </div>
  );
}

export function SlotPicker({
  serviceId,
  date,
  barberId,
  value,
  onChange,
  labelledBy,
}: {
  serviceId: string;
  date: string;
  barberId?: string;
  value: string | null;
  onChange: (slot: AvailabilitySlot) => void;
  labelledBy: string;
}) {
  const { data, isPending, isError, error, refetch } = useAvailability(serviceId, date, barberId);

  if (isPending) {
    return (
      <div className="grid grid-cols-4 gap-2 sm:grid-cols-6" aria-busy="true" aria-live="polite">
        <span className="sr-only">Завантажуємо вільний час…</span>
        {Array.from({ length: 12 }, (_, i) => (
          <Skeleton key={i} className="h-12 rounded-xl" />
        ))}
      </div>
    );
  }
  if (isError) {
    return (
      <p role="alert" className="text-destructive text-sm">
        {errorMessage(error, 'Не вдалося завантажити вільний час.')}{' '}
        <button type="button" onClick={() => refetch()} className="underline underline-offset-4">
          Спробувати ще раз
        </button>
      </p>
    );
  }
  if (data.slots.length === 0) {
    return (
      <p className="text-muted-foreground text-sm" aria-live="polite">
        На цей день вільного часу немає. Оберіть інший день
        {barberId ? ' або іншого майстра' : ''}.
      </p>
    );
  }

  const groups = PARTS.map((part, i) => ({
    label: part.label,
    slots: data.slots.filter((s) => {
      const m = utcToZoned(new Date(s.startsAt)).minutes;
      return m < part.until && m >= (i === 0 ? 0 : PARTS[i - 1].until);
    }),
  })).filter((g) => g.slots.length > 0);

  return (
    <div role="radiogroup" aria-labelledby={labelledBy} className="grid gap-5">
      {groups.map((g) => (
        <div key={g.label}>
          <p className="eyebrow text-muted-foreground mb-2">{g.label}</p>
          <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
            {g.slots.map((s) => (
              <Choice
                key={s.startsAt}
                name="slot"
                value={s.startsAt}
                checked={value === s.startsAt}
                onChange={() => onChange(s)}
                className="justify-center px-1 py-3 text-sm font-semibold tabular-nums"
              >
                {formatTime(s.startsAt)}
              </Choice>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
