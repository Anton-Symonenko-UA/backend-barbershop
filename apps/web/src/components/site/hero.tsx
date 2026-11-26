'use client';

import { ArrowDownIcon } from 'lucide-react';
import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react';
import Image from 'next/image';
import Link from 'next/link';
import { useRef } from 'react';
import { cn } from 'cn';
import { buttonVariants } from '@/components/ui/button';
import { images, site } from '@/config/site';

export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });

  // Камера «наїжджає» на сцену, назва відпливає вгору — як у референсі
  const imageScale = useTransform(scrollYProgress, [0, 1], [1.08, 1.32]);
  const wordY = useTransform(scrollYProgress, [0, 1], ['0%', '-45%']);
  const wordOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.4], [1, 0]);

  return (
    <section
      id="top"
      ref={ref}
      aria-labelledby="hero-title"
      className="relative isolate h-svh min-h-[640px] overflow-hidden"
    >
      <motion.div
        className="absolute inset-0 -z-20"
        style={reduce ? undefined : { scale: imageScale }}
      >
        <Image
          src={images.hero.src}
          alt={images.hero.alt}
          fill
          priority
          sizes="100vw"
          quality={80}
          className="object-cover object-[50%_60%]"
        />
      </motion.div>
      {/* Затемнення: зверху для шапки, знизу для тексту */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[linear-gradient(to_bottom,color-mix(in_oklch,var(--background)_70%,transparent)_0%,transparent_30%,transparent_45%,color-mix(in_oklch,var(--background)_92%,transparent)_100%)]"
      />
      <div aria-hidden className="grain absolute inset-0 -z-10" />

      {/* Величезна назва бренду, розтягнута на всю ширину */}
      <motion.div
        className="absolute inset-x-0 top-[18%] px-3 sm:top-[14%] sm:px-6"
        style={reduce ? undefined : { y: wordY, opacity: wordOpacity }}
      >
        <h1 id="hero-title" className="sr-only">
          {site.name}: {site.tagline}
        </h1>
        <svg
          viewBox="0 0 1000 180"
          aria-hidden
          className="w-full overflow-visible [mask-image:linear-gradient(to_bottom,black_55%,transparent_100%)]"
        >
          <text
            x="0"
            y="160"
            textLength="1000"
            lengthAdjust="spacingAndGlyphs"
            className="fill-foreground font-heading font-black"
            style={{ fontSize: 186 }}
          >
            {site.name}
          </text>
        </svg>
      </motion.div>

      <motion.div
        className="absolute inset-x-0 bottom-0 mx-auto grid max-w-[1440px] gap-8 px-4 pb-10 sm:px-8 sm:pb-14 lg:grid-cols-[1fr_auto] lg:items-end"
        style={reduce ? undefined : { opacity: contentOpacity }}
      >
        <div className="max-w-xl">
          <p className="eyebrow text-primary">{site.tagline}</p>
          <p className="font-heading mt-4 text-2xl leading-tight font-medium text-balance sm:text-4xl">
            Стрижка, після якої хочеться дивитись у дзеркало.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/booking"
              className={cn(buttonVariants(), 'h-12 rounded-full px-7 text-sm font-semibold')}
            >
              Записатися онлайн
            </Link>
            <a
              href="#services"
              className={cn(
                buttonVariants({ variant: 'outline' }),
                'border-foreground/30 dark:border-foreground/30 dark:hover:bg-foreground/10 h-12 rounded-full bg-transparent px-7 text-sm backdrop-blur-sm dark:bg-transparent',
              )}
            >
              Ціни
            </a>
          </div>
        </div>

        <dl className="flex gap-8 text-sm sm:gap-12">
          <div>
            <dt className="eyebrow text-muted-foreground">Район</dt>
            <dd className="mt-2">
              {site.city}, {site.district}
            </dd>
          </div>
          <div>
            <dt className="eyebrow text-muted-foreground">Щодня</dt>
            <dd className="mt-2 tabular-nums">{site.hours[0].time}</dd>
          </div>
          <a
            href="#space"
            className="border-foreground/25 hover:bg-foreground hover:text-background hidden size-12 items-center justify-center self-end rounded-full border transition-colors sm:flex"
            aria-label="Гортати далі"
          >
            <ArrowDownIcon className="size-4" />
          </a>
        </dl>
      </motion.div>
    </section>
  );
}
