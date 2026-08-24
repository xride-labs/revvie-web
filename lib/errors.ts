import { ApiError } from '@/lib/server/base/types'

/**
 * Centralised mapper for web-portal API errors to user-friendly strings.
 *
 * Mirrors the mobile-side `mapApiError` helper. The portal previously called
 * `errorToast('Failed to save profile')` everywhere, which hid the actual
 * backend reason — saves would silently fail and the user had no idea why.
 * Pass any caught error through this to get a clean string for the toast +
 * a structured `fieldErrors` map for inline form validation.
 */

const FALLBACK = 'Something went wrong. Please try again.'

interface MappedError {
  title: string
  message: string
  /** Per-field validation errors keyed by field name. */
  fieldErrors?: Record<string, string>
  /** Original raw error string (for debug logs / Sentry). */
  raw?: string
}

const KNOWN_PATTERNS: Array<{
  match: RegExp
  title?: string
  message: string
}> = [
  {
    match: /validation failed for body/i,
    message: "Couldn't save this. Please check the values and try again.",
  },
  {
    match: /network error|timeout|ECONNABORTED/i,
    message: "Network's struggling. Check your connection and retry.",
  },
  {
    match: /unauthorized|401/i,
    message: 'Your session expired — sign in again to continue.',
  },
  {
    match: /forbidden|403/i,
    message: "You don't have permission to do this.",
  },
  {
    match: /not found|404/i,
    message: "We couldn't find what you were looking for.",
  },
  {
    match: /already/i,
    title: 'Already exists',
    message: 'That value is already in use.',
  },
  {
    match: /rate limit|too many/i,
    message: 'Slow down a bit — try again in a moment.',
  },
]

export function mapApiError(error: unknown): MappedError {
  let raw: string | undefined
  let fieldErrors: Record<string, string> | undefined

  if (error instanceof ApiError) {
    raw = error.message
    // Backend zod errors come back as `details: { fieldErrors: {...} }`
    const details = error.details as
      { fieldErrors?: Record<string, string[]> } | undefined
    if (details?.fieldErrors) {
      fieldErrors = Object.fromEntries(
        Object.entries(details.fieldErrors).map(([k, v]) => [
          k,
          Array.isArray(v) ? v.join(', ') : String(v),
        ]),
      )
    }
  } else if (error instanceof Error) {
    raw = error.message
  } else if (typeof error === 'string') {
    raw = error
  }

  if (!raw) {
    return { title: 'Hmm…', message: FALLBACK, fieldErrors }
  }

  for (const { match, title, message } of KNOWN_PATTERNS) {
    if (match.test(raw)) {
      return { title: title ?? "Couldn't do that", message, fieldErrors, raw }
    }
  }

  // Server-supplied messages that don't match a known pattern are usually
  // user-readable already (e.g. "Brand name is required"). Surface them
  // verbatim instead of replacing with a generic.
  return { title: 'Hmm…', message: raw, fieldErrors, raw }
}

export function errorMessage(error: unknown): string {
  return mapApiError(error).message
}
