'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  MapPin,
  Users,
  Calendar,
  Clock,
  ChevronRight,
  Plus,
  Navigation,
  Loader2,
} from 'lucide-react'
import Link from 'next/link'
import { useRides } from '@/store/features/rides'
import { Ride } from '@/store/slices/ridesSlice'
import { PhantomLoader } from '@/components/loading/phantom-loader'

function formatDate(dateString: string) {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
}

function formatTime(dateString: string) {
  const date = new Date(dateString)
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  })
}

function formatDuration(minutes: number) {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  if (hours === 0) return `${mins}min`
  if (mins === 0) return `${hours}h`
  return `${hours}h ${mins}min`
}

type TabType = 'upcoming' | 'my' | 'past'

export default function RidesPage() {
  const [activeTab, setActiveTab] = useState<TabType>('upcoming')
  const {
    upcomingRides,
    myRides,
    pastRides,
    isLoading,
    fetchUpcomingRides,
    fetchMyRides,
    fetchPastRides,
  } = useRides()
  const [activeRide, _setActiveRide] = useState<Ride | null>(null)

  useEffect(() => {
    fetchUpcomingRides(1)
    fetchMyRides(1)
    fetchPastRides(1)
  }, [fetchMyRides, fetchPastRides, fetchUpcomingRides])

  const _currentRides =
    activeTab === 'upcoming' ? upcomingRides : activeTab === 'my' ? myRides : pastRides

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* Active Ride Banner */}
      {activeRide && (
        <Link href={`/rides/${activeRide.id}`}>
          <Card className="bg-linear-to-r from-green-500 to-emerald-600 text-white mb-6 overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center animate-pulse">
                    <Navigation className="w-6 h-6" />
                  </div>
                  <div>
                    <Badge className="bg-white/20 text-white border-0 mb-1">
                      Live Now
                    </Badge>
                    <h3 className="font-semibold">{activeRide.title}</h3>
                    <p className="text-sm text-white/80">
                      {activeRide.participantsCount} riders on route
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-6 h-6" />
              </div>
            </CardContent>
          </Card>
        </Link>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        <Button
          variant={activeTab === 'upcoming' ? 'default' : 'outline'}
          onClick={() => setActiveTab('upcoming')}
          className="rounded-full whitespace-nowrap"
        >
          Upcoming
        </Button>
        <Button
          variant={activeTab === 'my' ? 'default' : 'outline'}
          onClick={() => setActiveTab('my')}
          className="rounded-full whitespace-nowrap"
        >
          My Rides
        </Button>
        <Button
          variant={activeTab === 'past' ? 'default' : 'outline'}
          onClick={() => setActiveTab('past')}
          className="rounded-full whitespace-nowrap"
        >
          Past
        </Button>
      </div>

      {isLoading ? (
        <PhantomLoader loading>
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="rounded-xl border bg-card p-4">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 bg-muted rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <div className="h-5 w-40 bg-muted rounded" />
                    <div className="h-4 w-24 bg-muted rounded" />
                    <div className="flex gap-3">
                      <div className="h-3 w-20 bg-muted rounded" />
                      <div className="h-3 w-24 bg-muted rounded" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </PhantomLoader>
      ) : (
        activeTab === 'upcoming' && (
          <div className="space-y-4">
            {upcomingRides.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <p>No upcoming rides. Check back later!</p>
              </div>
            ) : (
              upcomingRides.map((ride) => (
                <Link key={ride.id} href={`/rides/${ride.id}`}>
                  <Card className="hover:border-primary/50 transition-colors">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        {/* Date Badge */}
                        <div className="shrink-0 w-14 text-center">
                          <div className="bg-primary/10 rounded-lg p-2">
                            <div className="text-xs text-primary font-medium uppercase">
                              {formatDate(ride.scheduledAt).split(' ')[0]}
                            </div>
                            <div className="text-xl font-bold text-primary">
                              {new Date(ride.scheduledAt).getDate()}
                            </div>
                          </div>
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-semibold">{ride.title}</h3>
                              {ride.club && (
                                <Badge variant="outline" className="mt-1 text-[10px]">
                                  {ride.club.name}
                                </Badge>
                              )}
                            </div>
                            <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0" />
                          </div>

                          <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {formatTime(ride.scheduledAt)}
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {ride.startLocation.name}
                            </span>
                            {ride.estimatedDuration && (
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {formatDuration(ride.estimatedDuration)}
                              </span>
                            )}
                          </div>

                          {/* Participants */}
                          <div className="flex items-center justify-between mt-3">
                            <div className="flex items-center gap-2">
                              <div className="flex -space-x-2">
                                {[...Array(Math.min(4, ride.participantsCount))].map(
                                  (_, i) => (
                                    <Avatar
                                      key={i}
                                      className="w-6 h-6 border-2 border-background"
                                    >
                                      <AvatarFallback className="bg-muted text-[10px]">
                                        {String.fromCharCode(65 + i)}
                                      </AvatarFallback>
                                    </Avatar>
                                  ),
                                )}
                                {ride.participantsCount > 4 && (
                                  <div className="w-6 h-6 rounded-full bg-muted border-2 border-background flex items-center justify-center text-[10px]">
                                    +{ride.participantsCount - 4}
                                  </div>
                                )}
                              </div>
                              <span className="text-xs text-muted-foreground">
                                {ride.participantsCount}/{ride.maxParticipants} riders
                              </span>
                            </div>
                            <Button size="sm" className="rounded-full h-7 text-xs">
                              Join
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))
            )}

            <Separator className="my-6" />

            {/* Create Ride CTA */}
            <Card className="bg-linear-to-r from-primary/10 to-amber-100/50 border-primary/20">
              <CardContent className="p-6 text-center">
                <h3 className="font-semibold mb-2">Plan Your Own Ride</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Set the route, invite riders, and lead the convoy.
                </p>
                <Link href="/rides/create">
                  <Button className="gap-2">
                    <Plus className="w-4 h-4" />
                    Create Ride
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        )
      )}

      {activeTab === 'my' &&
        (myRides.length === 0 ? (
          <div className="text-center py-16">
            <Calendar className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
            <h3 className="font-semibold mb-2">No upcoming rides</h3>
            <p className="text-muted-foreground mb-4">
              Join a ride or create your own adventure!
            </p>
            <div className="flex gap-2 justify-center">
              <Button variant="outline" onClick={() => setActiveTab('upcoming')}>
                Browse Rides
              </Button>
              <Link href="/rides/create">
                <Button className="gap-2">
                  <Plus className="w-4 h-4" />
                  Create Ride
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {myRides.map((ride) => (
              <Link key={ride.id} href={`/rides/${ride.id}`}>
                <Card className="hover:border-primary/50 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold">{ride.title}</h3>
                        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                          <span>{formatDate(ride.scheduledAt)}</span>
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {ride.participantsCount} riders
                          </span>
                        </div>
                      </div>
                      <Badge variant={ride.status === 'active' ? 'default' : 'secondary'}>
                        {ride.status}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ))}

      {activeTab === 'past' &&
        (pastRides.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p>No past rides yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pastRides.map((ride) => (
              <Link key={ride.id} href={`/rides/${ride.id}`}>
                <Card className="hover:border-primary/50 transition-colors opacity-80">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold">{ride.title}</h3>
                        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                          <span>{formatDate(ride.scheduledAt)}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {ride.participantsCount} riders
                          </span>
                          {ride.distance && (
                            <>
                              <span>•</span>
                              <span>{ride.distance} km</span>
                            </>
                          )}
                        </div>
                      </div>
                      <Badge variant="secondary">Completed</Badge>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ))}
    </div>
  )
}
