import type { Metadata, Viewport } from 'next';
import { Manrope, Unbounded } from 'next/font/google';
import { Providers } from '@/components/providers/providers';
import { Analytics } from '@/components/providers/analytics';
import { site } from '@/config/site';
import { SITE_URL } from '@/lib/config';
import './globals.css';

// Обидва шрифти мають кирилицю
const sans = Manrope({ variable: '--font-sans', subsets: ['latin', 'cyrillic'], display: 'swap' });
const heading = Unbounded({
  variable: '--font-heading-family',
  subsets: ['latin', 'cyrillic'],
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: `${site.name} — барбершоп у Києві`, template: `%s · ${site.name}` },
  description: site.description,
  alternates: { canonical: '/' },
  openGraph: { type: 'website', locale: 'uk_UA', siteName: site.name },
  twitter: { card: 'summary_large_image' },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: [{ color: site.themeColor }],
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html
      lang="uk"
      suppressHydrationWarning
      className={`dark ${sans.variable} ${heading.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <Providers>{children}</Providers>
        <Analytics />
      </body>
    </html>
  );
}
