import { ApiError } from '@/lib/server/base/types'
import type { ApiErrorCode } from '@/types'
import axios from 'axios'

/**
 * Centralised mapper for web-portal API errors to user-friendly strings.
 *
 * Provides:
 * 1. Clean human messages based on backend `ApiErrorCode`
 * 2. Structured field errors for forms (`fieldErrors`)
 * 3. Fallbacks that never swallow real server error messages
 */

const FALLBACK_MESSAGE = 'Something went wrong. Please try again.'

export interface MappedError {
  title: string
  message: string
  /** Structured error code matching ApiErrorCode. */
  code?: ApiErrorCode | string
  /** HTTP status code if available. */
  status?: number
  /** Per-field validation errors keyed by field name. */
  fieldErrors?: Record<string, string>
  /** Original raw error string (for debug logs / Sentry). */
  raw?: string
}

const CODE_MAPPINGS: Record<string, { title: string; message: string }> = {
  // Validation & Input
  VALIDATION_ERROR: { title: 'Invalid Input', message: 'Please check the entered values and try again.' },
  INVALID_INPUT: { title: 'Invalid Input', message: 'One or more values provided are invalid.' },
  MISSING_REQUIRED_FIELD: { title: 'Missing Information', message: 'Please fill in all required fields.' },
  INVALID_STATE: { title: 'Invalid State', message: 'This action cannot be performed in the current state.' },
  PROFILE_INCOMPLETE: { title: 'Incomplete Profile', message: 'Please complete your profile details first.' },

  // Authentication & Session
  UNAUTHORIZED: { title: 'Sign In Required', message: 'Your session has expired. Please sign in again.' },
  AUTHENTICATION_FAILED: { title: 'Authentication Failed', message: 'Unable to authenticate your account.' },
  INVALID_CREDENTIALS: { title: 'Incorrect Credentials', message: 'Invalid email or password. Please try again.' },
  TOKEN_EXPIRED: { title: 'Session Expired', message: 'Your session has expired. Please sign in again.' },
  SESSION_EXPIRED: { title: 'Session Expired', message: 'Your session has expired. Please sign in again.' },
  ACCOUNT_LOCKED: { title: 'Account Locked', message: 'Your account is temporarily locked. Contact support.' },
  ACCOUNT_DISABLED: { title: 'Account Disabled', message: 'This account has been disabled.' },

  // Permissions & Access
  FORBIDDEN: { title: 'Access Denied', message: "You don't have permission to perform this action." },
  INSUFFICIENT_PERMISSIONS: { title: 'Permission Denied', message: 'You lack the required permissions for this action.' },
  ROLE_REQUIRED: { title: 'Role Required', message: 'A specific role is required to access this resource.' },
  SUBSCRIPTION_REQUIRED: { title: 'Pro Required', message: 'This feature requires a premium subscription.' },

  // Not Found
  NOT_FOUND: { title: 'Not Found', message: 'The requested item could not be found.' },
  RESOURCE_NOT_FOUND: { title: 'Resource Missing', message: 'The requested resource was not found.' },
  USER_NOT_FOUND: { title: 'User Not Found', message: 'User profile could not be found.' },
  RIDE_NOT_FOUND: { title: 'Ride Not Found', message: 'This ride is no longer available or was deleted.' },
  CLUB_NOT_FOUND: { title: 'Club Not Found', message: 'This club was not found or has been disbanded.' },
  LISTING_NOT_FOUND: { title: 'Listing Not Found', message: 'Marketplace listing is no longer available.' },

  // Conflict
  CONFLICT: { title: 'Conflict', message: 'This item conflicts with an existing record.' },
  ALREADY_EXISTS: { title: 'Already Exists', message: 'This item already exists in the system.' },
  DUPLICATE_ENTRY: { title: 'Duplicate', message: 'A duplicate entry was detected.' },

  // Upload & File
  INVALID_FILE_TYPE: { title: 'Unsupported Format', message: 'This file format is not supported.' },
  FILE_TOO_LARGE: { title: 'File Too Large', message: 'The selected file exceeds the maximum size limit.' },
  UPLOAD_ERROR: { title: 'Upload Failed', message: 'Could not upload file. Please check connection and retry.' },
  UPLOAD_FAILED: { title: 'Upload Failed', message: 'File upload failed. Please try again.' },

  // Rate Limiting
  RATE_LIMIT_EXCEEDED: { title: 'Slow Down', message: 'Too many requests. Please pause a moment before retrying.' },
  TOO_MANY_REQUESTS: { title: 'Rate Limited', message: 'Too many requests. Please slow down.' },

  // Server
  INTERNAL_ERROR: { title: 'Server Error', message: 'Our servers encountered an issue. Please try again shortly.' },
  DATABASE_ERROR: { title: 'Database Error', message: 'Database operation failed. Please retry.' },
  TIMEOUT: { title: 'Request Timed Out', message: 'The request took too long. Check your signal and retry.' },
  SERVICE_UNAVAILABLE: { title: 'Unavailable', message: 'Service is temporarily down for maintenance.' },
}

