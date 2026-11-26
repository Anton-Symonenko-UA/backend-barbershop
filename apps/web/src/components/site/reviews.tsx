import { StarIcon } from 'lucide-react';
import Link from 'next/link';
import type { PublicReview } from '@barbershop/shared';
import { Reveal } from '@/components/site/reveal';
import { getReviews } from '@/lib/data';

export function Stars({ rating, className = 'size-4' }: { rating: number; className?: string }) {
  return (
    <span className="text-primary inline-flex gap-0.5" role="img" aria-label={`${rating} з 5`}>
      {Array.from({ length: 5 }, (_, i) => (
        <StarIcon
          key={i}
          aria-hidden
          className={`${className} ${i < rating ? 'fill-current' : 'opacity-30'}`}
        />
      ))}
    </span>
  );
}

const dateFmt = new Intl.DateTimeFormat('uk-UA', {
  timeZone: 'Europe/Kyiv',
  month: 'long',
  year: 'numeric',
});

export function ReviewCard({ review }: { review: PublicReview }) {
  return (
    <figure className="border-border flex h-full flex-col gap-5 border-t pt-6">
      <Stars rating={review.rating} />
      <blockquote className="text-lg leading-relaxed text-pretty">«{review.text}»</blockquote>
      <figcaption className="text-muted-foreground mt-auto text-sm">
        <span className="text-foreground font-semibold">{review.authorName}</span>
        {review.barberName && <> · майстер {review.barberName}</>} ·{' '}
        <time dateTime={review.createdAt}>{dateFmt.format(new Date(review.createdAt))}</time>
      </figcaption>
    </figure>
  );
}

export async function Reviews() {
  const { items, average, count } = await getReviews();
  if (items.length === 0) return null;

  return (
    <section id="reviews" aria-labelledby="reviews-title" className="py-24 sm:py-36">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-8">
        <Reveal className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="eyebrow text-primary">Відгуки</p>
            <h2
              id="reviews-title"
              className="font-heading mt-4 text-[clamp(2.5rem,7vw,5.5rem)] leading-[0.92] font-black uppercase"
            >
              Що кажуть <br className="hidden sm:block" />
              гості
            </h2>
          </div>
          {average !== null && (
            <div className="flex items-center gap-4">
              <span className="font-heading text-5xl font-black tabular-nums">
                {average.toLocaleString('uk-UA')}
              </span>
              <span className="grid gap-1">
                <Stars rating={Math.round(average)} />
                <span className="text-muted-foreground text-sm">{count} відгуків на сайті</span>
              </span>
            </div>
          )}
        </Reveal>

        <ul className="mt-16 grid gap-10 md:grid-cols-3">
          {items.slice(0, 3).map((r, i) => (
            <li key={r.id}>
              <Reveal delay={i * 0.08} className="h-full">
                <ReviewCard review={r} />
              </Reveal>
            </li>
          ))}
        </ul>
        <Link
          href="/reviews"
          className="border-foreground/30 hover:border-foreground mt-12 inline-flex border-b pb-1 text-sm transition-colors"
        >
          Усі відгуки й залишити свій
        </Link>
      </div>
    </section>
  );
}
