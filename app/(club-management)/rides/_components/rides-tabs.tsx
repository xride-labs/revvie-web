'use client'

import { useMemo, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { MapPin, Users, Calendar, Clock, ChevronRight, Plus } from 'lucide-react'
import Link from 'next/link'
import type { Ride } from '@/entities/ride/model'
import type { RideSummary } from '@/features/rides/schemas'

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

type TabType = 'upcoming' | 'my' | 'past'

const STATUS_LABEL: Record<RideSummary['status'], string> = {
  PLANNED: 'Planned',
  IN_PROGRESS: 'Live',
  PAUSED: 'Paused',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
}

/**
 * Tab toggle and list rendering only — both `upcomingRides` and `mineRides` arrive as
 * props, fetched once on the server before this component mounts (see `page.tsx`).
 */
export function RidesTabs({
  upcomingRides,
  mineRides,
}: {
  upcomingRides: Ride[]
  mineRides: RideSummary[]
}) {
  const [activeTab, setActiveTab] = useState<TabType>('upcoming')

  const myRides = useMemo(
    () => mineRides.filter((r) => r.status !== 'COMPLETED' && r.status !== 'CANCELLED'),
    [mineRides],
  )
  const pastRides = useMemo(
    () => mineRides.filter((r) => r.status === 'COMPLETED' || r.status === 'CANCELLED'),
    [mineRides],
  )

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Rides</h1>
        <p className="text-text-secondary">
          Join upcoming events or review your past journeys.
        </p>
      </div>

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

      {activeTab === 'upcoming' && (
        <div className="relative pl-6 md:pl-0">
          {/* Timeline vertical line */}
          <div className="hidden md:block absolute left-1/2 top-4 bottom-4 w-px bg-white/10 -translate-x-1/2" />
          <div className="md:hidden absolute left-3 top-4 bottom-4 w-px bg-white/10 -translate-x-1/2" />

          {upcomingRides.length === 0 ? (
            <div className="text-center py-12 text-text-secondary relative z-10">
              <p>No upcoming rides. Check back later!</p>
            </div>
          ) : (
            <div className="space-y-8">
              {upcomingRides.map((ride, index) => {
                const isEven = index % 2 === 0
                return (
                  <div
                    key={ride.id}
                    className="relative md:flex md:items-center md:justify-between group"
                  >
                    {/* Timeline dot */}
                    <div className="absolute left-[-12px] md:left-1/2 top-8 md:top-1/2 w-4 h-4 rounded-full border-2 border-[#0a0a0a] bg-brand-red-light md:-translate-x-1/2 md:-translate-y-1/2 z-10 shadow-[0_0_12px_rgba(229,0,0,0.6)] group-hover:scale-125 group-hover:bg-white transition-all duration-300" />

                    <div
                      className={`w-full md:w-[calc(50%-2.5rem)] ${isEven ? 'md:pr-0 md:text-right' : 'md:pl-0 md:ml-auto'}`}
                    >
                      <Link href={`/rides/${ride.id}`} className="block">
                        <Card className="rounded-3xl border-white/[0.07] bg-[#111]/80 backdrop-blur-xl overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.4),inset_0_1px_1px_rgba(255,255,255,0.05)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_48px_rgba(229,0,0,0.15)] hover:border-brand-red-light/30 relative">
                          <CardContent className="p-6">
                            <div
                              className={`flex items-start gap-5 ${isEven ? 'md:flex-row-reverse' : ''}`}
                            >
                              {/* Date Badge */}
                              <div className="shrink-0 w-16 text-center">
                                <div className="bg-brand-red-light/10 rounded-2xl p-2.5 border border-brand-red-light/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]">
                                  <div className="text-[10px] text-brand-red-light font-bold uppercase tracking-wider mb-0.5">
                                    {formatDate(ride.scheduledAt).split(' ')[0]}
                                  </div>
                                  <div className="text-2xl font-black text-brand-red-light leading-none">
                                    {new Date(ride.scheduledAt).getDate()}
                                  </div>
                                </div>
                              </div>

                              <div
                                className={`flex-1 min-w-0 ${isEven ? 'md:text-right' : ''}`}
                              >
                                <div
                                  className={`flex items-start justify-between ${isEven ? 'md:flex-row-reverse' : ''}`}
                                >
                                  <div>
                                    <h3 className="font-bold text-lg text-white group-hover:text-brand-red-light transition-colors leading-tight">
                                      {ride.title}
                                    </h3>
                                    <Badge
                                      variant="outline"
                                      className={`mt-2 text-[10px] border-white/10 bg-white/5 text-text-secondary ${isEven ? 'md:ml-auto md:mr-0' : ''}`}
                                    >
                                      {ride.creator.name}
                                    </Badge>
                                  </div>
                                  <ChevronRight
                                    className={`w-5 h-5 text-text-secondary/30 group-hover:text-brand-red-light transition-all ${isEven ? 'rotate-180 group-hover:-translate-x-1' : 'group-hover:translate-x-1'}`}
                                  />
                                </div>

                                <div
                                  className={`flex flex-wrap items-center gap-3 mt-4 pt-4 border-t border-white/5 text-[11px] text-text-secondary ${isEven ? 'md:justify-end' : ''}`}
                                >
                                  <span className="flex items-center gap-1.5">
                                    <Clock className="w-3.5 h-3.5 text-white/30" />
                                    <span className="text-white/70 font-medium">
                                      {formatTime(ride.scheduledAt)}
                                    </span>
                                  </span>
                                  <span className="flex items-center gap-1.5">
                                    <MapPin className="w-3.5 h-3.5 text-white/30" />
                                    <span className="text-white/70 truncate max-w-[120px] font-medium">
                                      {ride.startLocation}
                                    </span>
                                  </span>
                                  {ride._count?.participants !== undefined && (
                                    <span className="flex items-center gap-1.5">
                                      <Users className="w-3.5 h-3.5 text-white/30" />
                                      <span className="text-white/70 font-medium">
                                        {ride._count.participants} riders
                                      </span>
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    </div>
                  </div>
                )
              })}
            </div>
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
      )}

      {activeTab === 'my' && (
        <>
          {myRides.length === 0 ? (
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
                          </div>
                        </div>
                        <Badge
                          variant={
                            ride.status === 'IN_PROGRESS' ? 'default' : 'secondary'
                          }
                        >
                          {STATUS_LABEL[ride.status]}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </>
      )}

      {activeTab === 'past' && (
        <>
          {pastRides.length === 0 ? (
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
                          </div>
                        </div>
                        <Badge variant="secondary">{STATUS_LABEL[ride.status]}</Badge>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
