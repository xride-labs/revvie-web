'use client'

import { ErrorState } from '@/components/errors/error-state'

export default function BrandManagementError(props: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <ErrorState
      {...props}
      scope="your brand workspace"
      homeHref="/brand/dashboard"
      homeLabel="Back to dashboard"
    />
  )
}
