import 'server-only'

import type { z } from 'zod'

import { apiBaseUrl, serverEnv } from '@/core/runtime-config/server'
import { envelopeSchema, friendlyMessage, GatewayError, toFieldErrors } from './errors'

/**
 * Server-side transport to the Revvie backend.
 *
 * Only Server Components, Server Actions and route handlers reach this. Browser code goes
 * through `/api/gw`, which lands in this module too — so the backend origin, the cookie
 * forwarding rules and the envelope unwrapping exist exactly once.
 */

export type QueryValue = string | number | boolean | null | undefined

export interface GatewayRequest<TSchema extends z.ZodType | undefined = undefined> {
  path: string
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  query?: Record<string, QueryValue>
  body?: unknown
  /** Cookie header to forward upstream. Callers get it from `cookies()`. */
  cookie?: string
  /** Extra headers — used by the BFF to pass the caller's IP through. */
  headers?: Record<string, string>
  signal?: AbortSignal
  /** Validates and narrows `data`. Omit to get `unknown` back. */
  schema?: TSchema
  /** Next fetch cache options. Defaults to no-store: this data is per-user. */
  cache?: RequestCache
  next?: { revalidate?: number | false; tags?: string[] }
}

function buildUrl(path: string, query?: Record<string, QueryValue>): string {
  const url = new URL(`${apiBaseUrl()}/${path.replace(/^\/+/, '')}`)

  for (const [key, value] of Object.entries(query ?? {})) {
    if (value === undefined || value === null || value === '') continue
    url.searchParams.set(key, String(value))
  }

  return url.toString()
}

export async function gatewayRequest<TSchema extends z.ZodType | undefined = undefined>(
  request: GatewayRequest<TSchema>,
): Promise<TSchema extends z.ZodType ? z.infer<TSchema> : unknown> {
  const { GATEWAY_TIMEOUT_MS } = serverEnv()

  // AbortSignal.any lets a caller-supplied signal and the timeout both cancel the request;
  // without it a slow upstream would pin a Node socket for the full default timeout.
  const timeout = AbortSignal.timeout(GATEWAY_TIMEOUT_MS)
  const signal = request.signal ? AbortSignal.any([request.signal, timeout]) : timeout

  let response: Response
  try {
    response = await fetch(buildUrl(request.path, request.query), {
      method: request.method ?? 'GET',
      headers: {
        Accept: 'application/json',
        ...(request.body !== undefined ? { 'Content-Type': 'application/json' } : {}),
        ...(request.cookie ? { cookie: request.cookie } : {}),
        ...request.headers,
      },
      ...(request.body !== undefined ? { body: JSON.stringify(request.body) } : {}),
      signal,
      cache: request.cache ?? 'no-store',
      ...(request.next ? { next: request.next } : {}),
    })
  } catch (caught) {
    const aborted = caught instanceof Error && caught.name === 'TimeoutError'
    throw new GatewayError({
      status: aborted ? 504 : 502,
      code: aborted ? 'upstream_timeout' : 'network_error',
      message: friendlyMessage(aborted ? 504 : 502),
    })
  }

  const text = await response.text()
  let payload: unknown = undefined
  if (text) {
    try {
      payload = JSON.parse(text)
    } catch {
      // Non-JSON from upstream (an HTML error page from a proxy, usually).
      throw new GatewayError({
        status: response.status || 502,
        code: 'invalid_response',
        message: friendlyMessage(response.status || 502),
      })
    }
  }

  const envelope = envelopeSchema.safeParse(payload)

  if (!response.ok || (envelope.success && !envelope.data.success)) {
    const body = envelope.success ? envelope.data : undefined
    throw new GatewayError({
      status: response.status,
      code: body?.error?.code ?? 'request_failed',
      message: friendlyMessage(response.status, body?.message),
      fieldErrors: toFieldErrors(body?.error?.details),
    })
  }

  if (!envelope.success) {
    throw new GatewayError({
      status: 502,
      code: 'invalid_response',
      message: friendlyMessage(502),
    })
  }

  const data = envelope.data.data

  if (!request.schema) {
    return data as never
  }

  const parsed = request.schema.safeParse(data)
  if (!parsed.success) {
    // A contract drift, not a user error — surface it loudly in logs but keep the
    // user-facing message generic.
    console.error('[gateway] response failed validation', {
      path: request.path,
      issues: parsed.error.issues.slice(0, 5),
    })
    throw new GatewayError({
      status: 502,
      code: 'contract_mismatch',
      message: friendlyMessage(502),
    })
  }

  return parsed.data as never
}

export const gateway = {
  get: <TSchema extends z.ZodType | undefined = undefined>(
    request: Omit<GatewayRequest<TSchema>, 'method'>,
  ) => gatewayRequest({ ...request, method: 'GET' as const }),

  post: <TSchema extends z.ZodType | undefined = undefined>(
    request: Omit<GatewayRequest<TSchema>, 'method'>,
  ) => gatewayRequest({ ...request, method: 'POST' as const }),

  put: <TSchema extends z.ZodType | undefined = undefined>(
    request: Omit<GatewayRequest<TSchema>, 'method'>,
  ) => gatewayRequest({ ...request, method: 'PUT' as const }),

  patch: <TSchema extends z.ZodType | undefined = undefined>(
    request: Omit<GatewayRequest<TSchema>, 'method'>,
  ) => gatewayRequest({ ...request, method: 'PATCH' as const }),

  delete: <TSchema extends z.ZodType | undefined = undefined>(
    request: Omit<GatewayRequest<TSchema>, 'method'>,
  ) => gatewayRequest({ ...request, method: 'DELETE' as const }),
}
