import { About } from '@/components/site/about';
import { Approach } from '@/components/site/approach';
import { Booking } from '@/components/site/booking';
import { Hero } from '@/components/site/hero';
import { JsonLd } from '@/components/site/json-ld';
import { PageShell } from '@/components/site/page-shell';
import { Reviews } from '@/components/site/reviews';
import { Services } from '@/components/site/services';
import { Team } from '@/components/site/team';
import { Walkthrough } from '@/components/site/walkthrough';
import { getReviews } from '@/lib/data';
import { barberShopJsonLd } from '@/lib/json-ld';

export default async function Home() {
  const reviews = await getReviews();
  return (
    <PageShell>
      <Hero />
      <Walkthrough />
      <About />
      <Approach />
      <Services />
      <Team />
      <Reviews />
      <Booking />
      <JsonLd data={barberShopJsonLd(reviews)} />
    </PageShell>
  );
}
