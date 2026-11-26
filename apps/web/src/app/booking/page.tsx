import type { Metadata } from 'next';
import { Suspense } from 'react';
import { PhoneIcon } from 'lucide-react';
import { cn } from 'cn';
import { BookingWizard } from '@/components/booking/booking-wizard';
import { PageContainer, PageShell } from '@/components/site/page-shell';
import { buttonVariants } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { site } from '@/config/site';
import { getBarbers, getServices, isBookingOnline } from '@/lib/data';

export const metadata: Metadata = {
  title: 'Онлайн-запис',
  description: `Оберіть послугу, майстра й вільний час у ${site.name}. Запис за хвилину, без дзвінків.`,
  alternates: { canonical: '/booking' },
};

export default function BookingPage() {
  return (
    <PageShell bookingBar={false}>
      <PageContainer>
        <p className="eyebrow text-primary">Онлайн-запис</p>
        <h1 className="font-heading mt-4 text-[clamp(2.75rem,10vw,8rem)] leading-[0.9] font-black uppercase">
          Ваш час
        </h1>
        <p className="text-muted-foreground mt-6 max-w-lg text-pretty">
          Чотири кроки, хвилина часу. Підтвердження й посилання для зміни запису прийдуть у SMS.
        </p>
        <div className="mt-16">
          <Suspense fallback={<WizardSkeleton />}>
            <Wizard />
          </Suspense>
        </div>
      </PageContainer>
    </PageShell>
  );
}

async function Wizard() {
  const [services, barbers, online] = await Promise.all([
    getServices(),
    getBarbers(),
    isBookingOnline(),
  ]);
  if (!online) {
    return (
      <div
        className="bg-tan text-tan-foreground grid max-w-2xl gap-6 rounded-2xl p-8"
        role="status"
      >
        <p className="font-heading text-2xl font-semibold">Онлайн-запис тимчасово недоступний</p>
        <p>Ми вже лагодимо. Запишіться, будь ласка, телефоном: відповідаємо одразу.</p>
        <a
          href={site.phoneHref}
          className={cn(
            buttonVariants(),
            'bg-tan-foreground text-tan hover:bg-tan-foreground/85 h-14 justify-self-start rounded-full px-7 text-base',
          )}
        >
          <PhoneIcon aria-hidden className="size-4" />
          {site.phone}
        </a>
      </div>
    );
  }
  return <BookingWizard services={services} barbers={barbers} />;
}

function WizardSkeleton() {
  return (
    <div className="grid gap-4 lg:grid-cols-12" aria-busy="true">
      <span className="sr-only">Завантажуємо форму запису…</span>
      <div className="grid gap-3 lg:col-span-8">
        {Array.from({ length: 6 }, (_, i) => (
          <Skeleton key={i} className="h-20 rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-80 rounded-2xl lg:col-span-4" />
    </div>
  );
}
