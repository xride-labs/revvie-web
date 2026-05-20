import * as Sentry from '@sentry/nextjs'

const isProd = process.env.NODE_ENV === 'production'

export async function register() {
  if (!isProd) {
    return
  }
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('./sentry.server.config')
  }
  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('./sentry.edge.config')
  }
}

export function onRequestError(
  error: unknown,
  request: Parameters<typeof Sentry.captureRequestError>[1],
  context: Parameters<typeof Sentry.captureRequestError>[2],
) {
  if (!isProd) {
    return
  }
  Sentry.captureRequestError(error, request, context)
}

// export const onRouterTransitionStart = (url: string) => {
//   Sentry.addBreadcrumb({
//     category: 'navigation',
//     message: `Navigating to ${url}`,
//     level: Sentry.Severity.Info,
//   })
// }

// export const onRouterTransitionError = (error: unknown, url: string) => {
//   Sentry.captureException(error, {
//     tags: { navigation: 'error' },
//     extra: { url },
//   })
// }
