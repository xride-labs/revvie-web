import { NextResponse, type NextRequest } from 'next/server'

/**
 * Routing-level gate.
 *
 * This is a UX affordance, not a security control. It only checks whether a session
 * cookie is *present* — it cannot verify it, and it knows nothing about roles. Real
 * enforcement happens twice, on the request that reads the data: `requireSession()` /
 * `requireRole()` inside `core/auth/session.ts`, and the backend's own `requireAuth`.
 *
 * Its job is to spare a signed-out visitor a full client render that ends in a redirect.
 */

const PUBLIC_FILE = /\.[^/]+$/

/**
 * Better Auth names the cookie `<prefix>.session_token`, and browsers add `__Secure-` /
 * `__Host-` over HTTPS. Matching on the suffix survives all three without hardcoding a
 * prefix that a backend config change could invalidate.
 */
function hasSessionCookie(request: NextRequest): boolean {
  return request.cookies
    .getAll()
    .some(({ name, value }) => name.endsWith('session_token') && value.length > 0)
}

/** Prefixes that require a signed-in visitor. */
const PROTECTED_PREFIXES = [
  '/home',
  '/clubs',
  '/rides',
  '/marketplace',
  '/business',
  '/profile',
  '/brand',
  '/admin',
]

/** Signed-in visitors have no reason to see these. */
const AUTH_ONLY_PREFIXES = ['/login', '/signup', '/forgot-password', '/reset-password']

function matchesPrefix(pathname: string, prefixes: string[]): boolean {
  return prefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  )
}

function isWebDisabled(): boolean {
  const raw = process.env.WEB_DISABLED ?? process.env.NEXT_PUBLIC_WEB_DISABLED
  const value = raw
    ?.trim()
    .replace(/^['"]|['"]$/g, '')
    .toLowerCase()

  return value === 'true' || value === '1' || value === 'yes' || value === 'on'
}

function isInfrastructurePath(pathname: string): boolean {
  if (pathname.startsWith('/_next')) return true
  if (pathname.startsWith('/api/')) return true
  if (pathname === '/favicon.ico') return true
  if (pathname === '/robots.txt') return true
  if (pathname === '/sitemap.xml') return true
  return PUBLIC_FILE.test(pathname)
}

function isLaunchGateBypassed(pathname: string): boolean {
  if (pathname === '/launch' || pathname.startsWith('/launch/')) return true
  if (pathname === '/login') return true
  if (pathname === '/admin' || pathname.startsWith('/admin/')) return true
  return false
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (isInfrastructurePath(pathname)) return NextResponse.next()

  // ── Launch gate ────────────────────────────────────────────────────────────
  if (isWebDisabled() && !isLaunchGateBypassed(pathname)) {
    const launchUrl = request.nextUrl.clone()
    launchUrl.pathname = '/launch'
    launchUrl.searchParams.set('from', pathname)
    return NextResponse.redirect(launchUrl)
  }

  // ── Session gate ───────────────────────────────────────────────────────────
  const signedIn = hasSessionCookie(request)

  if (!signedIn && matchesPrefix(pathname, PROTECTED_PREFIXES)) {
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = '/login'
    loginUrl.search = ''
    // Preserve the destination so sign-in can return the visitor to where they meant
    // to go, rather than dumping everyone on the feed.
    loginUrl.searchParams.set('next', `${pathname}${request.nextUrl.search}`)
    return NextResponse.redirect(loginUrl)
  }

  if (signedIn && matchesPrefix(pathname, AUTH_ONLY_PREFIXES)) {
    const homeUrl = request.nextUrl.clone()
    homeUrl.pathname = '/home'
    homeUrl.search = ''
    return NextResponse.redirect(homeUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/:path*'],
}
