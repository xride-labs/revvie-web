import 'server-only'

import {
  publicEnvSchema,
  serverEnvSchema,
  type PublicEnv,
  type ServerEnv,
} from './schema'

/**
 * Validated environment, read once per process.
 *
 * `process.env` is referenced with full literal keys on purpose: Next replaces
 * `process.env.NEXT_PUBLIC_FOO` textually at build time, so a computed lookup like
 * `process.env[key]` silently yields undefined in the browser bundle.
 */

let cached: (PublicEnv & ServerEnv) | null = null

function read() {
  const raw = {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
    NEXT_PUBLIC_WEB_DISABLED: process.env.NEXT_PUBLIC_WEB_DISABLED,
    NEXT_PUBLIC_LAUNCH_DATE: process.env.NEXT_PUBLIC_LAUNCH_DATE,
    NEXT_PUBLIC_GOOGLE_FORM_EMBED_URL: process.env.NEXT_PUBLIC_GOOGLE_FORM_EMBED_URL,
    NODE_ENV: process.env.NODE_ENV,
    WEB_DISABLED: process.env.WEB_DISABLED,
    GOOGLE_FORM_RESPONSES_URL: process.env.GOOGLE_FORM_RESPONSES_URL,
    INTEREST_WEBHOOK_URL: process.env.INTEREST_WEBHOOK_URL,
    SENTRY_DSN: process.env.SENTRY_DSN,
    GATEWAY_TIMEOUT_MS: process.env.GATEWAY_TIMEOUT_MS,
  }

  const publicResult = publicEnvSchema.safeParse(raw)
  const serverResult = serverEnvSchema.safeParse(raw)

  if (!publicResult.success || !serverResult.success) {
    const issues = [
      ...(publicResult.success ? [] : publicResult.error.issues),
      ...(serverResult.success ? [] : serverResult.error.issues),
    ]
      .map((i) => `  ${i.path.join('.')}: ${i.message}`)
      .join('\n')

    // Fail loudly at boot rather than at the first request that needs the value.
    throw new Error(`Invalid environment configuration:\n${issues}`)
  }

  return { ...publicResult.data, ...serverResult.data }
}

export function serverEnv() {
  cached ??= read()
  return cached
}

/** Backend origin with any trailing slash removed, e.g. `https://api.example.com/api`. */
export function apiBaseUrl(): string {
  return serverEnv().NEXT_PUBLIC_API_URL.replace(/\/+$/, '')
}
