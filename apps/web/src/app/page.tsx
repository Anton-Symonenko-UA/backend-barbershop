import { About } from '@/components/site/about';
import { Approach } from '@/components/site/approach';
import { Booking } from '@/components/site/booking';
import { Footer } from '@/components/site/footer';
import { Header } from '@/components/site/header';
import { Hero } from '@/components/site/hero';
import { Services } from '@/components/site/services';
import { Team } from '@/components/site/team';
import { Walkthrough } from '@/components/site/walkthrough';
import { images, site } from '@/config/site';

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'BarberShop',
  name: `${site.name} (${site.nameUa})`,
  description: site.description,
  image: images.hero.src,
  telephone: site.phone,
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
};

export default function Home() {
  return (
    <>
      <a
        href="#main"
        className="bg-primary text-primary-foreground sr-only z-[60] px-4 py-2 focus:not-sr-only focus:fixed focus:top-2 focus:left-2"
      >
        Перейти до вмісту
      </a>
      <Header />
      <main id="main">
        <Hero />
        <Walkthrough />
        <About />
        <Approach />
        <Services />
        <Team />
        <Booking />
      </main>
      <Footer />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
      />
    </>
  );
}
