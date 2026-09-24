import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Bike, Calendar, Users, Plus, ChevronRight } from 'lucide-react'
import { formatDate } from '../_lib/constants'
import type { Ride } from '@/entities/ride/model'

export function RidesTab({
  clubId,
  rides,
  isMember,
}: {
  clubId: string
  rides: Ride[]
  isMember: boolean
}) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Club Rides</CardTitle>
            <CardDescription>Group excursions and scheduled club rides</CardDescription>
          </div>
          {isMember && (
            <Link href={`/rides/create?clubId=${clubId}`}>
              <Button size="sm" className="gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground">
                <Plus className="w-4 h-4" />
                Schedule Ride
              </Button>
            </Link>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {rides.length === 0 ? (
          <div className="py-16 text-center text-sm text-muted-foreground space-y-3">
            <Bike className="w-12 h-12 mx-auto text-muted-foreground/30" />
            <p>No rides scheduled for this club yet.</p>
            {isMember && (
              <Link href={`/rides/create?clubId=${clubId}`}>
                <Button size="sm" variant="outline" className="gap-1.5">
                  <Plus className="w-4 h-4" />
                  Schedule First Ride
                </Button>
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {rides.map((ride) => (
              <Link
                key={ride.id}
                href={`/rides/${ride.id}`}
                className="group flex items-center justify-between p-4 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/5 hover:border-primary/40 transition-all"
              >
                <div className="space-y-1">
                  <p className="font-semibold text-foreground group-hover:text-primary transition-colors">
                    {ride.title}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-primary" />
                      {formatDate(ride.scheduledAt)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-primary" />
                      {ride._count?.participants ?? 0} riders
                    </span>
                    {ride.distance && (
                      <span>{ride.distance} km</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge
                    variant={
                      ride.status === 'PLANNED'
                        ? 'default'
                        : ride.status === 'IN_PROGRESS'
                          ? 'secondary'
                          : 'outline'
                    }
                  >
                    {ride.status}
                  </Badge>
                  <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-1 group-hover:text-primary transition-all" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

