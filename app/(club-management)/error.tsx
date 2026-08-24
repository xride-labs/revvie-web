'use client'

import { ErrorState } from '@/components/errors/error-state'

export default function ClubManagementError(props: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <ErrorState {...props} scope="this page" homeHref="/home" homeLabel="Back to feed" />
  )
}
