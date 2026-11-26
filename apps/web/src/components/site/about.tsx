import { FloorPlanDrawing } from '@/components/site/drawings';
import { Reveal } from '@/components/site/reveal';
import { site, stats } from '@/config/site';

// «Паспорт об'єкта», як картка THE LANTERN у референсі
export function About() {
  return (
    <section aria-labelledby="about-title" className="relative overflow-hidden py-24 sm:py-36">
      <div className="mx-auto grid max-w-[1440px] gap-16 px-4 sm:px-8 lg:grid-cols-12 lg:gap-8">
        <Reveal className="lg:col-span-5">
          <p className="eyebrow text-primary">
            {site.city} · {site.district} · з {stats[0].value}
          </p>
          <h2
            id="about-title"
            className="font-heading mt-5 text-[clamp(2.5rem,7vw,5.5rem)] leading-[0.92] font-black tracking-tight uppercase"
          >
            {site.nameUa}
          </h2>
          <p className="text-muted-foreground mt-8 max-w-md text-lg text-pretty">
            Барбершоп, у якому немає конвеєра. Ми записуємо з запасом часу, щоб кожна стрижка
            закінчувалась тоді, коли вона ідеальна, а не коли настав наступний клієнт.
          </p>
        </Reveal>

        <div className="lg:col-span-7">
          <Reveal delay={0.1}>
            <figure className="border-border text-muted-foreground border p-5 sm:p-8">
              <figcaption className="eyebrow text-foreground mb-6 flex justify-between">
                <span>План зали</span>
                <span className="text-muted-foreground">М 1:100</span>
              </figcaption>
              <FloorPlanDrawing className="w-full" />
            </figure>
          </Reveal>

          <Reveal delay={0.15}>
            <dl className="bg-border mt-px grid grid-cols-2 gap-px sm:grid-cols-4">
              {stats.map((s) => (
                <div key={s.label} className="bg-background flex flex-col-reverse gap-3 p-5 sm:p-6">
                  <dt className="eyebrow text-muted-foreground">{s.label}</dt>
                  <dd className="font-heading text-3xl font-bold whitespace-nowrap tabular-nums sm:text-[clamp(1.5rem,2.4vw,2.25rem)]">
                    {s.value}
                  </dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
