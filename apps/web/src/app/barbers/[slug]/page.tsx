import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowRightIcon } from 'lucide-react';
import { cn } from 'cn';
import { JsonLd } from '@/components/site/json-ld';
import { PageContainer, PageShell } from '@/components/site/page-shell';
import { ReviewCard } from '@/components/site/reviews';
import { buttonVariants } from '@/components/ui/button';
import { site } from '@/config/site';
import { getBarbers, getReviews, getServices } from '@/lib/data';
import { formatPrice, pluralYears } from '@/lib/format';
import { barberJsonLd, breadcrumbsJsonLd } from '@/lib/json-ld';

export async function generateStaticParams() {
  return (await getBarbers()).map((b) => ({ slug: b.slug }));
}

async function findBarber(slug: string) {
  return (await getBarbers()).find((b) => b.slug === slug);
}

export async function generateMetadata({
  params,
}: PageProps<'/barbers/[slug]'>): Promise<Metadata> {
  const barber = await findBarber((await params).slug);
  if (!barber) return {};
  return {
    title: `${barber.name}, ${barber.title ?? 'барбер'}`,
    description: `${barber.name} у ${site.name}: ${barber.specialty ?? 'чоловічі стрижки й борода'}. Запишіться онлайн до свого майстра.`,
    alternates: { canonical: `/barbers/${barber.slug}` },
    openGraph: barber.photoUrl ? { images: [{ url: barber.photoUrl }] } : undefined,
  };
}

export default async function BarberPage({ params }: PageProps<'/barbers/[slug]'>) {
  const { slug } = await params;
  const [barber, services, reviews] = await Promise.all([
    findBarber(slug),
    getServices(),
    getReviews(),
  ]);
  if (!barber) notFound();

  const offered = barber.serviceIds.length
    ? services.filter((s) => barber.serviceIds.includes(s.id))
    : services;
  const own = reviews.items.filter((r) => r.barberName === barber.name);

  return (
    <PageShell>
      <PageContainer>
        <nav aria-label="Хлібні крихти" className="eyebrow text-muted-foreground">
          <Link href="/" className="hover:text-foreground">
            Головна
          </Link>{' '}
          /{' '}
          <Link href="/#team" className="hover:text-foreground">
            Майстри
          </Link>
        </nav>
        <div className="mt-8 grid gap-12 lg:grid-cols-12">
          {barber.photoUrl && (
            <div className="bg-muted relative aspect-[4/5] overflow-hidden lg:col-span-5">
              <Image
                src={barber.photoUrl}
                alt={`${barber.name} за роботою`}
                fill
                priority
                sizes="(min-width: 1024px) 40vw, 100vw"
                className="object-cover grayscale"
              />
            </div>
          )}
          <div className="grid content-start gap-8 lg:col-span-6 lg:col-start-7">
            <div>
              {barber.title && <p className="eyebrow text-primary">{barber.title}</p>}
              <h1 className="font-heading mt-4 text-[clamp(2rem,7vw,5.5rem)] leading-[0.92] font-black [overflow-wrap:anywhere] hyphens-auto uppercase">
                {barber.name}
              </h1>
            </div>
            <dl className="grid grid-cols-2 gap-6">
              {barber.experienceYears !== null && (
                <div>
                  <dt className="eyebrow text-muted-foreground">Досвід</dt>
                  <dd className="font-heading mt-2 text-2xl font-semibold">
                    {pluralYears(barber.experienceYears)}
                  </dd>
                </div>
              )}
              {barber.specialty && (
                <div>
                  <dt className="eyebrow text-muted-foreground">Сильні сторони</dt>
                  <dd className="mt-2">{barber.specialty}</dd>
                </div>
              )}
            </dl>
            {barber.bio && (
              <p className="text-muted-foreground text-lg text-pretty">{barber.bio}</p>
            )}
            <Link
              href={`/booking?barber=${barber.slug}`}
              className={cn(
                buttonVariants(),
                'h-14 justify-self-start rounded-full px-8 text-base font-semibold',
              )}
            >
              Записатися до {barber.name.split(' ')[0]}
              <ArrowRightIcon aria-hidden className="size-4" />
            </Link>
            <section aria-labelledby="offered">
              <h2 id="offered" className="eyebrow text-muted-foreground">
                Послуги
              </h2>
              <ul className="mt-4">
                {offered.map((s) => (
                  <li key={s.id} className="border-border border-b">
                    <Link
                      href={`/booking?service=${s.slug}&barber=${barber.slug}`}
                      className="hover:text-primary flex justify-between gap-4 py-4"
                    >
                      <span>{s.name}</span>
                      <span className="tabular-nums">{formatPrice(s.priceCents)}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </div>

        {own.length > 0 && (
          <section aria-labelledby="barber-reviews" className="mt-24">
            <h2 id="barber-reviews" className="eyebrow text-muted-foreground">
              Відгуки про майстра
            </h2>
            <ul className="mt-8 grid gap-10 md:grid-cols-3">
              {own.map((r) => (
                <li key={r.id}>
                  <ReviewCard review={r} />
                </li>
              ))}
            </ul>
          </section>
        )}
      </PageContainer>
      <JsonLd
        data={[
          barberJsonLd(barber),
          breadcrumbsJsonLd([
            { name: 'Головна', path: '/' },
            { name: 'Майстри', path: '/#team' },
            { name: barber.name, path: `/barbers/${barber.slug}` },
          ]),
        ]}
      />
    </PageShell>
  );
}
