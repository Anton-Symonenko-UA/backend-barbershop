'use client';

import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react';
import { useLayoutEffect, useRef, useState } from 'react';
import { cn } from 'cn';
import { drawings } from '@/components/site/drawings';
import { approach } from '@/config/site';

type Step = (typeof approach)[number];

const tones = {
  paper: 'bg-paper text-paper-foreground [--panel-muted:var(--paper-muted)]',
  tan: 'bg-tan text-tan-foreground [--panel-muted:var(--tan-muted)]',
} as const;

// Похилі краї панелей, як у редакційних розворотах референсу
const slant = 'lg:[clip-path:polygon(9%_0,100%_0,91%_100%,0_100%)]';

function Panel({ step, className }: { step: Step; className?: string }) {
  const Drawing = drawings[step.drawing];
  return (
    <article
      className={cn(
        'relative flex flex-col justify-between gap-10 px-6 py-12 sm:px-12 lg:h-full lg:w-[58vw] lg:max-w-[920px] lg:shrink-0 lg:px-[6.5vw] lg:py-[6vh]',
        tones[step.tone],
        slant,
        className,
      )}
    >
      <header className="flex items-start justify-between gap-6">
        <div className="min-w-0">
          <p className="eyebrow text-[var(--panel-muted)]">{step.n}</p>
          <h3 className="font-heading mt-3 text-[clamp(2rem,4.6vw,4.5rem)] leading-none font-black uppercase">
            {step.title}
          </h3>
        </div>
        <Drawing className="w-20 shrink-0 text-[var(--panel-muted)] sm:w-36 lg:w-[min(14vw,200px)]" />
      </header>

      <div className="grid gap-8 sm:grid-cols-[1.2fr_1fr] sm:items-end">
        <div>
          <p className="font-heading text-xl leading-snug font-medium text-balance sm:text-2xl">
            {step.lead}
          </p>
          <p className="mt-4 max-w-sm text-pretty text-[var(--panel-muted)]">{step.text}</p>
        </div>
        <dl className="grid grid-cols-2 gap-4 border-t border-current/20 pt-5">
          {step.facts.map((f) => (
            <div key={f.label} className="flex flex-col-reverse gap-1">
              <dt className="text-sm text-[var(--panel-muted)]">{f.label}</dt>
              <dd className="font-heading text-2xl font-bold tabular-nums sm:text-3xl">
                {f.value}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </article>
  );
}

function Intro() {
  return (
    <div className="px-4 pb-12 sm:px-8 lg:flex lg:h-full lg:w-[34vw] lg:shrink-0 lg:flex-col lg:justify-end lg:px-12 lg:pb-[8vh]">
      <p className="eyebrow text-primary">Підхід</p>
      <h2
        id="approach-title"
        className="font-heading mt-4 text-4xl leading-[0.95] font-black uppercase sm:text-6xl"
      >
        Чотири кроки до форми
      </h2>
      <p className="text-muted-foreground mt-6 max-w-sm">
        Кожна стрижка проходить той самий шлях: від аналізу до догляду. Тому результат
        передбачуваний, хто б із майстрів вас не стриг.
      </p>
    </div>
  );
}

export function Approach() {
  const reduce = useReducedMotion();
  const section = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const [distance, setDistance] = useState(0);
  const { scrollYProgress } = useScroll({ target: section, offset: ['start start', 'end end'] });
  const x = useTransform(scrollYProgress, [0.05, 0.95], [0, -distance]);

  // Скільки треба зсунути стрічку панелей, щоб показати останню
  useLayoutEffect(() => {
    const measure = () => {
      if (!track.current) return;
      setDistance(Math.max(0, track.current.scrollWidth - window.innerWidth));
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (track.current) ro.observe(track.current);
    window.addEventListener('resize', measure);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, []);

  return (
    <section
      id="approach"
      ref={section}
      aria-labelledby="approach-title"
      className={cn('relative', !reduce && 'lg:h-[320svh]')}
    >
      {/* Мобільні та reduced motion: панелі одна під одною */}
      <div className={cn('py-24', !reduce && 'lg:hidden')}>
        <Intro />
        <div className="grid gap-px">
          {approach.map((step) => (
            <Panel
              key={step.n}
              step={step}
              className="lg:w-auto lg:max-w-none lg:[clip-path:none]"
            />
          ))}
        </div>
      </div>

      {/* Десктоп: горизонтальна стрічка під час вертикального скролу */}
      {!reduce && (
        <div className="sticky top-0 hidden h-svh items-center overflow-hidden lg:flex">
          <motion.div ref={track} style={{ x }} className="flex h-[78svh] items-stretch pr-[6vw]">
            <Intro />
            {approach.map((step, i) => (
              <Panel key={step.n} step={step} className={i > 0 ? '-ml-[4.5vw]' : ''} />
            ))}
          </motion.div>
        </div>
      )}
    </section>
  );
}
