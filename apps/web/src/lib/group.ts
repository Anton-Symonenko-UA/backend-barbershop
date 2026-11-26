import type { PublicService } from '@barbershop/shared';

export function groupByCategory(services: PublicService[]) {
  const groups = new Map<string, PublicService[]>();
  for (const s of services) {
    const key = s.category ?? 'Інше';
    groups.set(key, [...(groups.get(key) ?? []), s]);
  }
  return [...groups.entries()];
}
