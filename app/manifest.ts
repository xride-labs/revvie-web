import type { MetadataRoute } from 'next'

/**
 * Replaces `public/favicon/site.webmanifest`, which was never linked from `layout.tsx`
 * and had blank `name`/`short_name` fields — served, but useless. Icon paths point at
 * `public/favicon/*`, matching where those files actually are (the manifest previously
 * pointed at `/android-chrome-*.png`, which doesn't exist at the site root).
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Revvie — Ride. Track. Connect.',
    short_name: 'Revvie',
    description:
      'The social platform built for motorcycle riders — clubs, organized rides, live GPS tracking, events, and a rider-only marketplace.',
    start_url: '/',
    display: 'standalone',
    background_color: '#0d0d0f',
    theme_color: '#0d0d0f',
    icons: [
      {
        src: '/favicon/android-chrome-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/favicon/android-chrome-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  }
}
