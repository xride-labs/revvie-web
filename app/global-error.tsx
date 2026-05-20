'use client'

import * as Sentry from '@sentry/nextjs'
import { useEffect } from 'react'

const isProd = process.env.NODE_ENV === 'production'

type GlobalErrorProps = {
  error: Error & { digest?: string }
  reset: () => void
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    if (isProd) {
      Sentry.captureException(error)
    }
  }, [error])

  return (
    <html lang="en">
      <body>
        <main style={{ padding: '2rem', fontFamily: 'system-ui, sans-serif' }}>
          <h1>Something went wrong</h1>
          <p>We ran into an unexpected error. Please try again.</p>
          <button type="button" onClick={reset}>
            Try again
          </button>
        </main>
      </body>
    </html>
  )
}
