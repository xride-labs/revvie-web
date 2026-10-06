'use client'

import { StoreProvider } from '@/core/store/store-provider'
import { Toaster } from '@/components/ui/sonner'
import { BrandingProvider } from '@/components/providers/branding-provider'
import { TenantProvider } from '@/contexts/tenant-context'

interface ProvidersProps {
  children: React.ReactNode
}

export function Providers({ children }: ProvidersProps) {
  return (
    <StoreProvider>
      <TenantProvider>
        <BrandingProvider>
          {children}
          <Toaster position="top-right" richColors closeButton />
        </BrandingProvider>
      </TenantProvider>
    </StoreProvider>
  )
}
