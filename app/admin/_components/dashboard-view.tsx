'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  AlertTriangle,
  CheckSquare,
  MapPin,
  Shield,
  ShoppingBag,
  TrendingUp,
  UserPlus,
  Users,
  CheckCircle2,
  Clock,
} from 'lucide-react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Cell,
} from 'recharts'
import { initials } from '@/shared/lib/initials'
import type {
  AdminStats,
  AdminWeeklyActivity,
  AdminUserRecord,
  AdminReportRecord,
} from '@/entities/admin/model'

const PIE_COLORS = ['#2563eb', '#16a34a', '#d97706', '#dc2626', '#7c3aed', '#0891b2']

export function AdminDashboardView({
  stats,
  weeklyActivity,
  activityRange,
  recentUsers,
  pendingReports,
  pendingCounts,
}: {
  stats: AdminStats
  weeklyActivity: AdminWeeklyActivity
  activityRange: '7' | '30'
  recentUsers: AdminUserRecord[]
  pendingReports: AdminReportRecord[]
  pendingCounts: { clubs: number; clubRequests: number; rideRequests: number }
}) {
  const router = useRouter()

  const roleBreakdown = Object.entries(stats.breakdown.usersByRole).map(([name, value]) => ({
    name,
    value,
  }))

  const ridesFunnel = (() => {
    const breakdown = stats.breakdown.ridesByStatus
    const total = Object.values(breakdown).reduce((a, b) => a + b, 0)
    if (total === 0) return []
    return [
      { name: 'Planned', value: breakdown.PLANNED ?? 0, fill: '#3b82f6' },
      { name: 'In Progress', value: breakdown.IN_PROGRESS ?? 0, fill: '#f59e0b' },
      { name: 'Completed', value: breakdown.COMPLETED ?? 0, fill: '#22c55e' },
    ]
  })()

  const summaryCards = [
    {
      title: 'Total Users',
      value: stats.overview.totalUsers.toLocaleString(),
      helper: `+${stats.recent.newUsersLast7Days} this week`,
      icon: Users,
    },
    {
      title: 'Clubs',
      value: stats.overview.totalClubs.toLocaleString(),
      helper: `${stats.overview.verifiedClubs} verified`,
      icon: Shield,
    },
    {
      title: 'Total Rides',
      value: stats.overview.totalRides.toLocaleString(),
      helper: `+${stats.recent.newRidesLast7Days} this week`,
      icon: MapPin,
    },
    {
      title: 'Listings',
      value: stats.overview.totalListings.toLocaleString(),
      helper: `${stats.overview.activeRides} rides live`,
      icon: ShoppingBag,
    },
  ]

  const totalPending = pendingCounts.clubs + pendingCounts.clubRequests + pendingCounts.rideRequests

  return (
    <div className="space-y-6">
      {/* Pending approvals banner */}
      {totalPending > 0 && (
        <Card className="border-amber-200 bg-amber-50/60 dark:bg-amber-950/20">
          <CardContent className="p-4 flex items-center gap-3">
            <CheckSquare className="w-5 h-5 text-amber-600 shrink-0" />
            <div className="flex-1">
              <p className="font-semibold text-sm text-amber-900 dark:text-amber-100">
                {totalPending} item{totalPending !== 1 ? 's' : ''} need your approval
              </p>
              <p className="text-xs text-amber-700 dark:text-amber-300">
                {pendingCounts.clubs > 0 &&
                  `${pendingCounts.clubs} club${pendingCounts.clubs !== 1 ? 's' : ''} to verify  ·  `}
                {pendingCounts.clubRequests > 0 &&
                  `${pendingCounts.clubRequests} club join request${pendingCounts.clubRequests !== 1 ? 's' : ''}  ·  `}
                {pendingCounts.rideRequests > 0 &&
                  `${pendingCounts.rideRequests} ride join request${pendingCounts.rideRequests !== 1 ? 's' : ''}`}
              </p>
            </div>
            <Button size="sm" asChild className="bg-amber-600 hover:bg-amber-700 shrink-0">
              <Link href="/admin/approvals">Review →</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Summary cards */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((card) => (
          <Card key={card.title}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div className="p-2 rounded-lg bg-muted">
                  <card.icon className="w-5 h-5" />
                </div>
                <Badge variant="secondary" className="gap-1">
                  <TrendingUp className="w-3 h-3" />
                  Live
                </Badge>
              </div>
              <div className="mt-4">
                <p className="text-2xl font-bold">{card.value}</p>
                <p className="text-sm text-muted-foreground">{card.title}</p>
                <p className="text-xs text-muted-foreground mt-1">{card.helper}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Reports + pending summary row */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 rounded-lg bg-red-50 dark:bg-red-950">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
            </div>
            <p className="text-2xl font-bold">{stats.overview.pendingReports ?? '—'}</p>
            <p className="text-sm text-muted-foreground">Pending Reports</p>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.overview.highPriorityReports ?? 0} high priority
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950">
                <Clock className="w-5 h-5 text-amber-600" />
              </div>
            </div>
            <p className="text-2xl font-bold">{totalPending}</p>
            <p className="text-sm text-muted-foreground">Pending Approvals</p>
            <p className="text-xs text-muted-foreground mt-1">Clubs, join requests</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 rounded-lg bg-green-50 dark:bg-green-950">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
              </div>
            </div>
            <p className="text-2xl font-bold">{stats.overview.activeRides ?? '—'}</p>
            <p className="text-sm text-muted-foreground">Active Rides Now</p>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.overview.completedRides ?? 0} completed total
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Activity chart */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Platform Activity</CardTitle>
              <CardDescription>
                Registrations, rides, clubs, and reports over time
              </CardDescription>
            </div>
            <Tabs
              value={activityRange}
              onValueChange={(v) => router.push(`/admin?range=${v}`)}
            >
              <TabsList>
                <TabsTrigger value="7">7d</TabsTrigger>
                <TabsTrigger value="30">30d</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={weeklyActivity.activity}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="usersRegistered" fill="#2563eb" name="Users" radius={[4, 4, 0, 0]} />
              <Bar dataKey="ridesCreated" fill="#16a34a" name="Rides" radius={[4, 4, 0, 0]} />
              <Line
                type="monotone"
                dataKey="clubsCreated"
                stroke="#d97706"
                strokeWidth={2}
                name="Clubs"
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="reportsCreated"
                stroke="#dc2626"
                strokeWidth={2}
                name="Reports"
                dot={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Role breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>User Roles</CardTitle>
            <CardDescription>Distribution across all roles</CardDescription>
          </CardHeader>
          <CardContent className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={roleBreakdown}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={75}
                  label
                >
                  {roleBreakdown.map((entry, index) => (
                    <Cell key={entry.name} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Ride completion funnel */}
        <Card>
          <CardHeader>
            <CardTitle>Ride Funnel</CardTitle>
            <CardDescription>Planned → In Progress → Completed</CardDescription>
          </CardHeader>
          <CardContent className="h-56">
            {ridesFunnel.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ridesFunnel} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11 }} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={80} />
                  <Tooltip />
                  <Bar dataKey="value" name="Rides" radius={[0, 4, 4, 0]}>
                    {ridesFunnel.map((entry) => (
                      <Cell key={entry.name} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                No ride data yet
              </div>
            )}
          </CardContent>
        </Card>

        {/* Moderation queue */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              Moderation Queue
            </CardTitle>
            <CardDescription>Recent pending reports</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {pendingReports.length === 0 ? (
                <p className="text-sm text-muted-foreground">No pending reports.</p>
              ) : (
                pendingReports.map((report) => (
                  <div key={report.id} className="p-2.5 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-xs truncate mr-2">{report.title}</p>
                      <Badge
                        variant={report.priority === 'high' ? 'destructive' : 'secondary'}
                        className="text-[10px] shrink-0"
                      >
                        {report.priority}
                      </Badge>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      {report.type} · {new Date(report.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent registrations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-blue-500" />
            Recent Registrations
          </CardTitle>
          <CardDescription>Latest users on the platform</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Roles</TableHead>
                <TableHead>Rides</TableHead>
                <TableHead>Joined</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs">
                          {initials(user.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-sm">{user.name || 'Unknown'}</p>
                        <p className="text-xs text-muted-foreground">
                          {user.email || 'No email'}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1 flex-wrap">
                      {user.roles.map((role) => (
                        <Badge key={role} variant="outline" className="text-[10px]">
                          {role}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{user.ridesCompleted ?? 0}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
