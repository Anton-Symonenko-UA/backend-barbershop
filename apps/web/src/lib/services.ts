import type { PublicService } from '@barbershop/shared';
import { cacheLife } from 'next/cache';
import { fallbackServices } from '@/config/site';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api';

// Прайс з API. Кешується на кілька хвилин; якщо API недоступне, показуємо запасний.
export async function getServices(): Promise<PublicService[]> {
  'use cache';
  cacheLife('minutes');

  try {
    const res = await fetch(`${API_URL}/services`, { signal: AbortSignal.timeout(3000) });
    if (!res.ok) throw new Error(`API ${res.status}`);
    const data = (await res.json()) as PublicService[];
    return data.length > 0 ? data : fallbackServices;
  } catch {
    return fallbackServices;
  }
}

const uah = new Intl.NumberFormat('uk-UA', { maximumFractionDigits: 0 });

export const formatPrice = (cents: number) => `${uah.format(cents / 100)} ₴`;

export function groupByCategory(services: PublicService[]) {
  const groups = new Map<string, PublicService[]>();
  for (const s of services) {
    const key = s.category ?? 'Інше';
    groups.set(key, [...(groups.get(key) ?? []), s]);
  }
  return [...groups.entries()];
}
