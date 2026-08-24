import type { MetadataRoute } from 'next'

/**
 * Replaces `public/favicon/site.webmanifest`, which was never linked from `layout.tsx`
 * and had blank `name`/`short_name` fields — served, but useless. Icon paths point at
 * `public/favicon/*`, matching where those files actually are (the manifest previously
 * pointed at `/android-chrome-*.png`, which doesn't exist at the site root).
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Revvie - Ride Together, Build Your Tribe',
    short_name: 'Revvie',
    description:
      'A social platform for bikers where you discover clubs through people and participate in organized rides like clan wars.',
    start_url: '/',
    display: 'standalone',
    background_color: '#000000',
    theme_color: '#000000',
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
