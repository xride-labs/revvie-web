'use client'

import { ErrorState } from '@/components/errors/error-state'

export default function AdminError(props: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <ErrorState
      {...props}
      scope="the admin console"
      homeHref="/admin"
      homeLabel="Back to dashboard"
    />
  )
}
