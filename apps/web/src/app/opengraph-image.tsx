import { ImageResponse } from 'next/og';
import { ogColors, site } from '@/config/site';

export const alt = `${site.name}, барбершоп у Києві`;
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

// Латиницею: вбудований шрифт генератора не має кирилиці, а тягнути шрифт по мережі під час збірки не хочемо
export default function OpengraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: 72,
        background: ogColors.background,
        color: ogColors.foreground,
        fontFamily: 'sans-serif',
      }}
    >
      <div style={{ fontSize: 28, letterSpacing: 8, color: ogColors.primary }}>
        BARBERSHOP · KYIV · PODIL
      </div>
      <div style={{ fontSize: 220, fontWeight: 900, letterSpacing: -4, lineHeight: 1 }}>
        {site.name}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 32 }}>
        <span>{site.phone}</span>
        <span style={{ color: ogColors.primary }}>Book online →</span>
      </div>
    </div>,
    size,
  );
}
