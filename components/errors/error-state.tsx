'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import * as Sentry from '@sentry/nextjs'
import { AlertTriangle, RotateCcw } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const isProd = process.env.NODE_ENV === 'production'

export interface ErrorStateProps {
  error: Error & { digest?: string }
  reset: () => void
  /** What failed, in the user's words — "this ride", "the admin console". */
  scope?: string
  /** Where "Go back" should point. Defaults to the app home. */
  homeHref?: string
  homeLabel?: string
  className?: string
}

/**
 * Shared body for every `error.tsx`.
 *
 * The route files stay one-liners so each segment gets its own boundary — an error in a
 * club page must not take out the nav shell around it.
 */
export function ErrorState({
  error,
  reset,
  scope = 'this page',
  homeHref = '/home',
  homeLabel = 'Go back',
  className,
}: ErrorStateProps) {
  useEffect(() => {
    if (isProd) {
      Sentry.captureException(error)
    } else {
      console.error(error)
    }
  }, [error])

  return (
    <div
      className={cn(
        'flex min-h-[60vh] flex-col items-center justify-center gap-6 px-6 py-16 text-center',
        className,
      )}
    >
      <div className="flex size-14 items-center justify-center rounded-full border border-border bg-surface">
        <AlertTriangle className="size-6 text-brand-red-bright" aria-hidden />
      </div>

      <div className="max-w-md space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          We couldn&apos;t load {scope}
        </h1>
        <p className="text-sm text-muted-foreground">
          Something broke on our side. Try again — if it keeps happening, the team has
          already been notified.
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button onClick={reset}>
          <RotateCcw className="size-4" aria-hidden />
          Try again
        </Button>
        <Button variant="outline" asChild>
          <Link href={homeHref}>{homeLabel}</Link>
        </Button>
      </div>

      {error.digest ? (
        <p className="font-mono text-xs text-muted-foreground">
          Reference: {error.digest}
        </p>
      ) : null}
    </div>
  )
}
