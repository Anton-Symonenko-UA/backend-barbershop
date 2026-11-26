import { ArrowRightIcon, PhoneIcon, SendIcon } from 'lucide-react';
import Link from 'next/link';
import { cn } from 'cn';
import { buttonVariants } from '@/components/ui/button';
import { Reveal } from '@/components/site/reveal';
import { site } from '@/config/site';

// Фінальний заклик: теплий тютюновий аркуш із похилим краєм
export function Booking() {
  return (
    <section
      id="booking"
      aria-labelledby="booking-title"
      className="bg-tan text-tan-foreground pt-[calc(6rem+4vw)] pb-24 [clip-path:polygon(0_0,100%_4vw,100%_100%,0_100%)] sm:pb-32"
    >
      <div className="mx-auto max-w-[1440px] px-4 sm:px-8">
        <Reveal>
          <p className="eyebrow text-tan-muted">Запис</p>
          <h2
            id="booking-title"
            className="font-heading mt-4 text-[clamp(3rem,13vw,12rem)] leading-[0.9] font-black tracking-tight uppercase"
          >
            Ваше <br />
            крісло <br />
            чекає
          </h2>
        </Reveal>

        <div className="border-tan-foreground/25 mt-16 grid gap-10 border-t pt-10 lg:grid-cols-12">
          <Reveal className="lg:col-span-5">
            <p className="max-w-md text-lg text-pretty">
              Оберіть послугу, майстра і вільний час онлайн: це займає хвилину. Зручніше голосом?
              Телефонуйте або пишіть у Telegram, відповідаємо протягом 10 хвилин.
            </p>
          </Reveal>
          <Reveal delay={0.1} className="flex flex-wrap content-start gap-3 lg:col-span-4">
            <Link
              href="/booking"
              className={cn(
                buttonVariants(),
                'bg-tan-foreground text-tan hover:bg-tan-foreground/85 h-14 w-full rounded-full px-7 text-base font-semibold sm:w-auto',
              )}
            >
              Обрати час онлайн
              <ArrowRightIcon aria-hidden className="size-4" />
            </Link>
            <a
              href={site.phoneHref}
              className={cn(
                buttonVariants({ variant: 'outline' }),
                'border-tan-foreground/40 text-tan-foreground hover:bg-tan-foreground/10 dark:border-tan-foreground/40 dark:hover:bg-tan-foreground/10 h-14 rounded-full bg-transparent px-7 text-base dark:bg-transparent',
              )}
            >
              <PhoneIcon aria-hidden className="size-4" />
              <span className="tabular-nums">{site.phone}</span>
            </a>
            <a
              href={site.telegram}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                buttonVariants({ variant: 'outline' }),
                'border-tan-foreground/40 text-tan-foreground hover:bg-tan-foreground/10 dark:border-tan-foreground/40 dark:hover:bg-tan-foreground/10 h-14 rounded-full bg-transparent px-7 text-base dark:bg-transparent',
              )}
            >
              <SendIcon aria-hidden className="size-4" />
              Telegram
            </a>
          </Reveal>
          <Reveal delay={0.15} className="lg:col-span-3">
            <dl className="grid gap-3">
              {site.hours.map((h) => (
                <div
                  key={h.days}
                  className="border-tan-foreground/20 flex justify-between border-b pb-3"
                >
                  <dt className="eyebrow text-tan-muted">{h.days}</dt>
                  <dd className="tabular-nums">{h.time}</dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
