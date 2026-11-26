import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowRightIcon, ClockIcon } from 'lucide-react';
import { cn } from 'cn';
import { JsonLd } from '@/components/site/json-ld';
import { PageContainer, PageShell } from '@/components/site/page-shell';
import { buttonVariants } from '@/components/ui/button';
import { site } from '@/config/site';
import { getBarbers, getServices } from '@/lib/data';
import { formatPrice } from '@/lib/format';
import { breadcrumbsJsonLd, serviceJsonLd } from '@/lib/json-ld';

export async function generateStaticParams() {
  return (await getServices()).map((s) => ({ slug: s.slug }));
}

async function findService(slug: string) {
  return (await getServices()).find((s) => s.slug === slug);
}

export async function generateMetadata({
  params,
}: PageProps<'/services/[slug]'>): Promise<Metadata> {
  const service = await findService((await params).slug);
  if (!service) return {};
  return {
    title: `${service.name} у Києві, ${formatPrice(service.priceCents)}`,
    description: `${service.name} в барбершопі ${site.name} на Подолі: ${service.description ?? ''}. ${service.durationMin} хв, ${formatPrice(service.priceCents)}. Онлайн-запис.`,
    alternates: { canonical: `/services/${service.slug}` },
  };
}

export default async function ServicePage({ params }: PageProps<'/services/[slug]'>) {
  const { slug } = await params;
  const [service, services, barbers] = await Promise.all([
    findService(slug),
    getServices(),
    getBarbers(),
  ]);
  if (!service) notFound();

  const masters = barbers.filter(
    (b) => b.serviceIds.length === 0 || b.serviceIds.includes(service.id),
  );
  const related = services.filter((s) => s.category === service.category && s.id !== service.id);

  return (
    <PageShell>
      <PageContainer>
        <nav aria-label="Хлібні крихти" className="eyebrow text-muted-foreground">
          <Link href="/" className="hover:text-foreground">
            Головна
          </Link>{' '}
          /{' '}
          <Link href="/#services" className="hover:text-foreground">
            Послуги
          </Link>
        </nav>
        <div className="mt-8 grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-7">
            {service.category && <p className="eyebrow text-primary">{service.category}</p>}
            <h1 className="font-heading mt-4 text-[clamp(2rem,8vw,6.5rem)] leading-[0.92] font-black [overflow-wrap:anywhere] hyphens-auto uppercase">
              {service.name}
            </h1>
            {service.description && (
              <p className="text-muted-foreground mt-8 max-w-xl text-lg text-pretty">
                {service.description}.
              </p>
            )}
          </div>
          <div className="bg-paper text-paper-foreground grid content-start gap-6 rounded-2xl p-8 lg:col-span-5">
            <dl className="grid grid-cols-2 gap-6">
              <div>
                <dt className="eyebrow text-paper-muted">Вартість</dt>
                <dd className="font-heading mt-2 text-3xl font-black tabular-nums">
                  {formatPrice(service.priceCents)}
                </dd>
              </div>
              <div>
                <dt className="eyebrow text-paper-muted">Тривалість</dt>
                <dd className="font-heading mt-2 flex items-center gap-2 text-3xl font-black tabular-nums">
                  <ClockIcon aria-hidden className="size-6" />
                  {service.durationMin} хв
                </dd>
              </div>
            </dl>
            <Link
              href={`/booking?service=${service.slug}`}
              className={cn(buttonVariants(), 'h-14 rounded-full text-base font-semibold')}
            >
              Записатися на {service.name.toLowerCase()}
              <ArrowRightIcon aria-hidden className="size-4" />
            </Link>
            <p className="text-paper-muted text-sm">
              Ціна однакова в усіх майстрів. Оплата на місці.
            </p>
          </div>
        </div>

        {masters.length > 0 && (
          <section aria-labelledby="masters" className="mt-24">
            <h2 id="masters" className="eyebrow text-muted-foreground">
              Хто робить
            </h2>
            <ul className="mt-6 grid gap-3 sm:grid-cols-3">
              {masters.map((b) => (
                <li key={b.id}>
                  <Link
                    href={`/booking?service=${service.slug}&barber=${b.slug}`}
                    className="border-border hover:border-primary flex items-center justify-between gap-4 rounded-xl border p-5 transition-colors"
                  >
                    <span>
                      <span className="block font-semibold">{b.name}</span>
                      <span className="text-muted-foreground text-sm">{b.title}</span>
                    </span>
                    <ArrowRightIcon aria-hidden className="size-4" />
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        {related.length > 0 && (
          <section aria-labelledby="related" className="mt-16">
            <h2 id="related" className="eyebrow text-muted-foreground">
              Також у розділі
            </h2>
            <ul className="mt-6 flex flex-wrap gap-3">
              {related.map((s) => (
                <li key={s.id}>
                  <Link
                    href={`/services/${s.slug}`}
                    className="border-border hover:border-foreground/40 inline-flex rounded-full border px-5 py-3 text-sm transition-colors"
                  >
                    {s.name} · {formatPrice(s.priceCents)}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </PageContainer>
      <JsonLd
        data={[
          serviceJsonLd(service),
          breadcrumbsJsonLd([
            { name: 'Головна', path: '/' },
            { name: 'Послуги', path: '/#services' },
            { name: service.name, path: `/services/${service.slug}` },
          ]),
        ]}
      />
    </PageShell>
  );
}
