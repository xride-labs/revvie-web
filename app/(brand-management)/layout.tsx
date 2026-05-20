import { BrandPortalLayout } from '@/components/brand/brand-portal-layout'
import { BusinessProvider } from '@/contexts/business-context'

export default function BrandManagementLayout({ children }: { children: React.ReactNode }) {
  return (
    <BusinessProvider>
      <BrandPortalLayout>{children}</BrandPortalLayout>
    </BusinessProvider>
  )
}
