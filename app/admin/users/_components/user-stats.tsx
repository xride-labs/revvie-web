import { Card, CardContent } from '@/components/ui/card'

export function UserStats({
  stats,
}: {
  stats: { total: number; active: number; pending: number }
}) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardContent className="p-4">
          <p className="text-2xl font-bold">{stats.total}</p>
          <p className="text-sm text-muted-foreground">Total Users</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <p className="text-2xl font-bold text-green-600">{stats.active}</p>
          <p className="text-sm text-muted-foreground">Active</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <p className="text-2xl font-bold text-amber-600">{stats.pending}</p>
          <p className="text-sm text-muted-foreground">Pending Verification</p>
        </CardContent>
      </Card>
    </div>
  )
}
