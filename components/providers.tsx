'use client'

import { StoreProvider } from '@/core/store/store-provider'
import { Toaster } from '@/components/ui/sonner'

interface ProvidersProps {
  children: React.ReactNode
}

export function Providers({ children }: ProvidersProps) {
  return (
    <StoreProvider>
      {children}
      <Toaster position="top-right" richColors closeButton />
    </StoreProvider>
  )
}
