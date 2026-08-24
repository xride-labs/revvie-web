import { z } from 'zod'

/**
 * Env contract for the web app.
 *
 * Split by where the value is readable, not by what it means. NEXT_PUBLIC_* is inlined
 * into the client bundle at build time and is therefore public — anything secret must
 * live in the server schema and never gain that prefix.
 */

const url = z.string().url()
const boolish = z
  .string()
  .optional()
  .transform((raw) => {
    const value = raw
      ?.trim()
      .replace(/^['"]|['"]$/g, '')
      .toLowerCase()
    return value === 'true' || value === '1' || value === 'yes' || value === 'on'
  })

export const publicEnvSchema = z.object({
  /** Backend gateway origin, including the /api prefix. Server-side use only now that
   *  the browser talks to /api/gw — kept NEXT_PUBLIC_ because better-auth's client
   *  still derives its baseURL from it. */
  NEXT_PUBLIC_API_URL: url,
  NEXT_PUBLIC_APP_URL: url.optional(),
  NEXT_PUBLIC_SENTRY_DSN: z.string().optional(),
  NEXT_PUBLIC_WEB_DISABLED: boolish,
  NEXT_PUBLIC_LAUNCH_DATE: z.string().optional(),
  NEXT_PUBLIC_GOOGLE_FORM_EMBED_URL: z.string().optional(),
})

export const serverEnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  WEB_DISABLED: boolish,
  GOOGLE_FORM_RESPONSES_URL: z.string().optional(),
  INTEREST_WEBHOOK_URL: z.string().optional(),
  SENTRY_DSN: z.string().optional(),
  /** Upstream timeout for gateway calls, in milliseconds. */
  GATEWAY_TIMEOUT_MS: z.coerce.number().int().positive().default(15_000),
})

export type PublicEnv = z.infer<typeof publicEnvSchema>
export type ServerEnv = z.infer<typeof serverEnvSchema>
