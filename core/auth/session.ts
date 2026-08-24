import 'server-only'

import { cache } from 'react'
import { cookies } from 'next/headers'
import { z } from 'zod'

import { gateway } from '@/core/http/gateway'
import { GatewayError } from '@/core/http/errors'
import { hasAnyRole, type Role } from './roles'

/**
 * Server-side session, and the authorization boundary for everything below `app/`.
 *
 * `proxy.ts` is a routing convenience and the client `<AdminLayout>` guard is a UX
 * affordance — neither is a security control. Every server data-access function starts
 * with `requireSession()` or `requireRole()` so that access is re-checked on the request
 * that actually reads the data.
 */

export const sessionUserSchema = z.object({
  id: z.string(),
  email: z.string().nullable().default(null),
  name: z.string().nullable().default(null),
  image: z.string().nullable().default(null),
  phone: z.string().nullable().default(null),
  roles: z.array(z.string()).default([]),
})

export const serverSessionSchema = z.object({
  user: sessionUserSchema,
  session: z.object({
    id: z.string(),
    token: z.string(),
    expiresAt: z.union([z.string(), z.date()]).transform(String),
  }),
})

export type SessionUser = z.infer<typeof sessionUserSchema>
export type ServerSession = z.infer<typeof serverSessionSchema>

/** The cookie header for the current request, for forwarding upstream. */
export async function forwardedCookieHeader(): Promise<string> {
  const store = await cookies()
  return store
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join('; ')
}

/**
 * `React.cache` dedupes this per request: a layout, three nested Server Components and a
 * Server Action all asking for the session cost one upstream call, not five.
 */
export const getSession = cache(async (): Promise<ServerSession | null> => {
  const cookie = await forwardedCookieHeader()
  if (!cookie) return null

  try {
    return await gateway.get({
      path: '/account/session',
      cookie,
      schema: serverSessionSchema,
    })
  } catch (error) {
    // 401 is the ordinary "not signed in" answer, not a failure worth surfacing.
    if (error instanceof GatewayError && (error.status === 401 || error.status === 403)) {
      return null
    }
    throw error
  }
})

export class UnauthenticatedError extends Error {
  constructor() {
    super('Authentication required')
    this.name = 'UnauthenticatedError'
  }
}

export class ForbiddenError extends Error {
  constructor(message = 'You do not have access to this resource') {
    super(message)
    this.name = 'ForbiddenError'
  }
}

/** Throws when there is no session. Use at the top of any authenticated DAL function. */
export async function requireSession(): Promise<ServerSession> {
  const session = await getSession()
  if (!session) throw new UnauthenticatedError()
  return session
}

/** Throws unless the session carries at least one of `roles`. */
export async function requireRole(...roles: Role[]): Promise<ServerSession> {
  const session = await requireSession()
  if (!hasAnyRole(session.user.roles, ...roles)) throw new ForbiddenError()
  return session
}

/**
 * Session plus the cookie header, which is what a DAL function actually needs to make an
 * authenticated upstream call. One await instead of two.
 */
export async function authorize(...roles: Role[]): Promise<{
  session: ServerSession
  cookie: string
}> {
  const session = roles.length > 0 ? await requireRole(...roles) : await requireSession()
  return { session, cookie: await forwardedCookieHeader() }
}
