import type { Metadata } from 'next';
import { Suspense } from 'react';
import { ManageBooking } from '@/components/booking/manage-booking';
import { PageContainer, PageShell } from '@/components/site/page-shell';
import { Skeleton } from '@/components/ui/skeleton';

// Особиста сторінка за секретним посиланням: не індексуємо і не передаємо токен у Referer
export const metadata: Metadata = {
  title: 'Ваш запис',
  robots: { index: false, follow: false },
  referrer: 'no-referrer',
};

export default function ManageBookingPage({ params, searchParams }: PageProps<'/booking/[token]'>) {
  return (
    <PageShell bookingBar={false}>
      <PageContainer className="max-w-4xl">
        <Suspense fallback={<Skeleton className="h-96 rounded-2xl" />}>
          <Content params={params} searchParams={searchParams} />
        </Suspense>
      </PageContainer>
    </PageShell>
  );
}

async function Content({
  params,
  searchParams,
}: Pick<PageProps<'/booking/[token]'>, 'params' | 'searchParams'>) {
  const [{ token }, query] = await Promise.all([params, searchParams]);
  return <ManageBooking token={token} isNew={query.new === '1'} />;
}
