import type { Metadata } from 'next';
import { JsonLd } from '@/components/site/json-ld';
import { PageContainer, PageShell } from '@/components/site/page-shell';
import { ReviewForm } from '@/components/site/review-form';
import { ReviewCard, Stars } from '@/components/site/reviews';
import { site } from '@/config/site';
import { getBarbers, getReviews } from '@/lib/data';
import { barberShopJsonLd } from '@/lib/json-ld';

export const metadata: Metadata = {
  title: 'Відгуки',
  description: `Відгуки гостей барбершопу ${site.name} на Подолі. Поділіться враженнями після візиту.`,
  alternates: { canonical: '/reviews' },
};

export default async function ReviewsPage() {
  const [reviews, barbers] = await Promise.all([getReviews(), getBarbers()]);
  return (
    <PageShell>
      <PageContainer>
        <p className="eyebrow text-primary">Відгуки</p>
        <h1 className="font-heading mt-4 text-[clamp(2.75rem,10vw,8rem)] leading-[0.9] font-black uppercase">
          Слово гостям
        </h1>
        {reviews.average !== null && (
          <p className="mt-8 flex items-center gap-3">
            <Stars rating={Math.round(reviews.average)} className="size-5" />
            <span className="tabular-nums">
              {reviews.average.toLocaleString('uk-UA')} з 5, {reviews.count} відгуків
            </span>
          </p>
        )}
        <div className="mt-16 grid gap-16 lg:grid-cols-12">
          <ul className="grid gap-10 lg:col-span-7">
            {reviews.items.map((r) => (
              <li key={r.id}>
                <ReviewCard review={r} />
              </li>
            ))}
            {reviews.items.length === 0 && (
              <li className="text-muted-foreground">Поки що відгуків немає. Станьте першим!</li>
            )}
          </ul>
          <section aria-labelledby="leave-review" className="lg:col-span-5">
            <h2 id="leave-review" className="font-heading mb-6 text-2xl font-semibold">
              Залишити відгук
            </h2>
            <ReviewForm barbers={barbers} />
          </section>
        </div>
      </PageContainer>
      <JsonLd data={barberShopJsonLd(reviews)} />
    </PageShell>
  );
}
