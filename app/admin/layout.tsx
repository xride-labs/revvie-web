import { AdminLayout } from '@/components/admin/admin-layout'
import { getSession } from '@/core/auth/session'
import { ADMIN_ROLES, hasAnyRole } from '@/core/auth/roles'

/**
 * Server-side gate for the whole admin console.
 *
 * `<AdminLayout>` still runs its own client-side check, but that only ever hid the UI —
 * the markup and every admin route's JS were served to anyone who asked. Deciding here
 * means an unauthorized visitor gets a redirect and no admin payload at all.
 */
export default async function AdminRootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getSession()
  const isAdmin = session && hasAnyRole(session.user.roles, ...ADMIN_ROLES)

  if (!isAdmin) {
    return <>{children}</>
  }

  return <AdminLayout>{children}</AdminLayout>
}
