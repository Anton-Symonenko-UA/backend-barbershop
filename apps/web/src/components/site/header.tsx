'use client';

import { MenuIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { cn } from 'cn';
import { buttonVariants } from '@/components/ui/button';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { nav, site } from '@/config/site';

export function Header() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,backdrop-filter] duration-300',
        scrolled
          ? 'border-border bg-background/75 border-b backdrop-blur-md'
          : 'border-b border-transparent',
      )}
    >
      <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between gap-6 px-4 sm:px-8">
        <a
          href="#top"
          className="font-heading focus-visible:outline-ring text-lg font-bold tracking-[0.18em] focus-visible:outline-2 focus-visible:outline-offset-4"
          aria-label={`${site.name}, на початок сторінки`}
        >
          {site.name}
        </a>

        <nav aria-label="Основна навігація" className="hidden lg:block">
          <ul className="flex items-center gap-8">
            {nav.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  className="eyebrow text-foreground/70 hover:text-foreground focus-visible:text-foreground transition-colors focus-visible:outline-none"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <a
            href={site.phoneHref}
            className="text-foreground/70 hover:text-foreground hidden text-sm tabular-nums transition-colors md:block"
          >
            {site.phone}
          </a>
          <a
            href="#booking"
            className={cn(buttonVariants(), 'h-10 rounded-full px-5 text-[0.8rem] font-semibold')}
          >
            Записатися
          </a>

          <Sheet>
            <SheetTrigger
              className={cn(
                buttonVariants({ variant: 'ghost', size: 'icon-lg' }),
                'size-11 lg:hidden',
              )}
              aria-label="Відкрити меню"
            >
              <MenuIcon className="size-5" />
            </SheetTrigger>
            <SheetContent side="right" className="bg-background w-full max-w-sm">
              <SheetHeader>
                <SheetTitle className="font-heading tracking-[0.18em]">{site.name}</SheetTitle>
              </SheetHeader>
              <nav aria-label="Мобільна навігація" className="px-4">
                <ul className="flex flex-col">
                  {nav.map((item, i) => (
                    <li key={item.href} className="border-border border-b">
                      <SheetClose
                        nativeButton={false}
                        render={<a href={item.href} />}
                        className="font-heading flex items-baseline gap-4 py-5 text-2xl"
                      >
                        <span className="eyebrow text-muted-foreground">0{i + 1}</span>
                        {item.label}
                      </SheetClose>
                    </li>
                  ))}
                </ul>
                <a href={site.phoneHref} className="text-muted-foreground mt-8 block tabular-nums">
                  {site.phone}
                </a>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
