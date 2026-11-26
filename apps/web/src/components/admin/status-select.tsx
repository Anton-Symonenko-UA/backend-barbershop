'use client';

import { BOOKING_STATUSES, type BookingStatus } from '@barbershop/shared';
import { useTransition } from 'react';
import { toast } from 'sonner';
import { cn } from 'cn';
import { setBookingStatus } from '@/lib/admin/actions';

export const STATUS_LABEL: Record<BookingStatus, string> = {
  PENDING: 'Новий',
  CONFIRMED: 'Підтверджено',
  CANCELLED: 'Скасовано',
  COMPLETED: 'Прийшов',
  NO_SHOW: 'Не прийшов',
};

const tone: Record<BookingStatus, string> = {
  PENDING: 'border-primary text-primary',
  CONFIRMED: 'border-foreground/40',
  CANCELLED: 'border-border text-muted-foreground line-through',
  COMPLETED: 'border-border text-muted-foreground',
  NO_SHOW: 'border-destructive text-destructive',
};

export function StatusSelect({
  id,
  status,
  label,
}: {
  id: string;
  status: BookingStatus;
  label: string;
}) {
  const [pending, start] = useTransition();
  return (
    <select
      aria-label={`Статус: ${label}`}
      value={status}
      disabled={pending || status === 'CANCELLED'}
      onChange={(e) => {
        const next = e.target.value as BookingStatus;
        start(async () => {
          const res = await setBookingStatus(id, next);
          if (res) (res.ok ? toast.success : toast.error)(res.message);
        });
      }}
      className={cn(
        'focus-visible:ring-ring/50 h-9 rounded-full border bg-transparent px-3 text-sm outline-none focus-visible:ring-3 disabled:opacity-60',
        tone[status],
        pending && 'animate-pulse',
      )}
    >
      {BOOKING_STATUSES.map((s) => (
        <option key={s} value={s} className="bg-background text-foreground">
          {STATUS_LABEL[s]}
        </option>
      ))}
    </select>
  );
}
