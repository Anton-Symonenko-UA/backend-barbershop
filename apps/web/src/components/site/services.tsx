import { ArrowUpRightIcon } from 'lucide-react';
import { Reveal } from '@/components/site/reveal';
import { formatPrice, getServices, groupByCategory } from '@/lib/services';

// Прайс на «холодному папері», як світлі аркуші в референсі
export async function Services() {
  const groups = groupByCategory(await getServices());

  return (
    <section
      id="services"
      aria-labelledby="services-title"
      className="bg-paper text-paper-foreground pt-[calc(6rem+3vw)] pb-24 [clip-path:polygon(0_3vw,100%_0,100%_100%,0_100%)] sm:pb-32"
    >
      <div className="mx-auto max-w-[1440px] px-4 sm:px-8">
        <div className="grid gap-6 lg:grid-cols-12">
          <Reveal className="lg:col-span-5">
            <p className="eyebrow text-paper-muted">Послуги та ціни</p>
            <h2
              id="services-title"
              className="font-heading mt-4 text-[clamp(2.5rem,7vw,5.5rem)] leading-[0.92] font-black uppercase"
            >
              Прайс
            </h2>
          </Reveal>
          <Reveal delay={0.1} className="lg:col-span-5 lg:col-start-8 lg:self-end">
            <p className="text-paper-muted text-pretty">
              Ціна однакова в усіх майстрів. Усе, що входить у послугу, вказано під назвою: без
              доплат на касі.
            </p>
          </Reveal>
        </div>

        <div className="mt-16 grid gap-16 lg:grid-cols-3 lg:gap-10">
          {groups.map(([category, items], gi) => (
            <Reveal key={category} delay={gi * 0.08}>
              <h3 className="eyebrow border-paper-foreground flex items-center justify-between border-b-2 pb-3">
                <span>{category}</span>
                <span className="text-paper-muted tabular-nums">0{gi + 1}</span>
              </h3>
              <ul>
                {items.map((s) => (
                  <li key={s.id} className="border-paper-foreground/15 border-b">
                    <a
                      href={`#booking`}
                      className="group focus-visible:bg-paper-foreground/5 grid grid-cols-[1fr_auto] gap-x-4 gap-y-1 py-5 outline-none"
                    >
                      <span className="font-heading text-lg leading-snug font-semibold">
                        {s.name}
                      </span>
                      <span className="font-heading text-lg font-semibold tabular-nums">
                        {formatPrice(s.priceCents)}
                      </span>
                      {s.description && (
                        <span className="text-paper-muted text-sm text-pretty">
                          {s.description}
                        </span>
                      )}
                      <span className="text-paper-muted flex items-center justify-end gap-1 text-sm tabular-nums">
                        {s.durationMin} хв
                        <ArrowUpRightIcon
                          aria-hidden
                          className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                        />
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
