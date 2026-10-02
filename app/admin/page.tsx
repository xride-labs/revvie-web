import { getApprovals, getReports, getStats, getUsers, getWeeklyActivity } from '@/features/admin/server'
import { AdminDashboardView } from './_components/dashboard-view'
import { AdminLoginView } from './_components/admin-login-view'
import { getSession } from '@/core/auth/session'
import { ADMIN_ROLES, hasAnyRole } from '@/core/auth/roles'

type ActivityRange = '7' | '30'

export default async function AdminDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>
}) {
  const session = await getSession()
  const isAdmin = session && hasAnyRole(session.user.roles, ...ADMIN_ROLES)

  if (!isAdmin) {
    return <AdminLoginView />
  }
  const { range } = await searchParams
  const activityRange: ActivityRange = range === '7' ? '7' : '30'

  const [stats, weeklyActivity, usersData, reportsData, approvals] = await Promise.all([
    getStats(),
    getWeeklyActivity(Number(activityRange)),
    getUsers({ limit: 5 }),
    getReports({ status: 'pending' }),
    getApprovals(),
  ])

  const pendingCounts = {
    clubs: approvals.pendingClubs.length,
    clubRequests: approvals.pendingClubRequests.length,
    rideRequests: approvals.pendingRideRequests.length,
  }

  return (
    <AdminDashboardView
      stats={stats}
      weeklyActivity={weeklyActivity}
      activityRange={activityRange}
      recentUsers={usersData.items}
      pendingReports={reportsData.items.slice(0, 4)}
      pendingCounts={pendingCounts}
    />
  )
}
