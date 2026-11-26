import Image from 'next/image';
import { Reveal } from '@/components/site/reveal';
import { team } from '@/config/site';

export function Team() {
  return (
    <section id="team" aria-labelledby="team-title" className="py-24 sm:py-36">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-8">
        <Reveal className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="eyebrow text-primary">Майстри</p>
            <h2
              id="team-title"
              className="font-heading mt-4 text-[clamp(2.5rem,7vw,5.5rem)] leading-[0.92] font-black uppercase"
            >
              Руки, яким <br className="hidden sm:block" />
              довіряють
            </h2>
          </div>
          <p className="text-muted-foreground max-w-sm">
            Троє майстрів, разом понад 27 років досвіду. Кожен щороку проходить навчання в Європі.
          </p>
        </Reveal>

        <ul className="mt-16 grid gap-10 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
          {team.map((m, i) => (
            <li key={m.name} className={i === 1 ? 'lg:mt-16' : undefined}>
              <Reveal delay={i * 0.1} className="group">
                <div className="bg-muted relative aspect-[4/5] overflow-hidden">
                  <Image
                    src={m.src}
                    alt={m.alt}
                    fill
                    sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    className="object-cover grayscale transition-[filter,scale] duration-700 ease-out group-hover:scale-105 group-hover:grayscale-0"
                  />
                  <span className="eyebrow bg-background/80 absolute top-4 left-4 px-2 py-1 backdrop-blur-sm">
                    {m.years} років досвіду
                  </span>
                </div>
                <div className="border-border mt-5 flex items-baseline justify-between gap-4 border-b pb-4">
                  <h3 className="font-heading text-xl font-semibold">{m.name}</h3>
                  <span className="eyebrow text-primary shrink-0">{m.role}</span>
                </div>
                <p className="text-muted-foreground mt-3 text-sm">{m.specialty}</p>
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
