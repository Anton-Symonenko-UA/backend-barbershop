import { Footer } from '@/components/site/footer';
import { Header } from '@/components/site/header';
import { MobileBookingBar } from '@/components/site/mobile-booking-bar';

/** Каркас публічної сторінки: посилання «до вмісту», шапка, підвал, мобільна кнопка запису. */
export function PageShell({
  children,
  bookingBar = true,
}: {
  children: React.ReactNode;
  bookingBar?: boolean;
}) {
  return (
    <>
      <a
        href="#main"
        className="bg-primary text-primary-foreground sr-only z-[60] px-4 py-2 focus:not-sr-only focus:fixed focus:top-2 focus:left-2"
      >
        Перейти до вмісту
      </a>
      <Header />
      <main id="main">{children}</main>
      <Footer />
      {bookingBar && <MobileBookingBar />}
    </>
  );
}

/** Відступ під фіксовану шапку для внутрішніх сторінок */
export function PageContainer({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`mx-auto max-w-[1440px] px-4 pt-28 pb-24 sm:px-8 sm:pt-36 sm:pb-32 ${className}`}
    >
      {children}
    </div>
  );
}
