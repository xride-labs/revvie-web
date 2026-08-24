'use client'

import { ErrorState } from '@/components/errors/error-state'

export default function RootError(props: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <ErrorState {...props} scope="this page" homeHref="/" homeLabel="Back to Revvie" />
  )
}
