import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Calendar, Ticket, Plus, MapPin, Users } from 'lucide-react'
import { useGetEventsQuery } from '@/features/events/api'

export function EventsTab({ clubId, isOwner }: { clubId: string; isOwner: boolean }) {
  const { data, isLoading } = useGetEventsQuery({ clubId })
  const events = data?.events || []

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Club Events & Rallies</CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              Official meetups, track sessions, and training events organized by this club.
            </p>
          </div>
          {isOwner && (
            <Link href={`/events/create?clubId=${clubId}`}>
              <Button size="sm" className="bg-red-600 hover:bg-red-500 text-white flex items-center gap-1.5 cursor-pointer">
                <Plus className="w-3.5 h-3.5" />
                <span>Host Event</span>
              </Button>
            </Link>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="py-12 text-center text-xs text-muted-foreground">Loading club events...</div>
        ) : events.length === 0 ? (
          <div className="py-12 text-center text-xs text-muted-foreground space-y-3">
            <Calendar className="w-8 h-8 mx-auto text-muted-foreground/40" />
            <p>No upcoming events scheduled for this club yet.</p>
            {isOwner && (
              <Link href={`/events/create?clubId=${clubId}`}>
                <Button size="sm" variant="outline" className="text-xs">
                  Create First Event
                </Button>
              </Link>
            )}
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {events.map((event) => {
              const dateObj = new Date(event.scheduledAt)
              const formattedDate = dateObj.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })
              const isFree = !event.price || event.price === 0

              return (
                <div
                  key={event.id}
                  className="p-4 rounded-xl border hover:border-red-500/40 transition-colors flex flex-col justify-between gap-3 bg-muted/20"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-red-400">
                        {event.category || 'MEETUP'}
                      </span>
                      <span className="text-xs font-bold text-emerald-400">
                        {isFree ? 'FREE' : `₹${event.price}`}
                      </span>
                    </div>

                    <h4 className="font-bold text-sm text-foreground mt-1 line-clamp-1">
                      {event.title}
                    </h4>

                    {event.location && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1 line-clamp-1">
                        <MapPin className="w-3 h-3 shrink-0" />
                        <span>{event.location}</span>
                      </p>
                    )}

                    <p className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-red-400" />
                      <span>{formattedDate}</span>
                    </p>
                  </div>

                  <div className="pt-2 border-t border-border/50 flex items-center justify-between">
                    <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      <span>{event.participantCount} going</span>
                    </span>

                    <Link href={`/events/${event.id}`}>
                      <Button size="sm" variant="default" className="text-xs h-7 px-3 bg-red-600 hover:bg-red-500 text-white cursor-pointer">
                        <Ticket className="w-3 h-3 mr-1" />
                        <span>Book Pass</span>
                      </Button>
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
