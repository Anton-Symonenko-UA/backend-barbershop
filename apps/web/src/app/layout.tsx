import type { Metadata, Viewport } from 'next';
import { Manrope, Playfair_Display } from 'next/font/google';
import { Providers } from '@/components/providers/providers';
import './globals.css';

// Обидва шрифти мають кирилицю
const sans = Manrope({ variable: '--font-sans', subsets: ['latin', 'cyrillic'], display: 'swap' });
const heading = Playfair_Display({
  variable: '--font-heading-family',
  subsets: ['latin', 'cyrillic'],
  display: 'swap',
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: 'Барбершоп', template: '%s · Барбершоп' },
  description: 'Чоловічі стрижки, бороди та догляд. Онлайн-запис до майстра.',
  openGraph: { type: 'website', locale: 'uk_UA', siteName: 'Барбершоп' },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' },
  ],
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html
      lang="uk"
      suppressHydrationWarning
      className={`${sans.variable} ${heading.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
