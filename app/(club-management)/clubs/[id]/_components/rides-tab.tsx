import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatDate } from '../_lib/constants'
import type { Ride } from '@/entities/ride/model'

export function RidesTab({ rides, isMember }: { rides: Ride[]; isMember: boolean }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Club Rides</CardTitle>
          {isMember && <Button size="sm">Create Ride</Button>}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {rides.map((ride) => (
            <Link
              key={ride.id}
              href={`/rides/${ride.id}`}
              className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors"
            >
              <div>
                <p className="font-medium">{ride.title}</p>
                <p className="text-sm text-muted-foreground">
                  {formatDate(ride.scheduledAt)} • {ride._count?.participants ?? 0} riders
                </p>
              </div>
              <Badge variant={ride.status === 'PLANNED' ? 'default' : 'secondary'}>
                {ride.status}
              </Badge>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
