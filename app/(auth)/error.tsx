'use client'

import { ErrorState } from '@/components/errors/error-state'

export default function AuthError(props: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <ErrorState
      {...props}
      scope="this screen"
      homeHref="/login"
      homeLabel="Back to sign in"
    />
  )
}
