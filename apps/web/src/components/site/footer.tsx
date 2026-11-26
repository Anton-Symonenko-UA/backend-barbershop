import { ArrowUpRightIcon } from 'lucide-react';
import { nav, site } from '@/config/site';

export function Footer() {
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${site.geo.lat},${site.geo.lng}`;

  return (
    <footer
      id="contacts"
      aria-labelledby="contacts-title"
      className="overflow-hidden pt-24 sm:pt-32"
    >
      <div className="mx-auto grid max-w-[1440px] gap-12 px-4 sm:px-8 md:grid-cols-2 lg:grid-cols-4">
        <div className="lg:col-span-2">
          <h2 id="contacts-title" className="eyebrow text-primary">
            Контакти
          </h2>
          <address className="font-heading mt-5 text-3xl leading-tight font-semibold not-italic sm:text-4xl">
            {site.city}, {site.address}
          </address>
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="border-foreground/30 hover:border-foreground mt-6 inline-flex items-center gap-2 border-b pb-1 text-sm transition-colors"
          >
            Відкрити на мапі
            <ArrowUpRightIcon aria-hidden className="size-4" />
          </a>
        </div>

        <div>
          <p className="eyebrow text-muted-foreground">Зв’язок</p>
          <ul className="mt-5 grid gap-2">
            <li>
              <a href={site.phoneHref} className="hover:text-primary tabular-nums">
                {site.phone}
              </a>
            </li>
            <li>
              <a
                href={site.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary"
              >
                Instagram
              </a>
            </li>
            <li>
              <a
                href={site.telegram}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary"
              >
                Telegram
              </a>
            </li>
          </ul>
        </div>

        <nav aria-label="Навігація в підвалі">
          <p className="eyebrow text-muted-foreground">Розділи</p>
          <ul className="mt-5 grid gap-2">
            {nav.map((item) => (
              <li key={item.href}>
                <a href={item.href} className="hover:text-primary">
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {/* Велика назва внизу, обрізана краєм екрана */}
      <svg
        viewBox="0 0 1000 150"
        aria-hidden
        className="text-foreground/[0.07] mt-20 -mb-[1.5%] w-full"
      >
        <text
          x="0"
          y="150"
          textLength="1000"
          lengthAdjust="spacingAndGlyphs"
          className="font-heading fill-current font-black"
          style={{ fontSize: 186 }}
        >
          {site.name}
        </text>
      </svg>

      <div className="border-border border-t">
        <div className="text-muted-foreground mx-auto flex max-w-[1440px] flex-wrap justify-between gap-4 px-4 py-6 text-xs sm:px-8">
          <p>
            © {site.name} · {site.nameUa}
          </p>
          <p>Фото: Unsplash</p>
        </div>
      </div>
    </footer>
  );
}
