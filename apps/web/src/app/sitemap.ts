import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/config';
import { getBarbers, getServices } from '@/lib/data';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [services, barbers] = await Promise.all([getServices(), getBarbers()]);
  return [
    { url: SITE_URL, changeFrequency: 'weekly', priority: 1 },
    { url: `${SITE_URL}/booking`, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${SITE_URL}/reviews`, changeFrequency: 'weekly', priority: 0.6 },
    ...services.map((s) => ({
      url: `${SITE_URL}/services/${s.slug}`,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    })),
    ...barbers.map((b) => ({
      url: `${SITE_URL}/barbers/${b.slug}`,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
  ];
}
