import type { MetadataRoute } from 'next'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://revvie.xride-labs.in'

/**
 * Everything under these prefixes requires a session (enforced server-side in
 * `proxy.ts` and `core/auth/session.ts`) — disallowing them here is a courtesy to
 * well-behaved crawlers, not the access control. It also keeps a search engine from
 * indexing a login wall.
 */
const DISALLOWED = [
  '/admin',
  '/home',
  '/clubs',
  '/rides',
  '/marketplace',
  '/business',
  '/profile',
  '/brand',
  '/api/',
]

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: DISALLOWED,
    },
    sitemap: `${APP_URL}/sitemap.xml`,
  }
}
