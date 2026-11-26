'use client';

import type { AvailabilitySlot, BookingDetails, BookingStatus } from '@barbershop/shared';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CalendarPlusIcon, CheckIcon, Loader2Icon, PhoneIcon } from 'lucide-react';
import Link from 'next/link';
import { useId, useState } from 'react';
import { toast } from 'sonner';
import { cn } from 'cn';
import { Button, buttonVariants } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { site } from '@/config/site';
import { ApiError, api, errorMessage } from '@/lib/api';
import { track } from '@/lib/analytics';
import { formatDateTime, formatPrice } from '@/lib/format';
import { StepTitle } from './choice';
import { DatePicker, SlotPicker, useDays } from './slot-picker';

const STATUS: Record<BookingStatus, string> = {
  PENDING: 'Очікує підтвердження',
  CONFIRMED: 'Підтверджено',
  CANCELLED: 'Скасовано',
  COMPLETED: 'Візит відбувся',
  NO_SHOW: 'Візит пропущено',
};

function googleCalendarUrl(b: BookingDetails) {
  const fmt = (iso: string) => iso.replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  const q = new URLSearchParams({
    action: 'TEMPLATE',
    text: `${b.service.name} · ${site.name}`,
    dates: `${fmt(b.startsAt)}/${fmt(b.endsAt)}`,
    details: `Майстер: ${b.barber.name}. Телефон: ${site.phone}`,
    location: `${site.city}, ${site.address}`,
  });
  return `https://calendar.google.com/calendar/render?${q}`;
}

export function ManageBooking({ token, isNew }: { token: string; isNew: boolean }) {
  const queryClient = useQueryClient();
  const key = ['booking', token];
  const query = useQuery({
    queryKey: key,
    queryFn: ({ signal }) => api<BookingDetails>(`/bookings/manage/${token}`, { signal }),
    retry: (count, error) => !(error instanceof ApiError && error.status < 500) && count < 2,
  });
  const [rescheduling, setRescheduling] = useState(false);

  const cancel = useMutation({
    mutationFn: () => api<BookingDetails>(`/bookings/manage/${token}/cancel`, { method: 'POST' }),
    onSuccess: (b) => {
      queryClient.setQueryData(key, b);
      track({ name: 'booking_cancelled', params: {} });
      toast.success('Запис скасовано');
    },
    onError: (e) => toast.error(errorMessage(e)),
  });

  if (query.isPending) {
    return (
      <div className="grid gap-4" aria-busy="true">
        <span className="sr-only">Завантажуємо запис…</span>
        <Skeleton className="h-12 w-2/3" />
        <Skeleton className="h-40" />
      </div>
    );
  }
  if (query.isError) {
    const notFound = query.error instanceof ApiError && query.error.status === 404;
    return (
      <div className="grid gap-6">
        <h1 className="font-heading text-3xl font-black uppercase sm:text-5xl">
          {notFound ? 'Запис не знайдено' : 'Не вдалося завантажити'}
        </h1>
        <p className="text-muted-foreground max-w-md">
          {notFound
            ? 'Посилання неповне або застаріле. Перевірте SMS чи зателефонуйте нам.'
            : errorMessage(query.error)}
        </p>
        <div className="flex flex-wrap gap-3">
          <Link href="/booking" className={cn(buttonVariants(), 'h-12 rounded-full px-6')}>
            Новий запис
          </Link>
          <a
            href={site.phoneHref}
            className={cn(buttonVariants({ variant: 'outline' }), 'h-12 rounded-full px-6')}
          >
            {site.phone}
          </a>
        </div>
      </div>
    );
  }

  const b = query.data;
  const active = b.status === 'PENDING' || b.status === 'CONFIRMED';

  return (
    <div className="grid gap-10">
      <div>
        {isNew && active ? (
          <p className="eyebrow text-primary flex items-center gap-2" role="status">
            <CheckIcon aria-hidden className="size-4" /> Ви записані
          </p>
        ) : (
          <p className="eyebrow text-muted-foreground">{STATUS[b.status]}</p>
        )}
        <h1 className="font-heading mt-4 text-[clamp(2.25rem,8vw,5rem)] leading-[0.95] font-black uppercase">
          {active ? `До зустрічі, ${b.customerName}` : STATUS[b.status]}
        </h1>
      </div>

      <dl className="bg-paper text-paper-foreground grid gap-5 rounded-2xl p-6 sm:grid-cols-2 sm:p-8">
        <Item label="Коли" value={formatDateTime(b.startsAt)} strong />
        <Item label="Майстер" value={b.barber.name} />
        <Item label="Послуга" value={b.service.name} />
        <Item label="Вартість" value={`${formatPrice(b.priceCents)}, оплата на місці`} />
        <Item label="Адреса" value={`${site.city}, ${site.address}`} />
        <Item label="Статус" value={STATUS[b.status]} />
      </dl>

      {isNew && active && (
        <p className="text-muted-foreground max-w-xl text-sm">
          Збережіть цю сторінку в закладки: за цим посиланням можна перенести або скасувати запис.
          Ми також надішлемо його в SMS.
        </p>
      )}

      {active && (
        <div className="flex flex-wrap gap-3">
          <a
            href={googleCalendarUrl(b)}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(buttonVariants({ variant: 'outline' }), 'h-12 rounded-full px-6')}
          >
            <CalendarPlusIcon aria-hidden className="size-4" />
            Додати в календар
          </a>
          {b.canChange && (
            <>
              <Button
                variant="outline"
                className="h-12 rounded-full px-6"
                aria-expanded={rescheduling}
                onClick={() => setRescheduling((v) => !v)}
              >
                Перенести
              </Button>
              <Dialog>
                <DialogTrigger
                  render={<Button variant="destructive" className="h-12 rounded-full px-6" />}
                >
                  Скасувати запис
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Скасувати запис?</DialogTitle>
                    <DialogDescription>
                      {b.service.name}, {formatDateTime(b.startsAt)}. Час звільниться для інших
                      клієнтів.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <DialogClose render={<Button variant="outline" />}>Залишити</DialogClose>
                    <DialogClose
                      render={<Button variant="destructive" />}
                      onClick={() => cancel.mutate()}
                      disabled={cancel.isPending}
                    >
                      {cancel.isPending && (
                        <Loader2Icon aria-hidden className="size-4 animate-spin" />
                      )}
                      Так, скасувати
                    </DialogClose>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </>
          )}
        </div>
      )}

      {active && !b.canChange && (
        <p className="text-muted-foreground text-sm">
          До візиту менше двох годин, тому змінити запис онлайн уже не можна.{' '}
          <a href={site.phoneHref} className="text-foreground underline underline-offset-4">
            Зателефонуйте нам
          </a>
          .
        </p>
      )}

      {rescheduling && b.canChange && (
        <Reschedule
          token={token}
          booking={b}
          onDone={(updated) => {
            queryClient.setQueryData(key, updated);
            setRescheduling(false);
          }}
        />
      )}

      {!active && (
        <div className="flex flex-wrap gap-3">
          <Link href="/booking" className={cn(buttonVariants(), 'h-12 rounded-full px-6')}>
            Записатися знову
          </Link>
          <a
            href={site.phoneHref}
            className={cn(buttonVariants({ variant: 'outline' }), 'h-12 rounded-full px-6')}
          >
            <PhoneIcon aria-hidden className="size-4" />
            {site.phone}
          </a>
        </div>
      )}
    </div>
  );
}

