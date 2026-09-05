'use client'

import { useEffect } from 'react'
import { getAuthErrorMessage } from '@/lib/auth-client'
import { useToast } from '@/hooks/use-toast'

/**
 * Surfaces the `?error=<code>` a Better Auth OAuth callback redirects back
 * with (see `getAuthErrorMessage`) as a toast, then strips it from the URL so
 * a refresh doesn't re-show it.
 *
 * Reads `window.location` directly instead of `useSearchParams()` — this
 * only needs to run once, on the redirect back from Google, and doing it
 * this way keeps the auth pages out of a Suspense boundary.
 */
export function useAuthErrorToast() {
  const { error: errorToast } = useToast()

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const code = params.get('error')
    if (!code) return

    errorToast('Google sign-in failed', { description: getAuthErrorMessage(code) })

    params.delete('error')
    params.delete('error_description')
    const query = params.toString()
    window.history.replaceState(
      null,
      '',
      `${window.location.pathname}${query ? `?${query}` : ''}`,
    )
    // Only ever meant to run once, on the redirect back from the OAuth callback.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
}