function parseFieldErrors(details: any): Record<string, string> | undefined {
  if (!details || typeof details !== 'object') return undefined

  const out: Record<string, string> = {}

  if (details.fieldErrors && typeof details.fieldErrors === 'object') {
    for (const [k, v] of Object.entries(details.fieldErrors)) {
      out[k] = Array.isArray(v) ? v.join(', ') : String(v)
    }
  }

  if (details.errors && typeof details.errors === 'object') {
    for (const [k, v] of Object.entries(details.errors)) {
      out[k] = Array.isArray(v) ? v.join(', ') : String(v)
    }
  }

  return Object.keys(out).length > 0 ? out : undefined
}

export function mapApiError(error: unknown, fallbackMessage?: string): MappedError {
  const defaultFallback = fallbackMessage || FALLBACK_MESSAGE

  if (!error) {
    return { title: 'Notice', message: defaultFallback }
  }

  let code: string | undefined
  let serverMessage: string | undefined
  let status: number | undefined
  let details: any
  let raw: string | undefined

  if (error instanceof ApiError) {
    code = error.code
    serverMessage = error.message
    status = error.status
    details = error.details
    raw = error.message
  } else if (axios.isAxiosError(error)) {
    status = error.response?.status
    const data = error.response?.data as any
    if (data && typeof data === 'object') {
      serverMessage = data.message || data.error?.message
      code = data.error?.code || data.code
      details = data.error?.details || data.details
    } else if (typeof data === 'string') {
      serverMessage = data
    }
    raw = serverMessage || error.message
  } else if (error instanceof Error) {
    serverMessage = error.message
    raw = error.message
  } else if (typeof error === 'string') {
    serverMessage = error
    raw = error
  } else if (typeof error === 'object' && error !== null) {
    const obj = error as any
    serverMessage = obj.message || obj.error?.message
    code = obj.code || obj.error?.code
    details = obj.details || obj.error?.details
    raw = serverMessage || (code ? String(code) : JSON.stringify(error))
  }

  const fieldErrors = parseFieldErrors(details)

  if (fieldErrors && Object.keys(fieldErrors).length > 0) {
    const firstKey = Object.keys(fieldErrors)[0]
    return {
      title: 'Validation Error',
      message: `${firstKey}: ${fieldErrors[firstKey]}`,
      code: (code as ApiErrorCode) || 'VALIDATION_ERROR',
      status: status || 400,
      fieldErrors,
      raw,
    }
  }

  const codeInfo = code ? CODE_MAPPINGS[code] : undefined

  let title = codeInfo?.title || 'Action failed'
  if (status === 401) title = 'Sign In Required'
  if (status === 403) title = 'Permission Denied'
  if (status === 404) title = 'Not Found'
  if (status === 429) title = 'Slow Down'
  if (status && status >= 500) title = 'Server Error'

  let message = defaultFallback

  if (serverMessage && typeof serverMessage === 'string' && serverMessage.trim().length > 0) {
    if (/validation failed for/i.test(serverMessage)) {
      message = codeInfo?.message || 'Please check your inputs and try again.'
    } else if (/network error|timeout|econnaborted/i.test(serverMessage)) {
      message = "Network's struggling. Check your connection and retry."
      title = 'Connection Error'
    } else {
      message = serverMessage
    }
  } else if (codeInfo?.message) {
    message = codeInfo.message
  }

  return {
    title,
    message,
    code: (code as ApiErrorCode) || undefined,
    status,
    fieldErrors,
    raw,
  }
}

export function getErrorMessage(error: unknown, fallback?: string): string {
  return mapApiError(error, fallback).message
}

export function errorMessage(error: unknown, fallback?: string): string {
  return getErrorMessage(error, fallback)
}

export function getErrorCode(error: unknown): ApiErrorCode | string | undefined {
  return mapApiError(error).code
}