function Reschedule({
  token,
  booking,
  onDone,
}: {
  token: string;
  booking: BookingDetails;
  onDone: (b: BookingDetails) => void;
}) {
  const ids = useId();
  const queryClient = useQueryClient();
  const days = useDays();
  const [date, setDate] = useState(days[0]);
  const [slot, setSlot] = useState<AvailabilitySlot | null>(null);

  const move = useMutation({
    mutationFn: (startsAt: string) =>
      api<BookingDetails>(`/bookings/manage/${token}/reschedule`, {
        method: 'POST',
        body: JSON.stringify({ startsAt }),
      }),
    onSuccess: (b) => {
      track({ name: 'booking_rescheduled', params: {} });
      toast.success(`Перенесено на ${formatDateTime(b.startsAt)}`);
      void queryClient.invalidateQueries({ queryKey: ['availability'] });
      onDone(b);
    },
    onError: (e) => {
      if (e instanceof ApiError && e.status === 409) setSlot(null);
      void queryClient.invalidateQueries({ queryKey: ['availability'] });
      toast.error(errorMessage(e));
    },
  });

  return (
    <fieldset className="border-border grid gap-6 rounded-2xl border p-5 sm:p-8">
      <StepTitle n={1} id={`${ids}-date`}>
        Новий час у {booking.barber.name}
      </StepTitle>
      <DatePicker
        value={date}
        onChange={(d) => {
          setDate(d);
          setSlot(null);
        }}
        labelledBy={`${ids}-date`}
      />
      <SlotPicker
        serviceId={booking.service.id}
        date={date}
        barberId={booking.barber.id}
        value={slot?.startsAt ?? null}
        onChange={setSlot}
        labelledBy={`${ids}-date`}
      />
      <Button
        className="h-12 justify-self-start rounded-full px-6"
        disabled={!slot || move.isPending}
        onClick={() => slot && move.mutate(slot.startsAt)}
      >
        {move.isPending && <Loader2Icon aria-hidden className="size-4 animate-spin" />}
        {slot ? `Перенести на ${formatDateTime(slot.startsAt)}` : 'Оберіть час'}
      </Button>
    </fieldset>
  );
}

function Item({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="border-paper-foreground/15 grid gap-1 border-b pb-4">
      <dt className="eyebrow text-paper-muted">{label}</dt>
      <dd
        className={cn(
          strong ? 'font-heading text-xl font-semibold first-letter:uppercase' : 'font-medium',
        )}
      >
        {value}
      </dd>
    </div>
  );
}
