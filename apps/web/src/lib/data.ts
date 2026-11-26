import type { PublicBarber, PublicService, ReviewsSummary } from '@barbershop/shared';
import { cacheLife, cacheTag } from 'next/cache';
import { fallbackServices, team } from '@/config/site';
import { SERVER_API_URL } from '@/lib/config';

// Публічні дані з API. Кешуються на кілька хвилин; якщо API недоступне,
// сайт показує запасний контент із config/site.ts і не падає.

async function getJson<T>(path: string): Promise<T> {
  const res = await fetch(`${SERVER_API_URL}${path}`, { signal: AbortSignal.timeout(3000) });
  if (!res.ok) throw new Error(`API ${res.status}`);
  return (await res.json()) as T;
}

export async function getServices(): Promise<PublicService[]> {
  'use cache';
  cacheLife('minutes');
  cacheTag('services');
  try {
    const data = await getJson<PublicService[]>('/services');
    return data.length > 0 ? data : fallbackServices;
  } catch {
    return fallbackServices;
  }
}

const fallbackBarbers: PublicBarber[] = team.map((m) => ({
  id: m.slug,
  slug: m.slug,
  name: m.name,
  title: m.role,
  bio: null,
  specialty: m.specialty,
  experienceYears: m.years,
  photoUrl: m.src,
  instagram: null,
  serviceIds: [],
}));

export async function getBarbers(): Promise<PublicBarber[]> {
  'use cache';
  cacheLife('minutes');
  cacheTag('barbers');
  try {
    const data = await getJson<PublicBarber[]>('/barbers');
    return data.length > 0 ? data : fallbackBarbers;
  } catch {
    return fallbackBarbers;
  }
}

export async function getReviews(): Promise<ReviewsSummary> {
  'use cache';
  cacheLife('minutes');
  cacheTag('reviews');
  try {
    return await getJson<ReviewsSummary>('/reviews');
  } catch {
    return { average: null, count: 0, items: [] };
  }
}

/** Чи працює онлайн-запис: якщо API лежить, показуємо телефон замість форми. */
export async function isBookingOnline(): Promise<boolean> {
  'use cache';
  cacheLife('seconds');
  try {
    const res = await fetch(`${SERVER_API_URL}/health`, { signal: AbortSignal.timeout(2000) });
    return res.ok;
  } catch {
    return false;
  }
}
