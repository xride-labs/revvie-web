import { Card, CardContent } from '@/components/ui/card'
import { Star } from 'lucide-react'
import type { ClubWithRides } from '../_lib/types'

export function StatsRow({ club, rideCount }: { club: ClubWithRides; rideCount: number }) {
  return (
    <div className="px-4 lg:px-6 mt-6">
      <div className="grid grid-cols-3 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">{club.memberCount}</p>
            <p className="text-sm text-muted-foreground">Members</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            {/* `club.ridesCount` does not exist upstream and rendered blank. The rides
                for this club are already fetched alongside the club itself. */}
            <p className="text-2xl font-bold">{rideCount}</p>
            <p className="text-sm text-muted-foreground">Rides</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">{club.trophyCount}</p>
            <p className="text-sm text-muted-foreground">Trophies</p>
          </CardContent>
        </Card>
        <Card className="hidden md:block">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold flex items-center justify-center gap-1">
              <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
              {club.reputation}
            </p>
            <p className="text-sm text-muted-foreground">Rating</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
