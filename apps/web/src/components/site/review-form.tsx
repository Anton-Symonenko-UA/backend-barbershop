'use client';

import { reviewCreateSchema, type PublicBarber } from '@barbershop/shared';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { Loader2Icon, StarIcon } from 'lucide-react';
import { useId } from 'react';
import { Controller, useForm } from 'react-hook-form';
import type { z } from 'zod';
import { cn } from 'cn';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { api, errorMessage } from '@/lib/api';
import { track } from '@/lib/analytics';

type Values = z.input<typeof reviewCreateSchema>;

export function ReviewForm({ barbers }: { barbers: PublicBarber[] }) {
  const id = useId();
  const form = useForm<Values, unknown, z.output<typeof reviewCreateSchema>>({
    resolver: zodResolver(reviewCreateSchema),
    defaultValues: { authorName: '', rating: 5, text: '', barberId: undefined, website: '' },
  });
  const send = useMutation({
    mutationFn: (v: z.output<typeof reviewCreateSchema>) =>
      api('/reviews', { method: 'POST', body: JSON.stringify(v) }),
    onSuccess: (_, v) => track({ name: 'review_submitted', params: { rating: v.rating } }),
  });
  const errors = form.formState.errors;

  if (send.isSuccess) {
    return (
      <div role="status" className="bg-paper text-paper-foreground rounded-2xl p-8">
        <p className="font-heading text-2xl font-semibold">Дякуємо!</p>
        <p className="text-paper-muted mt-2">Відгук з’явиться на сайті після перевірки.</p>
      </div>
    );
  }

  return (
    <form
      noValidate
      onSubmit={form.handleSubmit((v) => send.mutate(v))}
      className="bg-paper text-paper-foreground grid gap-5 rounded-2xl p-6 sm:p-8"
    >
      <fieldset>
        <legend className="mb-3 text-sm font-medium">Оцінка</legend>
        <Controller
          control={form.control}
          name="rating"
          render={({ field }) => (
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <label
                  key={n}
                  className="has-[:focus-visible]:outline-paper-foreground cursor-pointer rounded has-[:focus-visible]:outline-2"
                >
                  <input
                    type="radio"
                    name={field.name}
                    value={n}
                    checked={Number(field.value) === n}
                    onChange={() => field.onChange(n)}
                    className="sr-only"
                  />
                  <span className="sr-only">{n} з 5</span>
                  <StarIcon
                    aria-hidden
                    className={cn(
                      'size-8',
                      n <= Number(field.value) ? 'fill-current' : 'opacity-30',
                    )}
                  />
                </label>
              ))}
            </div>
          )}
        />
      </fieldset>
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor={`${id}-name`}>Ім’я</Label>
          <Input
            id={`${id}-name`}
            autoComplete="given-name"
            className="border-paper-foreground/25 h-12 rounded-xl px-4"
            aria-invalid={Boolean(errors.authorName)}
            aria-describedby={`${id}-name-err`}
            {...form.register('authorName')}
          />
          <p id={`${id}-name-err`} className="text-destructive min-h-5 text-sm">
            {errors.authorName?.message}
          </p>
        </div>
        <div className="grid gap-2">
          <Label htmlFor={`${id}-barber`}>Майстер (необов’язково)</Label>
          <select
            id={`${id}-barber`}
            className="border-paper-foreground/25 focus-visible:ring-paper-foreground/40 h-12 rounded-xl border bg-transparent px-4 outline-none focus-visible:ring-3"
            {...form.register('barberId', { setValueAs: (v) => v || undefined })}
          >
            <option value="">Не вказувати</option>
            {barbers.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="grid gap-2">
        <Label htmlFor={`${id}-text`}>Відгук</Label>
        <Textarea
          id={`${id}-text`}
          rows={4}
          className="border-paper-foreground/25 rounded-xl px-4 py-3"
          aria-invalid={Boolean(errors.text)}
          aria-describedby={`${id}-text-err`}
          {...form.register('text')}
        />
        <p id={`${id}-text-err`} className="text-destructive min-h-5 text-sm">
          {errors.text?.message}
        </p>
      </div>
      <div aria-hidden className="absolute -left-[9999px] h-0 overflow-hidden">
        <input tabIndex={-1} autoComplete="off" {...form.register('website')} />
      </div>
      {send.isError && (
        <p role="alert" className="text-destructive text-sm">
          {errorMessage(send.error)}
        </p>
      )}
      <Button
        type="submit"
        disabled={send.isPending}
        className="bg-paper-foreground text-paper hover:bg-paper-foreground/85 h-12 justify-self-start rounded-full px-7"
      >
        {send.isPending && <Loader2Icon aria-hidden className="size-4 animate-spin" />}
        Надіслати відгук
      </Button>
    </form>
  );
}
