'use client'

import { createAuthClient } from 'better-auth/react'

const apiUrl = process.env.NEXT_PUBLIC_API_URL
if (!apiUrl) {
  throw new Error('NEXT_PUBLIC_API_URL is required')
}

// Normalize URL: strip trailing slash and optional /api suffix, then append /api/auth
const cleanBaseUrl = apiUrl.replace(/\/+$/, '').replace(/\/api\/?$/, '') + '/api/auth'

export const authClient = createAuthClient({
  baseURL: cleanBaseUrl,
})

const frontendBaseUrl = process.env.NEXT_PUBLIC_FRONTEND_URL

export function resolveAuthCallbackURL(path: string): string {
  if (/^https?:\/\//i.test(path)) {
    return path
  }

  if (typeof window !== 'undefined') {
    return new URL(path, window.location.origin).toString()
  }

  if (frontendBaseUrl) {
    return new URL(path, frontendBaseUrl).toString()
  }

  return path
}

/**
 * Better Auth's OAuth callback appends `?error=<code>` (see
 * `oauth2/errors.ts` in the `better-auth` package) when a social sign-in
 * fails server-side. Map the codes we can realistically hit to copy a
 * visitor can act on; anything unrecognized falls back to a generic message.
 */
const AUTH_ERROR_MESSAGES: Record<string, string> = {
  unable_to_link_account:
    'This Google account could not be linked to your existing account. Try signing in with your password or email code instead.',
  email_does_not_match:
    'That Google account uses a different email than the one you started with.',
  account_already_linked_to_different_user:
    'This Google account is already linked to a different Revvie account.',
  email_not_found: 'Google did not share an email address, so we could not sign you in.',
  email_not_verified: 'Please verify your email with Google before signing in.',
}

export function getAuthErrorMessage(code: string): string {
  return AUTH_ERROR_MESSAGES[code] || 'Google sign-in failed. Please try again.'
}

// Export individual methods for convenience
export const { signIn, signUp, signOut, useSession, getSession } = authClient

// Types
export type Session = Awaited<ReturnType<typeof authClient.getSession>>
export type User = NonNullable<Session['data']>['user']
