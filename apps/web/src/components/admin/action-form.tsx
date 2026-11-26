'use client';

import { Loader2Icon } from 'lucide-react';
import { startTransition, useActionState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import type { ActionState } from '@/lib/admin/actions';

/** Форма на Server Action: показує результат тостом і блокує кнопку, поки йде збереження. */
export function ActionForm({
  action,
  children,
  submitLabel = 'Зберегти',
  className,
  resetOnSuccess,
}: {
  action: (state: ActionState, fd: FormData) => Promise<ActionState>;
  children: React.ReactNode;
  submitLabel?: string;
  className?: string;
  resetOnSuccess?: boolean;
}) {
  const [state, formAction, pending] = useActionState(action, null);
  const ref = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!state) return;
    if (state.ok) {
      toast.success(state.message);
      if (resetOnSuccess) ref.current?.reset();
    } else {
      toast.error(state.message);
    }
  }, [state, resetOnSuccess]);

  return (
    // onSubmit замість action: React не очищає форму автоматично, тож при помилці
    // введене не зникає; після успіху очищаємо лише форми створення (resetOnSuccess)
    <form
      ref={ref}
      className={className}
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        startTransition(() => formAction(fd));
      }}
    >
      {children}
      <div className="flex items-center gap-3">
        <Button type="submit" disabled={pending} className="h-10 rounded-full px-5">
          {pending && <Loader2Icon aria-hidden className="size-4 animate-spin" />}
          {submitLabel}
        </Button>
        {state && !state.ok && (
          <p role="alert" className="text-destructive text-sm">
            {state.message}
          </p>
        )}
      </div>
    </form>
  );
}

/** Кнопка одноразової дії (опублікувати, видалити) з тостом результату. */
export function ActionButton({
  run,
  children,
  variant = 'outline',
  confirm,
}: {
  run: () => Promise<ActionState>;
  children: React.ReactNode;
  variant?: 'outline' | 'destructive' | 'default' | 'ghost';
  confirm?: string;
}) {
  const [, act, pending] = useActionState(async () => {
    if (confirm && !window.confirm(confirm)) return null;
    const res = await run();
    if (res) (res.ok ? toast.success : toast.error)(res.message);
    return res;
  }, null);
  return (
    <form action={act}>
      <Button
        type="submit"
        size="sm"
        variant={variant}
        disabled={pending}
        className="rounded-full px-3"
      >
        {pending && <Loader2Icon aria-hidden className="size-3.5 animate-spin" />}
        {children}
      </Button>
    </form>
  );
}
