import { NextResponse, type NextRequest } from 'next/server'

const PUBLIC_FILE = /\.[^/]+$/

function isWebDisabled(): boolean {
  const raw = process.env.WEB_DISABLED ?? process.env.NEXT_PUBLIC_WEB_DISABLED
  const value = raw
    ?.trim()
    .replace(/^['\"]|['\"]$/g, '')
    .toLowerCase()

  return value === 'true' || value === '1' || value === 'yes' || value === 'on'
}

function isBypassedPath(pathname: string): boolean {
  if (pathname === '/launch' || pathname.startsWith('/launch/')) return true
  if (pathname === '/login') return true
  if (pathname === '/admin' || pathname.startsWith('/admin/')) return true
  if (pathname.startsWith('/api/admin/')) return true

  if (pathname.startsWith('/_next')) return true
  if (pathname === '/favicon.ico') return true
  if (pathname === '/robots.txt') return true
  if (pathname === '/sitemap.xml') return true

  if (PUBLIC_FILE.test(pathname)) return true

  return false
}

export function proxy(request: NextRequest) {
  if (!isWebDisabled()) {
    return NextResponse.next()
  }

  const { pathname } = request.nextUrl
  if (isBypassedPath(pathname)) {
    return NextResponse.next()
  }

  const launchUrl = request.nextUrl.clone()
  launchUrl.pathname = '/launch'
  launchUrl.searchParams.set('from', pathname)

  return NextResponse.redirect(launchUrl)
}

export const config = {
  matcher: ['/:path*'],
}
