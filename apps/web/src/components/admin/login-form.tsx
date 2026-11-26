'use client';

import { Loader2Icon } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { startTransition, useActionState } from 'react';
import { Button } from '@/components/ui/button';
import { login } from '@/lib/admin/actions';
import { AdminField, inputClass } from './field';

export function LoginForm() {
  const params = useSearchParams();
  const [state, action, pending] = useActionState(login, null);
  return (
    // onSubmit: після невдалої спроби email лишається в полі
    <form
      className="grid gap-5"
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        startTransition(() => action(fd));
      }}
    >
      {params.get('expired') && !state && (
        <p role="status" className="text-muted-foreground text-sm">
          Сесія завершилась. Увійдіть знову.
        </p>
      )}
      <input type="hidden" name="next" value={params.get('next') ?? ''} />
      <AdminField label="Email">
        <input
          name="email"
          type="email"
          autoComplete="username"
          required
          className={`${inputClass} h-12`}
        />
      </AdminField>
      <AdminField label="Пароль">
        <input
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className={`${inputClass} h-12`}
        />
      </AdminField>
      {state && !state.ok && (
        <p role="alert" className="text-destructive text-sm">
          {state.message}
        </p>
      )}
      <Button type="submit" disabled={pending} className="h-12 rounded-full text-base">
        {pending && <Loader2Icon aria-hidden className="size-4 animate-spin" />}
        Увійти
      </Button>
    </form>
  );
}
