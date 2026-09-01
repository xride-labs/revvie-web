'use client'

import React from 'react'
import Link from 'next/link'
import {
  Ticket,
  Calendar,
  MapPin,
  ArrowLeft,
  ExternalLink,
} from 'lucide-react'
import { useGetMyTicketsQuery } from '@/features/events/api'

export default function MyTicketsPage() {
  const { data: tickets, isLoading } = useGetMyTicketsQuery()

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-6 lg:p-10">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-6">
          <div className="flex items-center gap-4">
            <Link
              href="/events"
              className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white transition"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-white font-[Josefin_Sans]">
                My Ticket Passes
              </h1>
              <p className="text-zinc-400 text-xs mt-0.5">
                Official digital event passes with high-resolution entry QR codes.
              </p>
            </div>
          </div>
        </div>

        {/* Passes List */}
        {isLoading ? (
          <div className="py-24 text-center">
            <div className="inline-block animate-spin w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full" />
            <p className="text-zinc-500 text-sm mt-3">Loading your event passes...</p>
          </div>
        ) : !tickets || tickets.length === 0 ? (
          <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-16 text-center max-w-lg mx-auto">
            <Ticket className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">No Active Passes</h3>
            <p className="text-zinc-400 text-sm mb-6">
              You haven&apos;t booked any event tickets yet. Check out upcoming meetups, track days, and rallies!
            </p>
            <Link
              href="/events"
              className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition"
            >
              <span>Explore Events</span>
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {tickets.map((ticket) => {
              const event = ticket.event
              const eventDate = event ? new Date(event.scheduledAt) : null
              const isUsed = ticket.status === 'USED'
              const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(
                ticket.ticketCode
              )}&margin=1`

              return (
                <div
                  key={ticket.id}
                  className={`bg-gradient-to-b from-white/[0.07] to-white/[0.02] border rounded-3xl overflow-hidden shadow-2xl transition ${
                    isUsed ? 'border-white/10 opacity-75' : 'border-red-500/40'
                  }`}
                >
                  {/* Top Strip */}
                  <div className="bg-black/60 px-6 py-4 border-b border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Ticket className={`w-5 h-5 ${isUsed ? 'text-zinc-500' : 'text-red-400'}`} />
                      <span className="font-bold text-sm text-white uppercase tracking-wider">
                        {ticket.tier?.name || 'Official Entry Pass'}
                      </span>
                    </div>
                    <span
                      className={`text-xs font-bold px-3 py-1 rounded-full border ${
                        isUsed
                          ? 'bg-zinc-800 border-zinc-700 text-zinc-400'
                          : 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                      }`}
                    >
                      {isUsed ? 'CHECKED IN' : 'READY FOR GATE ADMISSION'}
                    </span>
                  </div>

                  <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                    {/* Left: Event Details */}
                    <div className="md:col-span-2 space-y-3">
                      <h3 className="text-xl font-bold text-white">{event?.title || 'Motorcycle Event'}</h3>

                      <div className="space-y-1.5 text-xs text-zinc-300">
                        {eventDate && (
                          <p className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-red-400" />
                            <span>
                              {eventDate.toLocaleDateString('en-US', {
                                weekday: 'short',
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              })}{' '}
                              at {eventDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                            </span>
                          </p>
                        )}
                        {event?.location && (
                          <p className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-teal-400 shrink-0" />
                            <span>{event.location}</span>
                          </p>
                        )}
                      </div>

                      <div className="pt-2 flex items-center gap-3">
                        <Link
                          href={`/events/${event?.id}`}
                          className="text-xs text-teal-400 hover:underline flex items-center gap-1"
                        >
                          <span>Event Details Page</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>

                    {/* Right: Scannable QR Pass */}
                    <div className="flex flex-col items-center justify-center bg-black/80 p-5 rounded-2xl border border-white/10">
                      <div className="bg-white p-2.5 rounded-xl border-2 border-red-500/60 shadow-lg">
                        <img src={qrUrl} alt="Pass QR Code" className="w-36 h-36" />
                      </div>
                      <p className="font-mono text-xs font-bold tracking-widest text-zinc-200 mt-3">
                        {ticket.ticketCode}
                      </p>
                      <p className="text-[10px] text-zinc-500 mt-1 text-center">
                        Present this QR code for gate admission
                      </p>
                    </div>
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
