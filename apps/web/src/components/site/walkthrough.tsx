'use client';

import {
  type MotionValue,
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
} from 'motion/react';
import Image from 'next/image';
import { useRef, useState } from 'react';
import { cn } from 'cn';
import { walkthrough } from '@/config/site';

type Scene = (typeof walkthrough)[number];
const count = walkthrough.length;

function SceneLayer({
  scene,
  index,
  progress,
}: {
  scene: Scene;
  index: number;
  progress: MotionValue<number>;
}) {
  const start = index / count;
  const end = (index + 1) / count;
  const half = 0.18 / count;

  // Кожен наступний кадр проявляється поверх попереднього рівно на межі сцен
  // (там, де змінюється підпис), а далі повільно «наїжджає» камера.
  // Відрізки мають лежати в межах 0..1, інакше браузерні анімації їх відхиляють
  const fadeFrom = Math.max(0, start - half);
  const fadeTo = Math.min(1, start + half);
  const opacity = useTransform(progress, [fadeFrom, fadeTo], index === 0 ? [1, 1] : [0, 1]);
  const scale = useTransform(progress, [fadeFrom, Math.min(1, end + half)], [1.18, 1]);

  return (
    <motion.div className="absolute inset-0" style={{ opacity, scale }}>
      <Image
        src={scene.src}
        alt={scene.alt}
        fill
        sizes="100vw"
        quality={75}
        className="object-cover"
      />
    </motion.div>
  );
}

function Caption({ scene, index }: { scene: Scene; index: number }) {
  return (
    <div className="max-w-2xl">
      <p className="eyebrow text-primary">
        {String(index + 1).padStart(2, '0')} / {String(count).padStart(2, '0')}
      </p>
      <h3 className="font-heading mt-4 text-[clamp(2.75rem,9vw,7.5rem)] leading-[0.9] font-black tracking-tight uppercase">
        {scene.label}
      </h3>
      <p className="text-foreground/85 mt-5 max-w-md text-lg text-pretty">
        <span className="text-foreground font-semibold">{scene.title}.</span> {scene.text}
      </p>
    </div>
  );
}

export function Walkthrough() {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const [active, setActive] = useState(0);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] });

  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    const next = Math.min(count - 1, Math.max(0, Math.floor(v * count)));
    setActive((prev) => (prev === next ? prev : next));
  });

  const heading = (
    <div className="mx-auto max-w-[1440px] px-4 sm:px-8">
      <p className="eyebrow text-muted-foreground">Простір</p>
      <h2
        id="space-title"
        className="font-heading mt-3 max-w-3xl text-3xl leading-tight font-semibold sm:text-5xl"
      >
        Пройдіться барбершопом, поки гортаєте
      </h2>
    </div>
  );

  // Без анімацій: звичайна послідовність кадрів
  if (reduce) {
    return (
      <section id="space" aria-labelledby="space-title" className="py-24">
        {heading}
        <ol className="mx-auto mt-12 grid max-w-[1440px] gap-16 px-4 sm:px-8">
          {walkthrough.map((scene, i) => (
            <li key={scene.label} className="grid gap-6">
              <div className="relative aspect-[16/9] overflow-hidden">
                <Image
                  src={scene.src}
                  alt={scene.alt}
                  fill
                  sizes="100vw"
                  className="object-cover"
                />
              </div>
              <Caption scene={scene} index={i} />
            </li>
          ))}
        </ol>
      </section>
    );
  }

  return (
    <section id="space" aria-labelledby="space-title" className="pt-24">
      {heading}
      <div ref={ref} className="relative mt-12" style={{ height: `${count * 110}svh` }}>
        <div className="sticky top-0 h-svh overflow-hidden">
          {walkthrough.map((scene, i) => (
            <SceneLayer key={scene.label} scene={scene} index={i} progress={scrollYProgress} />
          ))}
          <div
            aria-hidden
            className="absolute inset-0 bg-[linear-gradient(to_top,color-mix(in_oklch,var(--background)_88%,transparent)_0%,transparent_55%),linear-gradient(to_right,color-mix(in_oklch,var(--background)_55%,transparent)_0%,transparent_50%),linear-gradient(to_left,color-mix(in_oklch,var(--background)_60%,transparent)_0%,transparent_28%)]"
          />
          <div aria-hidden className="grain absolute inset-0" />

          {/* Покажчик розділів збоку, як навігація по кімнатах */}
          <ol
            className="absolute top-1/2 right-4 hidden -translate-y-1/2 flex-col gap-3 sm:right-8 md:flex"
            aria-hidden
          >
            {walkthrough.map((scene, i) => (
              <li
                key={scene.label}
                className={cn(
                  'eyebrow flex items-center justify-end gap-3 transition-all duration-500',
                  i === active ? 'text-foreground' : 'text-foreground/40',
                )}
              >
                {scene.label}
                <span
                  className={cn(
                    'h-px bg-current transition-all duration-500',
                    i === active ? 'w-10' : 'w-4',
                  )}
                />
              </li>
            ))}
          </ol>

          <div className="absolute inset-x-0 bottom-0 mx-auto max-w-[1440px] px-4 pb-12 sm:px-8 sm:pb-16">
            <div aria-live="polite">
              <motion.div
                key={active}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              >
                <Caption scene={walkthrough[active]} index={active} />
              </motion.div>
            </div>
            <div className="bg-foreground/15 mt-10 h-px w-full">
              <motion.div
                className="bg-primary h-px origin-left"
                style={{ scaleX: scrollYProgress }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
