import { addDays, utcToZoned, type AdminBarber, type AdminBooking } from '@barbershop/shared';
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';
import { cn } from 'cn';
import { STATUS_LABEL, StatusSelect } from '@/components/admin/status-select';
import { buttonVariants } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { adminApi } from '@/lib/admin/session';
import { formatDate, formatPrice, formatTime, localDateToInstant } from '@/lib/format';

export const metadata: Metadata = { title: 'Записи' };

export default function BookingsPage({ searchParams }: PageProps<'/admin/bookings'>) {
  return (
    <>
      <h1 className="font-heading text-3xl font-black uppercase sm:text-4xl">Записи</h1>
      <Suspense fallback={<Skeleton className="mt-8 h-96 rounded-2xl" />}>
        <Day searchParams={searchParams} />
      </Suspense>
    </>
  );
}

const isDate = (v: unknown): v is string => typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v);

async function Day({ searchParams }: Pick<PageProps<'/admin/bookings'>, 'searchParams'>) {
  const sp = await searchParams;
  const today = utcToZoned(new Date()).date;
  const date = isDate(sp.date) ? sp.date : today;
  const barberId = typeof sp.barber === 'string' && sp.barber ? sp.barber : undefined;

  const q = new URLSearchParams({ from: date, to: date });
  if (barberId) q.set('barberId', barberId);
  const [bookings, barbers] = await Promise.all([
    adminApi<AdminBooking[]>(`/admin/bookings?${q}`),
    adminApi<AdminBarber[]>('/admin/barbers'),
  ]);

  const link = (d: string, b = barberId) => {
    const p = new URLSearchParams({ date: d });
    if (b) p.set('barber', b);
    return `/admin/bookings?${p}`;
  };
  const active = bookings.filter((b) => b.status !== 'CANCELLED');
  const revenue = bookings
    .filter((b) => b.status === 'COMPLETED' || b.status === 'CONFIRMED' || b.status === 'PENDING')
    .reduce((sum, b) => sum + b.priceCents, 0);
  const byBarber = barbers
    .map((barber) => ({ barber, items: bookings.filter((b) => b.barber.id === barber.id) }))
    .filter((g) => !barberId || g.barber.id === barberId);

  return (
    <div className="mt-8 grid gap-8">
      <div className="flex flex-wrap items-center gap-3">
        <Link
          href={link(addDays(date, -1))}
          className={cn(buttonVariants({ variant: 'outline', size: 'icon-lg' }), 'rounded-full')}
          aria-label="Попередній день"
        >
          <ChevronLeftIcon className="size-4" />
        </Link>
        <p className="font-heading min-w-56 text-center text-lg font-semibold first-letter:uppercase">
          {formatDate(localDateToInstant(date))}
        </p>
        <Link
          href={link(addDays(date, 1))}
          className={cn(buttonVariants({ variant: 'outline', size: 'icon-lg' }), 'rounded-full')}
          aria-label="Наступний день"
        >
          <ChevronRightIcon className="size-4" />
        </Link>
        {date !== today && (
          <Link
            href={link(today)}
            className={cn(buttonVariants({ variant: 'ghost' }), 'rounded-full')}
          >
            Сьогодні
          </Link>
        )}
        <form className="ml-auto flex items-center gap-2" action="/admin/bookings">
          <input
            type="date"
            name="date"
            defaultValue={date}
            aria-label="Дата"
            className="border-input dark:bg-input/30 h-9 rounded-full border bg-transparent px-3 text-sm"
          />
          {barbers.length > 1 && (
            <select
              name="barber"
              defaultValue={barberId ?? ''}
              aria-label="Майстер"
              className="border-input dark:bg-input/30 h-9 rounded-full border bg-transparent px-3 text-sm"
            >
              <option value="">Усі майстри</option>
              {barbers.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          )}
          <button
            type="submit"
            className={cn(buttonVariants({ variant: 'outline' }), 'h-9 rounded-full')}
          >
            Показати
          </button>
        </form>
      </div>

      <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Записів" value={String(active.length)} />
        <Stat label="Нових" value={String(bookings.filter((b) => b.status === 'PENDING').length)} />
        <Stat label="Скасовано" value={String(bookings.length - active.length)} />
        <Stat label="Очікувана виручка" value={formatPrice(revenue)} />
      </dl>

      {byBarber.length === 0 && <p className="text-muted-foreground">Немає майстрів.</p>}
      <div className="grid gap-10 xl:grid-cols-2">
        {byBarber.map(({ barber, items }) => (
          <section key={barber.id} aria-labelledby={`b-${barber.id}`}>
            <h2 id={`b-${barber.id}`} className="eyebrow text-muted-foreground mb-3">
              {barber.name} · {items.filter((i) => i.status !== 'CANCELLED').length}
            </h2>
            {items.length === 0 ? (
              <p className="border-border text-muted-foreground rounded-xl border border-dashed p-6 text-sm">
                Записів немає
              </p>
            ) : (
              <ol className="border-border divide-border divide-y rounded-xl border">
                {items.map((b) => (
                  <li
                    key={b.id}
                    className={cn(
                      'grid gap-3 p-4 sm:grid-cols-[5rem_1fr_auto] sm:items-center',
                      b.status === 'CANCELLED' && 'opacity-60',
                    )}
                  >
                    <p className="font-heading text-lg font-semibold tabular-nums">
                      {formatTime(b.startsAt)}
                      <span className="text-muted-foreground block text-xs font-normal">
                        до {formatTime(b.endsAt)}
                      </span>
                    </p>
                    <div className="min-w-0">
                      <p className="font-semibold">
                        {b.customer.name}{' '}
                        <a
                          href={`tel:${b.customer.phone}`}
                          className="text-primary text-sm font-normal tabular-nums"
                        >
                          {b.customer.phone}
                        </a>
                      </p>
                      <p className="text-muted-foreground text-sm">
                        {b.service.name} · {formatPrice(b.priceCents)}
                      </p>
                      {b.comment && <p className="mt-1 text-sm italic">«{b.comment}»</p>}
                    </div>
                    <StatusSelect
                      id={b.id}
                      status={b.status}
                      label={`${b.customer.name}, ${formatTime(b.startsAt)} (${STATUS_LABEL[b.status]})`}
                    />
                  </li>
                ))}
              </ol>
            )}
          </section>
        ))}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-card rounded-xl p-4">
      <dt className="text-muted-foreground text-xs">{label}</dt>
      <dd className="font-heading mt-1 text-2xl font-semibold tabular-nums">{value}</dd>
    </div>
  );
}
