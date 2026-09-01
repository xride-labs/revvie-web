'use client'

import React, { use, useState } from 'react'
import Link from 'next/link'
import {
  Calendar,
  MapPin,
  Ticket,
  Check,
  CreditCard,
  Banknote,
  ArrowLeft,
} from 'lucide-react'
import {
  useGetEventQuery,
  useBookTicketMutation,
  useAttendEventMutation,
  useLeaveEventMutation,
} from '@/features/events/api'
import type { TicketTier } from '@/features/events/schemas'

export default function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { data: event, isLoading } = useGetEventQuery(id)
  const [bookTicket, { isLoading: isBooking }] = useBookTicketMutation()
  const [attendEvent] = useAttendEventMutation()
  const [leaveEvent] = useLeaveEventMutation()

  const [selectedTier, setSelectedTier] = useState<TicketTier | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'CASH' | 'FREE'>('UPI')
  const [upiRef, setUpiRef] = useState('')
  const [bookedSuccess, setBookedSuccess] = useState(false)

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full" />
      </div>
    )
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center p-6 text-white text-center">
        <h2 className="text-xl font-bold mb-2">Event Not Found</h2>
        <Link href="/events" className="text-red-400 hover:underline text-sm">
          Return to Events Discovery
        </Link>
      </div>
    )
  }

  const activeTier = selectedTier || (event.ticketTiers && event.ticketTiers[0]) || null
  const unitPrice = activeTier ? activeTier.price : (event.price || 0)
  const isFree = unitPrice === 0
  const totalAmount = unitPrice * quantity

  const handleBook = async () => {
    try {
      await bookTicket({
        eventId: event.id,
        data: {
          tierId: activeTier?.id,
          quantity,
          paymentMethod: isFree ? 'FREE' : paymentMethod,
          upiTransactionRef: paymentMethod === 'UPI' ? upiRef : undefined,
        },
      }).unwrap()

      setBookedSuccess(true)
    } catch (err: any) {
      alert(err?.data?.message || 'Failed to book tickets.')
    }
  }

  const startDate = new Date(event.scheduledAt)
  const formattedDate = startDate.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
  const startTime = startDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-6 lg:p-10">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Navigation Bar */}
        <div className="flex items-center justify-between">
          <Link
            href="/events"
            className="flex items-center gap-2 text-zinc-400 hover:text-white text-xs font-semibold uppercase tracking-wider transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Events</span>
          </Link>

          {event.isHost && (
            <Link
              href={`/events/${event.id}/manage`}
              className="bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/40 text-xs font-bold px-4 py-2 rounded-xl transition"
            >
              Organiser Dashboard & Scanner →
            </Link>
          )}
        </div>

        {/* Hero Section */}
        <div className="relative h-72 lg:h-96 w-full rounded-3xl overflow-hidden border border-white/10 shadow-2xl bg-zinc-900">
          {event.bannerImage ? (
            <img src={event.bannerImage} alt={event.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-tr from-zinc-950 via-zinc-900 to-red-950/40">
              <Calendar className="w-20 h-20 text-zinc-800" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-black/40 to-transparent" />

          {/* Banner Overlays */}
          <div className="absolute bottom-6 left-6 right-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="bg-red-600/90 text-white text-xs font-bold px-3 py-1 rounded-lg uppercase tracking-wider">
                  {event.category || 'EVENT'}
                </span>
                <span className="bg-white/10 backdrop-blur-md text-white text-xs font-semibold px-3 py-1 rounded-lg">
                  {event.visibility === 'PUBLIC' ? '🌐 Public Event' : '🛡️ Club Only'}
                </span>
              </div>
              <h1 className="text-2xl lg:text-4xl font-bold tracking-tight text-white font-[Josefin_Sans]">
                {event.title}
              </h1>
            </div>
          </div>
        </div>

        {/* Main Content & Booking Split Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Schedule & Venue Card */}
            <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 shrink-0">
                  <Calendar className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Date & Time</h3>
                  <p className="text-zinc-300 text-sm mt-0.5">{formattedDate}</p>
                  <p className="text-zinc-500 text-xs mt-0.5">{startTime}</p>
                </div>
              </div>

              {event.location && (
                <div className="flex items-start gap-4 pt-4 border-t border-white/5">
                  <div className="w-12 h-12 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 shrink-0">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">Venue / Assembly</h3>
                    <p className="text-zinc-300 text-sm mt-0.5">{event.location}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Description */}
            {event.description && (
              <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 space-y-3">
                <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wider">
                  About this Event
                </h3>
                <p className="text-zinc-300 text-sm leading-relaxed whitespace-pre-line">
                  {event.description}
                </p>
              </div>
            )}

            {/* Available Ticket Tiers */}
            {event.ticketTiers && event.ticketTiers.length > 0 && (
              <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 space-y-4">
                <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wider">
                  Ticket Passes & Tiers
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {event.ticketTiers.map((tier) => (
                    <div
                      key={tier.id}
                      className="bg-white/[0.02] border border-white/10 rounded-xl p-4 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-white text-sm">{tier.name}</h4>
                        <span className="text-teal-400 font-bold text-sm">
                          {tier.price === 0 ? 'FREE' : `₹${tier.price}`}
                        </span>
                      </div>
                      {tier.description && (
                        <p className="text-zinc-400 text-xs">{tier.description}</p>
                      )}
                      <p className="text-zinc-500 text-[11px]">
                        {tier.availableQuantity} passes remaining
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Instant Booking Card */}
          <div>
            <div className="bg-gradient-to-b from-white/[0.08] to-white/[0.02] border border-white/15 rounded-3xl p-6 space-y-6 shadow-2xl sticky top-8">
              {bookedSuccess ? (
                <div className="text-center py-8 space-y-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto">
                    <Check className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold text-white">Booking Confirmed!</h3>
                  <p className="text-zinc-400 text-xs leading-relaxed">
                    Your digital pass with gate check-in QR codes has been generated and sent to your email.
                  </p>
                  <Link
                    href="/events/my-tickets"
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-500 hover:to-teal-600 text-white font-bold text-xs px-5 py-3 rounded-xl transition shadow-lg shadow-teal-950/50"
                  >
                    <Ticket className="w-4 h-4" />
                    <span>View in My Ticket Passes</span>
                  </Link>
                </div>
              ) : (
                <>
                  <div>
                    <h3 className="text-lg font-bold text-white">Book Passes & Tickets</h3>
                    <p className="text-zinc-400 text-xs mt-1">
                      Select your ticket tier and payment method.
                    </p>
                  </div>

                  {/* Tier Selection */}
                  {event.ticketTiers && event.ticketTiers.length > 0 && (
                    <div className="space-y-2">
                      <label className="block text-xs font-semibold text-zinc-400">
                        Choose Pass Tier
                      </label>
                      <div className="space-y-2">
                        {event.ticketTiers.map((tier) => {
                          const active = (activeTier?.id || event.ticketTiers![0].id) === tier.id
                          return (
                            <button
                              key={tier.id}
                              type="button"
                              onClick={() => setSelectedTier(tier)}
                              className={`w-full p-3 rounded-xl border text-left transition flex items-center justify-between ${
                                active
                                  ? 'bg-red-500/10 border-red-500/60 text-white'
                                  : 'bg-white/5 border-white/10 text-zinc-300 hover:border-white/20'
                              }`}
                            >
                              <div>
                                <p className="font-bold text-xs">{tier.name}</p>
                                <p className="text-[11px] text-zinc-400">{tier.availableQuantity} left</p>
                              </div>
                              <span className="font-bold text-sm text-teal-400">
                                {tier.price === 0 ? 'FREE' : `₹${tier.price}`}
                              </span>
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {/* Quantity Stepper */}
                  <div className="flex items-center justify-between bg-white/5 p-3 rounded-xl border border-white/10">
                    <span className="text-xs font-semibold text-zinc-300">Passes Count</span>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="w-7 h-7 rounded-lg bg-white/10 text-white flex items-center justify-center font-bold text-xs"
                      >
                        -
                      </button>
                      <span className="font-bold text-sm text-white">{quantity}</span>
                      <button
                        type="button"
                        onClick={() => setQuantity(Math.min(5, quantity + 1))}
                        className="w-7 h-7 rounded-lg bg-white/10 text-white flex items-center justify-center font-bold text-xs"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Payment Method */}
                  {!isFree && (
                    <div className="space-y-2">
                      <label className="block text-xs font-semibold text-zinc-400">
                        Payment Method
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setPaymentMethod('UPI')}
                          className={`p-3 rounded-xl border text-center transition ${
                            paymentMethod === 'UPI'
                              ? 'bg-teal-500/15 border-teal-500 text-teal-300 font-bold'
                              : 'bg-white/5 border-white/10 text-zinc-400'
                          }`}
                        >
                          <CreditCard className="w-4 h-4 mx-auto mb-1" />
                          <span className="text-xs">UPI / GPay</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setPaymentMethod('CASH')}
                          className={`p-3 rounded-xl border text-center transition ${
                            paymentMethod === 'CASH'
                              ? 'bg-red-500/15 border-red-500 text-red-300 font-bold'
                              : 'bg-white/5 border-white/10 text-zinc-400'
                          }`}
                        >
                          <Banknote className="w-4 h-4 mx-auto mb-1" />
                          <span className="text-xs">Cash at Gate</span>
                        </button>
                      </div>

                      {paymentMethod === 'UPI' && (
                        <input
                          type="text"
                          placeholder="UPI Ref / UTR Number (Optional)"
                          value={upiRef}
                          onChange={(e) => setUpiRef(e.target.value)}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500"
                        />
                      )}
                    </div>
                  )}

                  {/* Pricing Total */}
                  <div className="border-t border-white/10 pt-4 space-y-2 text-xs">
                    <div className="flex justify-between text-zinc-400">
                      <span>Pass Price ({quantity}x)</span>
                      <span className="text-white">{isFree ? 'FREE' : `₹${totalAmount}`}</span>
                    </div>
                    <div className="flex justify-between text-zinc-400">
                      <span>Platform Convenience Fee</span>
                      <span className="text-emerald-400 font-semibold">FREE</span>
                    </div>
                    <div className="flex justify-between text-base font-bold text-white pt-2 border-t border-white/5">
                      <span>Total Amount</span>
                      <span className="text-emerald-400">{isFree ? 'FREE' : `₹${totalAmount}`}</span>
                    </div>
                  </div>

                  {/* Booking CTA */}
                  <button
                    type="button"
                    disabled={isBooking}
                    onClick={handleBook}
                    className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 disabled:opacity-50 text-white py-3.5 rounded-xl font-bold text-sm shadow-xl shadow-red-950/50 transition flex items-center justify-center gap-2"
                  >
                    <Ticket className="w-4 h-4" />
                    <span>
                      {isBooking
                        ? 'Issuing Passes...'
                        : isFree
                        ? 'Confirm Free Pass'
                        : `Pay ₹${totalAmount} & Get Passes`}
                    </span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
