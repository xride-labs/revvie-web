import { z } from 'zod'

/**
 * The backend's response envelope, from backend/src/lib/utils/apiResponse.ts:
 *
 *   { success: boolean, message: string, data?: T, error?: { code, details? } }
 *
 * Everything on this side unwraps that shape in exactly one place so route handlers and
 * the DAL never re-implement it.
 */

export const envelopeSchema = z.object({
  success: z.boolean(),
  message: z.string().default(''),
  data: z.unknown().optional(),
  error: z
    .object({
      code: z.string(),
      details: z.unknown().optional(),
    })
    .optional(),
})

export type FieldErrors = Record<string, string[]>

export interface SerializedGatewayError {
  status: number
  code: string
  message: string
  fieldErrors?: FieldErrors
  correlationId?: string
}

export class GatewayError extends Error {
  readonly status: number
  readonly code: string
  readonly fieldErrors?: FieldErrors
  readonly correlationId?: string

  constructor(init: SerializedGatewayError) {
    super(init.message)
    this.name = 'GatewayError'
    this.status = init.status
    this.code = init.code
    this.fieldErrors = init.fieldErrors
    this.correlationId = init.correlationId
  }

  serialize(): SerializedGatewayError {
    return {
      status: this.status,
      code: this.code,
      message: this.message,
      fieldErrors: this.fieldErrors,
      correlationId: this.correlationId,
    }
  }
}

/**
 * Best-effort extraction of per-field validation messages.
 *
 * The backend's VALIDATION_ERROR puts them in `error.details`, but the exact shape varies
 * by route (zod flatten in some, a plain map in others), so both are accepted and
 * anything else is dropped rather than guessed at.
 */
export function toFieldErrors(details: unknown): FieldErrors | undefined {
  if (!details || typeof details !== 'object') return undefined

  const source =
    'fieldErrors' in details &&
    typeof (details as { fieldErrors: unknown }).fieldErrors === 'object'
      ? (details as { fieldErrors: Record<string, unknown> }).fieldErrors
      : (details as Record<string, unknown>)

  const out: FieldErrors = {}
  for (const [key, value] of Object.entries(source)) {
    if (typeof value === 'string') out[key] = [value]
    else if (Array.isArray(value) && value.every((v) => typeof v === 'string')) {
      out[key] = value as string[]
    }
  }

  return Object.keys(out).length > 0 ? out : undefined
}

const FRIENDLY_MESSAGES: Record<number, string> = {
  401: 'Your session has expired. Please sign in again.',
  403: "You don't have access to this.",
  404: "We couldn't find that.",
  429: "You're going a bit fast — try again in a moment.",
  500: 'Something broke on our side. Please try again.',
  502: 'Could not reach the server. Please try again.',
  503: 'The service is temporarily unavailable. Please try again.',
  504: 'The server took too long to respond. Please try again.',
}

export function friendlyMessage(status: number, fromServer?: string): string {
  // A server-authored message is almost always more specific than our fallback, but the
  // generic 500 text some handlers emit is not worth surfacing.
  if (
    fromServer &&
    fromServer.trim() &&
    !/^internal( server)? error$/i.test(fromServer)
  ) {
    return fromServer
  }
  return FRIENDLY_MESSAGES[status] ?? 'Something went wrong. Please try again.'
}
