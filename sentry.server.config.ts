import * as Sentry from '@sentry/nextjs'

const isProd = process.env.NODE_ENV === 'production'
const dsn = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN
const environment =
  process.env.SENTRY_ENVIRONMENT || process.env.NODE_ENV || 'development'

const tracesSampleRate = Number.isFinite(Number(process.env.SENTRY_TRACES_SAMPLE_RATE))
  ? Number(process.env.SENTRY_TRACES_SAMPLE_RATE)
  : process.env.NODE_ENV === 'production'
    ? 0.1
    : 0

if (isProd && dsn) {
  Sentry.init({
    dsn,
    environment,
    tracesSampleRate,
    debug: false,
  })
}
