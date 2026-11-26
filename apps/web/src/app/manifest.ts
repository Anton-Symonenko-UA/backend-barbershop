import type { MetadataRoute } from 'next';
import { site } from '@/config/site';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${site.name} — барбершоп`,
    short_name: site.name,
    description: site.description,
    start_url: '/',
    display: 'standalone',
    lang: 'uk',
    background_color: site.themeColor,
    theme_color: site.themeColor,
    icons: [{ src: '/favicon.ico', sizes: 'any', type: 'image/x-icon' }],
  };
}
