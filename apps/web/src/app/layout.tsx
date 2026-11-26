import type { Metadata, Viewport } from 'next';
import { Manrope, Unbounded } from 'next/font/google';
import { Providers } from '@/components/providers/providers';
import { site } from '@/config/site';
import './globals.css';

// Обидва шрифти мають кирилицю
const sans = Manrope({ variable: '--font-sans', subsets: ['latin', 'cyrillic'], display: 'swap' });
const heading = Unbounded({
  variable: '--font-heading-family',
  subsets: ['latin', 'cyrillic'],
  display: 'swap',
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: `${site.name} — барбершоп у Києві`, template: `%s · ${site.name}` },
  description: site.description,
  openGraph: { type: 'website', locale: 'uk_UA', siteName: site.name },
};

export const viewport: Viewport = {
  themeColor: [{ color: '#14110f' }],
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
      </body>
    </html>
  );
}
