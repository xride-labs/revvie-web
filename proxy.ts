import { NextResponse, type NextRequest } from 'next/server'
import { resolveHostname } from './core/tenant/resolve-hostname'
import { fetchTenantBySlug } from './core/tenant/resolve-tenant'

/**
 * Routing-level gate & Hostname-based Multi-tenant Proxy.
 *
 * Establishes tenant context from incoming host/subdomain and routes:
 * - Consumer: revvie.app (or revvie.xride-labs.in) -> consumer feeds/pages
 * - Platform Admin: admin.revvie.app -> internal rewrite to /admin
 * - Club Tenant: {slug}.revvie.app -> internal rewrite to /clubs/[id]
 * - Brand Tenant: {slug}.revvie.app -> internal rewrite to /brand/dashboard
 * - Unknown / Suspended: rewrites to /tenant-not-found or /tenant-suspended
 */

const PUBLIC_FILE = /\.[^/]+$/

function hasSessionCookie(request: NextRequest): boolean {
  return request.cookies
    .getAll()
    .some(({ name, value }) => name.endsWith('session_token') && value.length > 0)
}

const PROTECTED_PREFIXES = [
  '/home',
  '/clubs',
  '/rides',
  '/business',
  '/profile',
  '/brand',
]

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

export async function proxy(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl

  if (isInfrastructurePath(pathname)) {
    return NextResponse.next()
  }

  // ── Launch gate ────────────────────────────────────────────────────────────
  if (isWebDisabled() && !isLaunchGateBypassed(pathname)) {
    const launchUrl = request.nextUrl.clone()
    launchUrl.pathname = '/launch'
    launchUrl.searchParams.set('from', pathname)
    return NextResponse.redirect(launchUrl)
  }

  // ── Tenant Resolution via Hostname ─────────────────────────────────────────
  const host =
    request.headers.get('x-forwarded-host') ||
    request.headers.get('host') ||
    request.nextUrl.host

  const resolved = resolveHostname(host)
  const signedIn = hasSessionCookie(request)
  const requestHeaders = new Headers(request.headers)

  // 1. Platform Admin Subdomain (admin.*)
  if (resolved.category === 'PLATFORM') {
    requestHeaders.set('x-tenant-type', 'PLATFORM')
    requestHeaders.set('x-tenant-name', 'Revvie Platform')

    const targetPath =
      pathname === '/'
        ? '/admin'
        : pathname.startsWith('/admin')
          ? pathname
          : `/admin${pathname}`

    // Unauthenticated visitors accessing admin sub-routes go to /admin
    if (!signedIn && targetPath.startsWith('/admin/') && targetPath !== '/admin/login') {
      const adminUrl = request.nextUrl.clone()
      adminUrl.pathname = '/admin'
      adminUrl.search = ''
      return NextResponse.redirect(adminUrl)
    }

    if (targetPath !== pathname) {
      const rewriteUrl = request.nextUrl.clone()
      rewriteUrl.pathname = targetPath
      return NextResponse.rewrite(rewriteUrl, {
        request: { headers: requestHeaders },
      })
    }

    return NextResponse.next({
      request: { headers: requestHeaders },
    })
  }

  // 2. Tenant Subdomain ({slug}.*)
  if (resolved.category === 'TENANT' && resolved.subdomain) {
    const tenant = await fetchTenantBySlug(resolved.subdomain, host)

    if (!tenant) {
      const notFoundUrl = request.nextUrl.clone()
      notFoundUrl.pathname = '/tenant-not-found'
      return NextResponse.rewrite(notFoundUrl)
    }

    if (tenant.status === 'SUSPENDED' || tenant.status === 'ARCHIVED') {
      const suspendedUrl = request.nextUrl.clone()
      suspendedUrl.pathname = '/tenant-suspended'
      return NextResponse.rewrite(suspendedUrl)
    }

    // Inject tenant headers for downstream server components and handlers
    requestHeaders.set('x-tenant-type', tenant.type)
    requestHeaders.set('x-tenant-id', tenant.organizationId)
    requestHeaders.set('x-tenant-slug', tenant.slug)
    requestHeaders.set('x-tenant-name', tenant.name)
    requestHeaders.set('x-tenant-status', tenant.status)
    if (tenant.entityId) {
      requestHeaders.set('x-tenant-entity-id', tenant.entityId)
    }

    let targetPath = pathname

    if (tenant.type === 'CLUB' && tenant.entityId) {
      if (pathname === '/' || pathname === '/dashboard') {
        targetPath = `/clubs/${tenant.entityId}`
      } else if (pathname === '/manage' || pathname === '/members') {
        targetPath = `/clubs/${tenant.entityId}/manage`
      } else if (pathname === '/analytics') {
        targetPath = `/clubs/${tenant.entityId}/analytics`
      }
    } else if (tenant.type === 'BRAND' || tenant.type === 'BUSINESS') {
      if (pathname === '/' || pathname === '/dashboard') {
        targetPath = '/brand/dashboard'
      } else if (
        [
          '/products',
          '/campaigns',
          '/settings',
          '/team',
          '/analytics',
          '/billing',
          '/discounts',
          '/marketplace',
          '/messages',
          '/services',
        ].includes(pathname)
      ) {
        targetPath = `/brand${pathname}`
      }
    }

    // Session gates on tenant subdomain
    if (signedIn && matchesPrefix(pathname, AUTH_ONLY_PREFIXES)) {
      const homeUrl = request.nextUrl.clone()
      homeUrl.pathname = '/'
      homeUrl.search = ''
      return NextResponse.redirect(homeUrl)
    }

    if (
      !signedIn &&
      (matchesPrefix(targetPath, ['/clubs/', '/brand/']) &&
        (targetPath.endsWith('/manage') ||
          targetPath.endsWith('/analytics') ||
          targetPath.startsWith('/brand/')))
    ) {
      const loginUrl = request.nextUrl.clone()
      loginUrl.pathname = '/login'
      loginUrl.search = ''
      loginUrl.searchParams.set('next', `${pathname}${request.nextUrl.search}`)
      return NextResponse.redirect(loginUrl)
    }

    if (targetPath !== pathname) {
      const rewriteUrl = request.nextUrl.clone()
      rewriteUrl.pathname = targetPath
      return NextResponse.rewrite(rewriteUrl, {
        request: { headers: requestHeaders },
      })
    }

    return NextResponse.next({
      request: { headers: requestHeaders },
    })
  }

  // 3. Consumer Root Domain (revvie.app / revvie.xride-labs.in / localhost)
  requestHeaders.set('x-tenant-type', 'CONSUMER')

  // /admin provides its own dedicated auth page when not signed in
  if (pathname === '/admin' || pathname === '/admin/login') {
    return NextResponse.next({
      request: { headers: requestHeaders },
    })
  }

  // Unauthenticated visitors accessing admin sub-routes go to /admin
  if (!signedIn && pathname.startsWith('/admin/')) {
    const adminUrl = request.nextUrl.clone()
    adminUrl.pathname = '/admin'
    adminUrl.search = ''
    return NextResponse.redirect(adminUrl)
  }

  if (!signedIn && matchesPrefix(pathname, PROTECTED_PREFIXES)) {
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = '/login'
    loginUrl.search = ''
    loginUrl.searchParams.set('next', `${pathname}${request.nextUrl.search}`)
    return NextResponse.redirect(loginUrl)
  }

  if (signedIn && matchesPrefix(pathname, AUTH_ONLY_PREFIXES)) {
    const homeUrl = request.nextUrl.clone()
    homeUrl.pathname = '/home'
    homeUrl.search = ''
    return NextResponse.redirect(homeUrl)
  }

  return NextResponse.next({
    request: { headers: requestHeaders },
  })
}

export const config = {
  matcher: ['/:path*'],
}
