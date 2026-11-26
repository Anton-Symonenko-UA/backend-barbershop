'use client';

import { PhoneIcon } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { cn } from 'cn';
import { buttonVariants } from '@/components/ui/button';
import { site } from '@/config/site';
import { track } from '@/lib/analytics';

// Кнопка запису, що завжди під пальцем на телефоні. З’являється після першого екрана.
export function MobileBookingBar() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > window.innerHeight * 0.6);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div
      className={cn(
        'border-border bg-background/90 fixed inset-x-0 bottom-0 z-40 flex gap-2 border-t p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-md transition-transform duration-300 motion-reduce:transition-none lg:hidden',
        visible ? 'translate-y-0' : 'pointer-events-none translate-y-full',
      )}
      aria-hidden={!visible}
      inert={!visible}
    >
      <a
        href={site.phoneHref}
        onClick={() => track({ name: 'phone_click', params: { location: 'mobile_bar' } })}
        className={cn(buttonVariants({ variant: 'outline' }), 'size-12 rounded-full')}
        aria-label={`Зателефонувати ${site.phone}`}
      >
        <PhoneIcon aria-hidden className="size-5" />
      </a>
      <Link
        href="/booking"
        className={cn(buttonVariants(), 'h-12 flex-1 rounded-full text-base font-semibold')}
      >
        Записатися онлайн
      </Link>
    </div>
  );
}
