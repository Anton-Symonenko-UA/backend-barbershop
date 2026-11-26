'use client';

import {
  bookingCreateSchema,
  type AvailabilitySlot,
  type BookingCreated,
  type PublicBarber,
  type PublicService,
} from '@barbershop/shared';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowRightIcon, Loader2Icon, PhoneIcon } from 'lucide-react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useId, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';
import { cn } from 'cn';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { site } from '@/config/site';
import { ApiError, api, errorMessage } from '@/lib/api';
import { track } from '@/lib/analytics';
import { groupByCategory } from '@/lib/group';
import { formatDateTime, formatPrice } from '@/lib/format';
import { Choice, StepTitle } from './choice';
import { DatePicker, SlotPicker, useDays } from './slot-picker';

const ANY = 'any';

const contactSchema = bookingCreateSchema.pick({
  customerName: true,
  customerPhone: true,
  comment: true,
  website: true,
});
type Contact = z.infer<typeof contactSchema>;

export function BookingWizard({
  services,
  barbers,
}: {
  services: PublicService[];
  barbers: PublicBarber[];
}) {
  const params = useSearchParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const ids = useId();
  const days = useDays();

  const [serviceId, setServiceId] = useState<string | null>(
    () => services.find((s) => s.slug === params.get('service'))?.id ?? null,
  );
  const [barberId, setBarberId] = useState<string>(
    () => barbers.find((b) => b.slug === params.get('barber'))?.id ?? ANY,
  );
  const [date, setDate] = useState<string>(days[0]);
  const [slot, setSlot] = useState<AvailabilitySlot | null>(null);
  const contactsRef = useRef<HTMLFieldSetElement>(null);

  useEffect(() => {
    track({
      name: 'booking_start',
      params: { source: params.get('service') ? 'service' : 'direct' },
    });
    // Лише при першому відкритті
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const service = services.find((s) => s.id === serviceId) ?? null;
  // Майстри, які роблять обрану послугу
  const available = barbers.filter((b) => !serviceId || b.serviceIds.includes(serviceId));
  const chosenBarber = barbers.find((b) => b.id === barberId) ?? null;
  const slotBarber = slot
    ? barbers.find((b) => b.id === (chosenBarber?.id ?? slot.barberIds[0]))
    : null;

  const form = useForm<Contact>({
    resolver: zodResolver(contactSchema),
    defaultValues: { customerName: '', customerPhone: '+380 ', comment: '', website: '' },
  });

  const submit = useMutation({
    mutationFn: (contact: Contact) =>
      api<BookingCreated>('/bookings', {
        method: 'POST',
        body: JSON.stringify({
          ...contact,
          comment: contact.comment || undefined,
          serviceId,
          barberId: slotBarber?.id,
          startsAt: slot?.startsAt,
        }),
      }),
    onSuccess: (booking) => {
      track({
        name: 'booking_submitted',
        params: {
          service: booking.service.name,
          barber: booking.barber.name,
          value: booking.priceCents / 100,
          currency: 'UAH',
        },
      });
      router.push(`/booking/${booking.manageToken}?new=1`);
    },
    onError: (error) => {
      track({
        name: 'booking_failed',
        params: { reason: error instanceof ApiError ? String(error.status) : 'network' },
      });
      if (error instanceof ApiError && error.status === 409) {
        toast.error('Цей час щойно зайняли. Оберіть, будь ласка, інший.');
        setSlot(null);
        void queryClient.invalidateQueries({ queryKey: ['availability'] });
        return;
      }
      toast.error(errorMessage(error));
    },
  });

  const chooseService = (id: string) => {
    setServiceId(id);
    setSlot(null);
    // Якщо обраний майстер не робить цю послугу, повертаємось до «будь-хто»
    if (barberId !== ANY && !barbers.find((b) => b.id === barberId)?.serviceIds.includes(id)) {
      setBarberId(ANY);
    }
    track({ name: 'booking_step', params: { step: 'service' } });
  };

  const chooseSlot = (s: AvailabilitySlot) => {
    setSlot(s);
    track({ name: 'booking_step', params: { step: 'slot' } });
    // На мобільному одразу показуємо форму контактів
    requestAnimationFrame(() =>
      contactsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }),
    );
  };

  return (
    <div className="grid gap-12 lg:grid-cols-12 lg:gap-10">
      <div className="grid gap-14 lg:col-span-8">
        {/* 1. Послуга */}
        <fieldset className="grid gap-6">
          <StepTitle n={1} id={`${ids}-service`}>
            Послуга
          </StepTitle>
          <div className="grid gap-8">
            {groupByCategory(services).map(([category, items]) => (
              <div key={category} role="radiogroup" aria-label={category}>
                <p className="eyebrow text-muted-foreground mb-3">{category}</p>
                <div className="grid gap-2 sm:grid-cols-2">
                  {items.map((s) => (
                    <Choice
                      key={s.id}
                      name="service"
                      value={s.id}
                      checked={serviceId === s.id}
                      onChange={chooseService}
                      className="flex-col gap-1"
                    >
                      <span className="flex items-baseline justify-between gap-3">
                        <span className="font-semibold">{s.name}</span>
                        <span className="font-heading shrink-0 font-semibold tabular-nums">
                          {formatPrice(s.priceCents)}
                        </span>
                      </span>
                      <span className="text-muted-foreground text-sm">
                        {s.durationMin} хв{s.description ? ` · ${s.description}` : ''}
                      </span>
                    </Choice>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </fieldset>

        {/* 2. Майстер */}
        <fieldset className={cn('grid gap-6', !service && 'opacity-50')} disabled={!service}>
          <StepTitle n={2} id={`${ids}-barber`}>
            Майстер
          </StepTitle>
          <div
            role="radiogroup"
            aria-labelledby={`${ids}-barber`}
            className="grid gap-2 sm:grid-cols-2"
          >
            <Choice
              name="barber"
              value={ANY}
              checked={barberId === ANY}
              onChange={(v) => {
                setBarberId(v);
                setSlot(null);
              }}
              className="items-center gap-4"
            >
              <span className="bg-muted text-primary font-heading flex size-14 shrink-0 items-center justify-center rounded-full text-lg">
                ∗
              </span>
              <span>
                <span className="block font-semibold">Будь-хто з майстрів</span>
                <span className="text-muted-foreground text-sm">Більше вільного часу</span>
              </span>
            </Choice>
            {available.map((b) => (
              <Choice
                key={b.id}
                name="barber"
                value={b.id}
                checked={barberId === b.id}
                onChange={(v) => {
                  setBarberId(v);
                  setSlot(null);
                  track({ name: 'booking_step', params: { step: 'barber' } });
                }}
                className="items-center gap-4"
              >
                {b.photoUrl ? (
                  <Image
                    src={b.photoUrl}
                    alt=""
                    width={56}
                    height={56}
                    className="size-14 shrink-0 rounded-full object-cover grayscale"
                  />
                ) : (
                  <span className="bg-muted size-14 shrink-0 rounded-full" />
                )}
                <span>
                  <span className="block font-semibold">{b.name}</span>
                  <span className="text-muted-foreground text-sm">{b.title ?? b.specialty}</span>
                </span>
              </Choice>
            ))}
          </div>
        </fieldset>

        {/* 3. Дата й час */}
        <fieldset className={cn('grid gap-6', !service && 'opacity-50')} disabled={!service}>
          <StepTitle n={3} id={`${ids}-date`}>
            Дата й час
          </StepTitle>
          <DatePicker
            value={date}
            labelledBy={`${ids}-date`}
            onChange={(d) => {
              setDate(d);
              setSlot(null);
              track({ name: 'booking_step', params: { step: 'date' } });
            }}
          />
          {service ? (
            <SlotPicker
              serviceId={service.id}
              date={date}
              barberId={barberId === ANY ? undefined : barberId}
              value={slot?.startsAt ?? null}
              onChange={chooseSlot}
              labelledBy={`${ids}-date`}
            />
          ) : (
            <p className="text-muted-foreground text-sm">Спершу оберіть послугу.</p>
          )}
        </fieldset>

        {/* 4. Контакти */}
        <fieldset
          ref={contactsRef}
          className={cn('grid scroll-mt-24 gap-6', !slot && 'opacity-50')}
          disabled={!slot || submit.isPending}
        >
          <StepTitle n={4} id={`${ids}-contacts`}>
            Контакти
          </StepTitle>
          <form
            id="booking-form"
            noValidate
            className="grid gap-5 sm:grid-cols-2"
            onSubmit={form.handleSubmit((v) => submit.mutate(v))}
          >
            <Field
              label="Ім’я"
              error={form.formState.errors.customerName?.message}
              id={`${ids}-name`}
            >
              <Input
                id={`${ids}-name`}
                autoComplete="name"
                className="h-12 rounded-xl px-4"
                aria-invalid={Boolean(form.formState.errors.customerName)}
                aria-describedby={`${ids}-name-error`}
                {...form.register('customerName')}
              />
            </Field>
            <Field
              label="Телефон"
              error={form.formState.errors.customerPhone?.message}
              id={`${ids}-phone`}
            >
              <Input
                id={`${ids}-phone`}
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                className="h-12 rounded-xl px-4 tabular-nums"
                aria-invalid={Boolean(form.formState.errors.customerPhone)}
                aria-describedby={`${ids}-phone-error`}
                {...form.register('customerPhone')}
              />
            </Field>
            <Field
              label="Коментар (необов’язково)"
              error={form.formState.errors.comment?.message}
              id={`${ids}-comment`}
              className="sm:col-span-2"
            >
              <Textarea
                id={`${ids}-comment`}
                rows={3}
                className="rounded-xl px-4 py-3"
                placeholder="Наприклад: хочу зберегти довжину зверху"
                aria-describedby={`${ids}-comment-error`}
                {...form.register('comment')}
              />
            </Field>
            {/* Пастка для ботів: прихована від людей і скрінрідерів */}
            <div aria-hidden className="absolute -left-[9999px] h-0 overflow-hidden">
              <label>
                Website
                <input tabIndex={-1} autoComplete="off" {...form.register('website')} />
              </label>
            </div>
          </form>
        </fieldset>
      </div>

      {/* Підсумок: прилипає збоку на десктопі */}
      <aside aria-label="Ваш запис" className="lg:col-span-4">
        <div className="bg-tan text-tan-foreground grid gap-6 rounded-2xl p-6 lg:sticky lg:top-24">
          <p className="eyebrow text-tan-muted">Ваш запис</p>
          <dl className="grid gap-4">
            <Summary label="Послуга" value={service?.name} />
            <Summary
              label="Майстер"
              value={
                slotBarber?.name ??
                chosenBarber?.name ??
                (barberId === ANY ? 'Будь-хто' : undefined)
              }
            />
            <Summary label="Час" value={slot ? formatDateTime(slot.startsAt) : undefined} />
            <Summary
              label="Вартість"
              value={
                service
                  ? `${formatPrice(service.priceCents)} · ${service.durationMin} хв`
                  : undefined
              }
            />
          </dl>
          <Button
            type="submit"
            form="booking-form"
            disabled={!slot || submit.isPending}
            className="bg-tan-foreground text-tan hover:bg-tan-foreground/85 h-14 rounded-full text-base font-semibold"
          >
            {submit.isPending ? (
              <Loader2Icon aria-hidden className="size-4 animate-spin" />
            ) : (
              <ArrowRightIcon aria-hidden className="size-4" />
            )}
            {submit.isPending ? 'Записуємо…' : 'Підтвердити запис'}
          </Button>
          <p className="text-tan-muted text-sm">
            Оплата в барбершопі. Скасувати чи перенести можна за посиланням після запису.
          </p>
          <a
            href={site.phoneHref}
            onClick={() => track({ name: 'phone_click', params: { location: 'booking' } })}
            className="text-tan-foreground inline-flex items-center gap-2 text-sm underline-offset-4 hover:underline"
          >
            <PhoneIcon aria-hidden className="size-4" />
            Або зателефонуйте: <span className="tabular-nums">{site.phone}</span>
          </a>
        </div>
      </aside>
    </div>
  );
}

function Summary({ label, value }: { label: string; value?: string }) {
  return (
    <div className="border-tan-foreground/20 grid gap-1 border-b pb-3">
      <dt className="eyebrow text-tan-muted">{label}</dt>
      <dd className={cn('font-semibold', !value && 'text-tan-muted font-normal')}>
        {value ?? '—'}
      </dd>
    </div>
  );
}

function Field({
  label,
  error,
  id,
  className,
  children,
}: {
  label: string;
  error?: string;
  id: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn('grid gap-2', className)}>
      <Label htmlFor={id}>{label}</Label>
      {children}
      <p
        id={`${id}-error`}
        role={error ? 'alert' : undefined}
        className="text-destructive min-h-5 text-sm"
      >
        {error}
      </p>
    </div>
  );
}
