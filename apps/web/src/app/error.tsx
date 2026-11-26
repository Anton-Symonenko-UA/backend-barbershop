'use client';

import { RotateCwIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { site } from '@/config/site';

// Межа помилок для всіх сторінок. Шапку не рендеримо: вона може бути причиною.
export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main
      id="main"
      className="mx-auto grid min-h-svh max-w-[1440px] content-center gap-8 px-4 sm:px-8"
    >
      <p className="eyebrow text-primary">Збій</p>
      <h1 className="font-heading text-[clamp(2.5rem,10vw,8rem)] leading-[0.9] font-black uppercase">
        Щось <br /> зламалось
      </h1>
      <p className="text-muted-foreground max-w-md">
        Спробуйте оновити сторінку. Якщо не допоможе, запишіться телефоном:{' '}
        <a
          href={site.phoneHref}
          className="text-foreground tabular-nums underline underline-offset-4"
        >
          {site.phone}
        </a>
        .
      </p>
      <Button onClick={reset} className="h-12 justify-self-start rounded-full px-7">
        <RotateCwIcon aria-hidden className="size-4" />
        Спробувати ще раз
      </Button>
    </main>
  );
}
