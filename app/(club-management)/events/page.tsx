'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import {
  Calendar,
  MapPin,
  Users,
  Search,
  Plus,
  Ticket,
  Shield,
  Check,
  ChevronRight,
} from 'lucide-react'
import {
  useGetEventsQuery,
  useAttendEventMutation,
  useLeaveEventMutation,
} from '@/features/events/api'

const CATEGORIES = [
  { key: 'ALL', label: 'All Categories' },
  { key: 'MEETUP', label: 'Meetups & Breakfast Runs' },
  { key: 'TRACK_DAY', label: 'Track Days' },
  { key: 'RALLY', label: 'Rallies & Tours' },
  { key: 'WORKSHOP', label: 'Workshops & Training' },
  { key: 'TOUR', label: 'Night Rides & Cruises' },
]

export default function EventsPage() {
  const [category, setCategory] = useState('ALL')
  const [search, setSearch] = useState('')
  const [filterTab, setFilterTab] = useState<'all' | 'club' | 'my_rsvps'>('all')

  const { data, isLoading } = useGetEventsQuery({
    category: category === 'ALL' ? undefined : category,
    search: search.trim() || undefined,
    filter: filterTab === 'all' ? undefined : filterTab,
  })

  const [attendEvent] = useAttendEventMutation()
  const [leaveEvent] = useLeaveEventMutation()

  const events = data?.events || []

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-6 lg:p-10">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Strip */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-white font-[Josefin_Sans]">
                Motorcycle Events & Rallies
              </h1>
              <span className="bg-red-500/20 text-red-400 text-xs font-semibold px-2.5 py-1 rounded-full border border-red-500/30">
                LIVE
              </span>
            </div>
            <p className="text-zinc-400 text-sm mt-1">
              Discover official club meetups, track days, training workshops, and tours.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/events/my-tickets"
              className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-teal-400 border border-teal-500/30 px-4 py-2.5 rounded-xl font-medium text-sm transition"
            >
              <Ticket className="w-4 h-4" />
              <span>My Ticket Passes</span>
            </Link>

            <Link
              href="/events/create"
              className="flex items-center gap-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white px-5 py-2.5 rounded-xl font-semibold text-sm shadow-lg shadow-red-950/40 transition"
            >
              <Plus className="w-4 h-4" />
              <span>Host an Event</span>
            </Link>
          </div>
        </div>

        {/* Filter Controls & Search */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Tabs */}
          <div className="flex items-center gap-2 bg-white/5 p-1 rounded-xl border border-white/10 w-fit">
            <button
              onClick={() => setFilterTab('all')}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition ${
                filterTab === 'all'
                  ? 'bg-red-600 text-white shadow'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              All Events
            </button>
            <button
              onClick={() => setFilterTab('club')}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition ${
                filterTab === 'club'
                  ? 'bg-red-600 text-white shadow'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Club Exclusive
            </button>
            <button
              onClick={() => setFilterTab('my_rsvps')}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition ${
                filterTab === 'my_rsvps'
                  ? 'bg-red-600 text-white shadow'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              My RSVPs
            </button>
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              placeholder="Search event title, venue, city..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-red-500 transition"
            />
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {CATEGORIES.map((c) => (
            <button
              key={c.key}
              onClick={() => setCategory(c.key)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition border ${
                category === c.key
                  ? 'bg-white/15 border-white/30 text-white font-semibold'
                  : 'bg-white/[0.03] border-white/5 text-zinc-400 hover:text-white hover:border-white/15'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* Event Grid */}
        {isLoading ? (
          <div className="py-24 text-center">
            <div className="inline-block animate-spin w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full" />
            <p className="text-zinc-500 text-sm mt-3">Loading motorcycle events...</p>
          </div>
        ) : events.length === 0 ? (
          <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-16 text-center max-w-lg mx-auto">
            <Calendar className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">No Events Found</h3>
            <p className="text-zinc-400 text-sm mb-6">
              No upcoming events match your filters. Be the first to host an epic ride!
            </p>
            <Link
              href="/events/create"
              className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition"
            >
              <Plus className="w-4 h-4" />
              <span>Host First Event</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => {
              const eventDate = new Date(event.scheduledAt)
              const formattedDate = eventDate.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                weekday: 'short',
              })
              const time = eventDate.toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
              })
              const isFree = !event.price || event.price === 0

              return (
                <div
                  key={event.id}
                  className="group bg-gradient-to-b from-white/[0.07] to-white/[0.02] border border-white/10 hover:border-red-500/50 rounded-2xl overflow-hidden transition-all duration-300 flex flex-col justify-between shadow-xl"
                >
                  <div>
                    {/* Banner Image */}
                    <div className="relative h-48 w-full bg-zinc-900 overflow-hidden">
                      {event.bannerImage ? (
                        <img
                          src={event.bannerImage}
                          alt={event.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-tr from-zinc-950 via-zinc-900 to-red-950/40">
                          <Calendar className="w-12 h-12 text-zinc-700" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d0d] via-transparent to-black/40" />

                      {/* Top Badges */}
                      <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                        <span className="bg-black/60 backdrop-blur-md text-white text-[11px] font-bold px-2.5 py-1 rounded-lg border border-white/20 uppercase tracking-wider">
                          {event.category || 'EVENT'}
                        </span>
                        <span
                          className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border backdrop-blur-md ${
                            isFree
                              ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                              : 'bg-teal-500/20 border-teal-500/40 text-teal-300'
                          }`}
                        >
                          {isFree ? 'FREE' : `₹${event.price}`}
                        </span>
                      </div>

                      {/* Date Badge */}
                      <div className="absolute bottom-3 left-3 bg-black/80 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-xl flex items-center gap-2 text-xs">
                        <Calendar className="w-3.5 h-3.5 text-red-400" />
                        <span className="font-semibold text-white">{formattedDate}</span>
                        <span className="text-zinc-400">&bull; {time}</span>
                      </div>
                    </div>

                    {/* Body */}
                    <div className="p-5 space-y-3">
                      {event.club && (
                        <p className="text-xs text-teal-400 font-semibold flex items-center gap-1.5">
                          <Shield className="w-3.5 h-3.5" />
                          <span>{event.club.name}</span>
                        </p>
                      )}

                      <h3 className="text-lg font-bold text-white group-hover:text-red-400 transition leading-snug line-clamp-2">
                        {event.title}
                      </h3>

                      {event.location && (
                        <p className="text-xs text-zinc-400 flex items-center gap-1.5 line-clamp-1">
                          <MapPin className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                          <span>{event.location}</span>
                        </p>
                      )}

                      <div className="flex items-center gap-4 text-xs text-zinc-400 pt-2">
                        <span className="flex items-center gap-1">
                          <Users className="w-3.5 h-3.5 text-zinc-500" />
                          {event.participantCount} Going
                        </span>
                        {event.ticketsSold ? (
                          <span className="flex items-center gap-1 text-teal-400">
                            <Ticket className="w-3.5 h-3.5" />
                            {event.ticketsSold} Passes Booked
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </div>

                  {/* Footer Action */}
                  <div className="p-5 pt-0 flex items-center gap-2 border-t border-white/5 mt-4">
                    <Link
                      href={`/events/${event.id}`}
                      className="flex-1 text-center bg-white/5 hover:bg-white/10 text-white text-xs font-semibold py-2.5 rounded-xl border border-white/10 transition flex items-center justify-center gap-1"
                    >
                      <span>View Details</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>

                    {event.isHost ? (
                      <Link
                        href={`/events/${event.id}/manage`}
                        className="bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/30 text-xs font-bold px-3 py-2.5 rounded-xl transition"
                      >
                        Manage
                      </Link>
                    ) : (
                      <button
                        onClick={() => {
                          if (event.isAttending) leaveEvent(event.id)
                          else attendEvent(event.id)
                        }}
                        className={`text-xs font-bold px-3.5 py-2.5 rounded-xl transition flex items-center gap-1 ${
                          event.isAttending
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30'
                            : 'bg-red-600 hover:bg-red-500 text-white'
                        }`}
                      >
                        {event.isAttending ? <Check className="w-3.5 h-3.5" /> : null}
                        <span>{event.isAttending ? 'Going' : 'RSVP'}</span>
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
