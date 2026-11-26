import type { PublicBarber, PublicService, ReviewsSummary } from '@barbershop/shared';
import { images, site } from '@/config/site';
import { SITE_URL } from '@/lib/config';

// Структуровані дані schema.org для пошуковиків і AI-відповідей.

export const shopId = `${SITE_URL}/#barbershop`;

export function barberShopJsonLd(reviews?: ReviewsSummary) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BarberShop',
    '@id': shopId,
    name: `${site.name} (${site.nameUa})`,
    description: site.description,
    url: SITE_URL,
    image: images.hero.src,
    telephone: site.phoneHref.replace('tel:', ''),
    address: {
      '@type': 'PostalAddress',
      streetAddress: site.address,
      addressLocality: site.city,
      addressCountry: 'UA',
    },
    geo: { '@type': 'GeoCoordinates', latitude: site.geo.lat, longitude: site.geo.lng },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opens: '09:00',
        closes: '21:00',
      },
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Saturday', 'Sunday'],
        opens: '10:00',
        closes: '20:00',
      },
    ],
    priceRange: '₴₴',
    sameAs: [site.instagram, site.telegram],
    potentialAction: {
      '@type': 'ReserveAction',
      target: { '@type': 'EntryPoint', urlTemplate: `${SITE_URL}/booking` },
    },
    ...(reviews && reviews.average !== null && reviews.count > 0
      ? {
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: reviews.average,
            reviewCount: reviews.count,
            bestRating: 5,
          },
          review: reviews.items.slice(0, 5).map((r) => ({
            '@type': 'Review',
            author: { '@type': 'Person', name: r.authorName },
            datePublished: r.createdAt.slice(0, 10),
            reviewBody: r.text,
            reviewRating: { '@type': 'Rating', ratingValue: r.rating, bestRating: 5 },
          })),
        }
      : {}),
  };
}

export function serviceJsonLd(s: PublicService) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: s.name,
    description: s.description ?? undefined,
    url: `${SITE_URL}/services/${s.slug}`,
    serviceType: s.category ?? undefined,
    provider: { '@id': shopId },
    areaServed: { '@type': 'City', name: site.city },
    offers: {
      '@type': 'Offer',
      price: (s.priceCents / 100).toFixed(0),
      priceCurrency: 'UAH',
      url: `${SITE_URL}/booking?service=${s.slug}`,
    },
  };
}

export function barberJsonLd(b: PublicBarber) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: b.name,
    jobTitle: b.title ?? 'Барбер',
    description: b.bio ?? b.specialty ?? undefined,
    image: b.photoUrl ?? undefined,
    url: `${SITE_URL}/barbers/${b.slug}`,
    worksFor: { '@id': shopId },
    sameAs: b.instagram ? [b.instagram] : undefined,
  };
}

export function breadcrumbsJsonLd(items: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.name,
      item: `${SITE_URL}${it.path}`,
    })),
  };
}
