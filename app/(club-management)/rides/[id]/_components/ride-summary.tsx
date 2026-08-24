import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Calendar, Clock, Route, Gauge, Mountain, MapPin } from 'lucide-react'
import type { RideDetails } from '@/entities/ride/model'
import { formatDate, formatDuration, formatTime, statusColors } from '../_lib/constants'

export function RideSummary({ ride }: { ride: RideDetails }) {
  return (
    <>
      {/* Title & Status */}
      <div>
        <div className="flex items-start justify-between gap-4">
          <h1 className="text-2xl font-bold">{ride.title}</h1>
          <Badge className={statusColors[ride.status]}>{ride.status}</Badge>
        </div>
        {ride.clubId && (
          <Link href={`/clubs/${ride.clubId}`}>
            <Badge variant="outline" className="mt-2">
              Club ride
            </Badge>
          </Link>
        )}
      </div>

      {/* Quick Info */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Calendar className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Date</p>
              <p className="font-medium text-sm">{formatDate(ride.scheduledAt)}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Clock className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Time</p>
              <p className="font-medium text-sm">{formatTime(ride.scheduledAt)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Route Stats */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-4 gap-4 text-center">
            <div>
              <Route className="w-5 h-5 mx-auto text-muted-foreground mb-1" />
              <p className="font-semibold">{ride.distance ?? 0} km</p>
              <p className="text-xs text-muted-foreground">Distance</p>
            </div>
            <div>
              <Clock className="w-5 h-5 mx-auto text-muted-foreground mb-1" />
              <p className="font-semibold">{formatDuration(ride.duration ?? 0)}</p>
              <p className="text-xs text-muted-foreground">Duration</p>
            </div>
            <div>
              <Gauge className="w-5 h-5 mx-auto text-muted-foreground mb-1" />
              <p className="font-semibold">{ride.experienceLevel ?? 'N/A'}</p>
              <p className="text-xs text-muted-foreground">Level</p>
            </div>
            <div>
              <Mountain className="w-5 h-5 mx-auto text-muted-foreground mb-1" />
              <p className="font-semibold text-xs">{ride.pace ?? 'N/A'}</p>
              <p className="text-xs text-muted-foreground">Pace</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Location */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Meeting Point</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-start gap-3">
            <MapPin className="w-5 h-5 text-primary mt-0.5" />
            <div className="flex-1">
              <p className="font-medium">{ride.startLocation}</p>
              {ride.endLocation && (
                <p className="text-sm text-muted-foreground mt-0.5">
                  to {ride.endLocation}
                </p>
              )}
              <Button variant="link" className="h-auto p-0 text-sm">
                Open in Maps
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  )
}
