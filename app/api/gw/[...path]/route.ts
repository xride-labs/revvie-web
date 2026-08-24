import { NextResponse, type NextRequest } from 'next/server'

import { apiBaseUrl, serverEnv } from '@/core/runtime-config/server'

/**
 * Backend-for-frontend proxy.
 *
 * The browser calls `/api/gw/<backend path>` on our own origin; this handler forwards it
 * to the Revvie API server-side. Three things that buys us:
 *
 *  1. The backend origin never appears in client code or network traces.
 *  2. The session cookie is same-origin, so no cross-site cookie rules to fight and no
 *     CORS preflight on every request.
 *  3. There is one server-side chokepoint where auth, rate-limit hints and observability
 *     can be applied.
 *
 * Auth itself is deliberately NOT proxied — better-auth's client needs to set cookies on
 * the shared `.xride-labs.in` parent domain, so `/api/auth/*` keeps talking to the backend
 * directly. See `lib/auth-client.ts`.
 */

// Hop-by-hop headers plus the ones we recompute. Forwarding `host` would break the
// upstream's virtual-host routing and its Better Auth origin check.
const STRIPPED_REQUEST_HEADERS = new Set([
  'host',
  'connection',
  'keep-alive',
  'transfer-encoding',
  'upgrade',
  'proxy-authorization',
  'proxy-authenticate',
  'te',
  'trailer',
  'content-length',
])

const STRIPPED_RESPONSE_HEADERS = new Set([
  'connection',
  'keep-alive',
  'transfer-encoding',
  'upgrade',
  'content-encoding',
  'content-length',
])

function clientIp(request: NextRequest): string | null {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0]?.trim() ?? null
  return request.headers.get('x-real-ip')
}

async function forward(request: NextRequest, segments: string[]): Promise<Response> {
  const { GATEWAY_TIMEOUT_MS } = serverEnv()

  const target = new URL(`${apiBaseUrl()}/${segments.join('/')}`)
  target.search = request.nextUrl.search

  const headers = new Headers()
  for (const [key, value] of request.headers) {
    if (!STRIPPED_REQUEST_HEADERS.has(key.toLowerCase())) headers.set(key, value)
  }

  // The backend rate-limits per IP (120 req/min). Without this every request would look
  // like it came from the Next.js server and one busy user would throttle everyone.
  // NOTE: the backend must set `trust proxy` to account for this extra hop, otherwise it
  // will read the wrong entry out of the chain.
  const ip = clientIp(request)
  if (ip) {
    headers.set('x-forwarded-for', ip)
    headers.set('x-real-ip', ip)
  }
  headers.set('x-forwarded-host', request.nextUrl.host)
  headers.set('x-forwarded-proto', request.nextUrl.protocol.replace(':', ''))

  const hasBody = request.method !== 'GET' && request.method !== 'HEAD'

  let upstream: Response
  try {
    upstream = await fetch(target, {
      method: request.method,
      headers,
      ...(hasBody ? { body: await request.arrayBuffer() } : {}),
      signal: AbortSignal.timeout(GATEWAY_TIMEOUT_MS),
      redirect: 'manual',
      cache: 'no-store',
    })
  } catch (caught) {
    const timedOut = caught instanceof Error && caught.name === 'TimeoutError'
    return NextResponse.json(
      {
        success: false,
        message: timedOut
          ? 'The server took too long to respond. Please try again.'
          : 'Could not reach the server. Please try again.',
        error: { code: timedOut ? 'upstream_timeout' : 'network_error' },
      },
      { status: timedOut ? 504 : 502 },
    )
  }

  const responseHeaders = new Headers()
  for (const [key, value] of upstream.headers) {
    if (!STRIPPED_RESPONSE_HEADERS.has(key.toLowerCase())) responseHeaders.set(key, value)
  }
  // `set-cookie` can legitimately repeat; Headers.set above would collapse it.
  responseHeaders.delete('set-cookie')
  for (const cookie of upstream.headers.getSetCookie()) {
    responseHeaders.append('set-cookie', cookie)
  }

  return new Response(upstream.body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers: responseHeaders,
  })
}

type Context = { params: Promise<{ path: string[] }> }

async function handler(request: NextRequest, context: Context) {
  const { path } = await context.params
  return forward(request, path ?? [])
}

export const GET = handler
export const POST = handler
export const PUT = handler
export const PATCH = handler
export const DELETE = handler
export const HEAD = handler
export const OPTIONS = handler

// Per-user data behind a cookie: never cache, never prerender.
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
