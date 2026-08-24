'use client'

import { useRouter } from 'next/navigation'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
} from 'recharts'
import {
  ChevronLeft,
  Users,
  MapPin,
  Trophy,
  TrendingUp,
  CheckCircle2,
  Clock,
  BarChart3,
} from 'lucide-react'
import { formatRelativeTime, useNow } from '@/shared/lib/relative-time'
import type { ClubDetails, ClubMember } from '@/entities/club/model'
import type { Ride } from '@/entities/ride/model'
import type { ClubAnalytics } from '@/features/clubs/schemas'

const STATUS_COLORS: Record<string, string> = {
  PLANNED: '#3b82f6',
  IN_PROGRESS: '#f59e0b',
  COMPLETED: '#22c55e',
  CANCELLED: '#ef4444',
}

const STATUS_BADGE: Record<string, string> = {
  ACTIVE: 'text-green-600 border-green-600/40',
  MUTED: 'text-amber-600 border-amber-600/40',
  SUSPENDED: 'text-orange-600 border-orange-600/40',
  BANNED: 'text-red-600 border-red-600/40',
}

export function ClubAnalyticsView({
  club,
  members,
  rides,
  analytics,
}: {
  club: ClubDetails
  members: ClubMember[]
  rides: Ride[]
  analytics: ClubAnalytics | null
}) {
  const router = useRouter()
  const now = useNow()
  const fmtAgo = (iso?: string | null) => formatRelativeTime(iso, now, 'Never')

  const totalRides = rides.length
  const completedRides = rides.filter((r) => r.status === 'COMPLETED').length
  const completionRate =
    totalRides > 0 ? Math.round((completedRides / totalRides) * 100) : 0

  const ridesByStatus = rides.reduce<Record<string, number>>((acc, r) => {
    acc[r.status] = (acc[r.status] ?? 0) + 1
    return acc
  }, {})

  const statusChartData = Object.entries(ridesByStatus).map(([name, value]) => ({
    name,
    value,
    fill: STATUS_COLORS[name] ?? '#6b7280',
  }))

  const avgParticipants =
    rides.length > 0
      ? Math.round(
          rides.reduce((acc, r) => acc + (r._count?.participants ?? 0), 0) / rides.length,
        )
      : 0

  const totalDistance = rides
    .filter((r) => r.status === 'COMPLETED')
    .reduce((acc, r) => acc + (r.distance ?? 0), 0)

  // Monthly rides bucketed by scheduledAt month
  const monthlyBuckets: Record<string, number> = {}
  rides.forEach((r) => {
    const d = r.scheduledAt ? new Date(r.scheduledAt) : new Date(r.createdAt)
    const key = d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
    monthlyBuckets[key] = (monthlyBuckets[key] ?? 0) + 1
  })
  const monthlyData = Object.entries(monthlyBuckets)
    .slice(-6)
    .map(([month, count]) => ({ month, count }))

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{club.name} Analytics</h1>
          <p className="text-sm text-muted-foreground">
            Performance insights for club managers
          </p>
        </div>
        <div className="ml-auto">
          <BarChart3 className="w-6 h-6 text-muted-foreground" />
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Members"
          value={club._count?.members ?? members.length}
          icon={<Users className="w-5 h-5" />}
          color="blue"
        />
        <StatCard
          label="Total Rides"
          value={totalRides}
          icon={<MapPin className="w-5 h-5" />}
          color="green"
        />
        <StatCard
          label="Completion Rate"
          value={`${completionRate}%`}
          icon={<CheckCircle2 className="w-5 h-5" />}
          color="purple"
          sub={`${completedRides} of ${totalRides} completed`}
        />
        <StatCard
          label="Avg Participants"
          value={avgParticipants}
          icon={<TrendingUp className="w-5 h-5" />}
          color="amber"
          sub="per ride"
        />
      </div>

      {/* Distance + ride count */}
      {totalDistance > 0 && (
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-green-50 dark:bg-green-950">
              <Trophy className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{totalDistance.toFixed(0)} km</p>
              <p className="text-sm text-muted-foreground">
                Total distance covered by completed rides
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Monthly ride activity */}
        {monthlyData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Monthly Rides</CardTitle>
              <CardDescription>
                Rides scheduled or created per month (last 6 months)
              </CardDescription>
            </CardHeader>
            <CardContent className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar
                    dataKey="count"
                    name="Rides"
                    fill="#3b82f6"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Ride status breakdown */}
        {statusChartData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Ride Status Breakdown</CardTitle>
              <CardDescription>Distribution of all rides by status</CardDescription>
            </CardHeader>
            <CardContent className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusChartData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={75}
                    label
                  >
                    {statusChartData.map((entry) => (
                      <Cell key={entry.name} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Members table */}
      {members.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Members ({members.length})
            </CardTitle>
            <CardDescription>Current club members and their roles</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Member</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Joined</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {members.slice(0, 20).map((member) => {
                  const name = member.user?.name ?? 'Member'
                  return (
                    <TableRow key={member.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="text-xs">
                              {name[0].toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-sm">{name}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={member.role === 'FOUNDER' ? 'default' : 'outline'}
                          className="text-[11px]"
                        >
                          {member.role}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {member.joinedAt
                          ? new Date(member.joinedAt).toLocaleDateString()
                          : '—'}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
            {members.length > 20 && (
              <p className="text-xs text-muted-foreground mt-3 text-center">
                Showing first 20 of {members.length} members
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* ── Community engagement (chat activity) ── */}
      {analytics?.summary && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Active Today"
            value={analytics.summary.activeToday}
            icon={<Clock className="w-5 h-5" />}
            color="green"
            sub={`${analytics.summary.activeWeek} active this week`}
          />
          <StatCard
            label="Messages Sent"
            value={analytics.summary.totalMessages}
            icon={<TrendingUp className="w-5 h-5" />}
            color="blue"
            sub={`across ${analytics.summary.groupCount} groups`}
          />
          <StatCard
            label="Dormant Members"
            value={analytics.summary.dormant}
            icon={<Users className="w-5 h-5" />}
            color="amber"
            sub="no activity in 30d"
          />
          <StatCard
            label="Moderated"
            value={analytics.summary.moderated}
            icon={<CheckCircle2 className="w-5 h-5" />}
            color="purple"
            sub="muted / suspended / banned"
          />
        </div>
      )}

      {/* ── Member activity table ── */}
      {analytics && analytics.members.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Member Activity
            </CardTitle>
            <CardDescription>
              When each member last interacted, last messaged, and their total message
              volume
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Member</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Active</TableHead>
                  <TableHead>Last Message</TableHead>
                  <TableHead className="text-right">Messages</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {analytics.members.slice(0, 100).map((m) => {
                  const name = m.user?.name ?? m.user?.email ?? 'Member'
                  return (
                    <TableRow key={m.userId}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="text-xs">
                              {name[0]?.toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-sm">{name}</p>
                            <p className="text-xs text-muted-foreground">{m.role}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`text-[11px] ${STATUS_BADGE[m.status] ?? ''}`}
                        >
                          {m.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {fmtAgo(m.lastInteractionAt)}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {fmtAgo(m.lastMessageAt)}
                      </TableCell>
                      <TableCell className="text-right text-sm font-medium">
                        {m.messageCount ?? 0}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Empty state */}
      {totalRides === 0 && members.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 gap-3 text-muted-foreground">
            <BarChart3 className="w-10 h-10" />
            <p className="font-medium">No analytics data yet</p>
            <p className="text-sm text-center">
              Analytics will populate once members join and rides are created.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function StatCard({
  label,
  value,
  icon,
  color,
  sub,
}: {
  label: string
  value: string | number
  icon: React.ReactNode
  color: 'blue' | 'green' | 'purple' | 'amber'
  sub?: string
}) {
  const colors = {
    blue: 'bg-blue-50 dark:bg-blue-950 text-blue-600',
    green: 'bg-green-50 dark:bg-green-950 text-green-600',
    purple: 'bg-violet-50 dark:bg-violet-950 text-violet-600',
    amber: 'bg-amber-50 dark:bg-amber-950 text-amber-600',
  }
  return (
    <Card>
      <CardContent className="p-5">
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${colors[color]}`}
        >
          {icon}
        </div>
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-sm text-muted-foreground">{label}</p>
        {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
      </CardContent>
    </Card>
  )
}
