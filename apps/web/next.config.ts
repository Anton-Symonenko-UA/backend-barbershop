import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  images: {
    // Фото з Unsplash (Unsplash License, дозволено комерційне використання)
    remotePatterns: [new URL('https://images.unsplash.com/photo-**')],
    formats: ['image/avif', 'image/webp'],
  },
  turbopack: {
    rules: {
      '*.css': {
        loaders: ['@tailwindcss/turbopack'],
        as: '*.css',
      },
    },
  },
};

export default nextConfig;
