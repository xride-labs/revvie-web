import * as Sentry from '@sentry/nextjs'

const isProd = process.env.NODE_ENV === 'production'
const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN
const environment =
  process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT || process.env.NODE_ENV || 'development'

const tracesSampleRate = Number.isFinite(
  Number(process.env.NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE),
)
  ? Number(process.env.NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE)
  : process.env.NODE_ENV === 'production'
    ? 0.1
    : 0

const replaysOnErrorSampleRate = Number.isFinite(
  Number(process.env.NEXT_PUBLIC_SENTRY_REPLAYS_ON_ERROR_SAMPLE_RATE),
)
  ? Number(process.env.NEXT_PUBLIC_SENTRY_REPLAYS_ON_ERROR_SAMPLE_RATE)
  : 1.0

const replaysSessionSampleRate = Number.isFinite(
  Number(process.env.NEXT_PUBLIC_SENTRY_REPLAYS_SESSION_SAMPLE_RATE),
)
  ? Number(process.env.NEXT_PUBLIC_SENTRY_REPLAYS_SESSION_SAMPLE_RATE)
  : 0.05

if (isProd && dsn) {
  Sentry.init({
    dsn,
    environment,
    tracesSampleRate,
    replaysOnErrorSampleRate,
    replaysSessionSampleRate,
    integrations: [Sentry.replayIntegration()],
    debug: false,
  })
}
