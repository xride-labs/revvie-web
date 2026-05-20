import { AppLayout } from '@/components/app/app-layout'
import { ClubProvider } from '@/contexts/club-context'

export default function ClubManagementLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClubProvider>
      <AppLayout>{children}</AppLayout>
    </ClubProvider>
  )
}
