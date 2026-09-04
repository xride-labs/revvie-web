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
  Users,
  Shield,
  Clock,
  Sparkles,
  QrCode,
  Copy,
  ExternalLink,
  ChevronRight,
  AlertCircle,
  Share2,
  X,
} from 'lucide-react'
import { toast } from 'sonner'
import {
  useGetEventQuery,
  useBookTicketMutation,
} from '@/features/events/api'
import type { TicketTier, EventTicket } from '@/features/events/schemas'

function launchConfetti() {
  import('canvas-confetti').then(({ default: confetti }) => {
    const count = 200
    const defaults = { origin: { y: 0.7 } }

    function fire(particleRatio: number, opts: Parameters<typeof confetti>[0]) {
      confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * particleRatio),
      })
    }

    fire(0.25, { spread: 26, startVelocity: 55 })
    fire(0.2, { spread: 60 })
    fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 })
    fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 })
    fire(0.1, { spread: 120, startVelocity: 45 })
  }).catch(() => {})
}

export default function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { data: event, isLoading } = useGetEventQuery(id)
  const [bookTicket, { isLoading: isBooking }] = useBookTicketMutation()

  const [selectedTier, setSelectedTier] = useState<TicketTier | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'CASH' | 'FREE'>('UPI')
  const [upiRef, setUpiRef] = useState('')
  const [buyerName, setBuyerName] = useState('')
  const [buyerPhone, setBuyerPhone] = useState('')
  const [bookedResult, setBookedResult] = useState<{
    order: any
    tickets: EventTicket[]
  } | null>(null)
  const [copiedUpi, setCopiedUpi] = useState(false)

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
  const maxAllowed = activeTier ? Math.min(activeTier.maxPerUser, activeTier.availableQuantity) : 5

  const upiId = 'revvie@upi'
  const upiPayUrl = `upi://pay?pa=${upiId}&pn=Revvie%20Events&am=${totalAmount}&tn=Passes%20for%20${encodeURIComponent(event.title)}`
  const upiQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(upiPayUrl)}&margin=1`

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(upiId)
    setCopiedUpi(true)
    toast.success('UPI ID copied to clipboard!')
    setTimeout(() => setCopiedUpi(false), 2000)
  }

  const handleOpenCheckout = () => {
    if (activeTier && activeTier.availableQuantity <= 0) {
      toast.error('Selected tier is sold out.')
      return
    }
    setIsCheckoutOpen(true)
  }

  const handleConfirmBooking = async () => {
    try {
      const res = await bookTicket({
        eventId: event.id,
        data: {
          tierId: activeTier?.id,
          quantity,
          paymentMethod: isFree ? 'FREE' : paymentMethod,
          upiTransactionRef: paymentMethod === 'UPI' ? upiRef.trim() || undefined : undefined,
        },
      }).unwrap()

      setBookedResult(res)
      setIsCheckoutOpen(false)
      launchConfetti()
      toast.success('Passes booked! QR ticket issued.')
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to book tickets. Please try again.')
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

          <div className="flex items-center gap-3">
            <Link
              href="/events/my-tickets"
              className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-teal-400 border border-teal-500/30 px-3.5 py-1.5 rounded-xl font-medium text-xs transition"
            >
              <Ticket className="w-3.5 h-3.5" />
              <span>Ticket Passes Wallet</span>
            </Link>

            {event.isHost && (
              <Link
                href={`/events/${event.id}/manage`}
                className="bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/40 text-xs font-bold px-4 py-1.5 rounded-xl transition"
              >
                Organiser Dashboard & Gate Scanner →
              </Link>
            )}
          </div>
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
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-black/50 to-transparent" />

          {/* Banner Overlays */}
          <div className="absolute bottom-6 left-6 right-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-2 max-w-2xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-lg uppercase tracking-wider">
                  {event.category || 'MEETUP'}
                </span>
                <span className="bg-white/10 backdrop-blur-md text-white text-xs font-semibold px-3 py-1 rounded-lg border border-white/10">
                  {event.visibility === 'PUBLIC' ? '🌐 Public Event' : '🛡️ Club Only'}
                </span>
                {event.club && (
                  <span className="bg-white/10 backdrop-blur-md text-zinc-300 text-xs font-medium px-3 py-1 rounded-lg border border-white/10">
                    Hosted by {event.club.name}
                  </span>
                )}
              </div>
              <h1 className="text-2xl lg:text-4xl font-bold tracking-tight text-white font-[Josefin_Sans]">
                {event.title}
              </h1>
            </div>

            <div className="bg-black/60 backdrop-blur-md border border-white/15 rounded-2xl px-5 py-3 text-right">
              <span className="text-xs text-zinc-400 uppercase tracking-wider block">Passes Starting At</span>
              <span className="text-2xl font-black text-emerald-400">
                {isFree ? 'FREE' : `₹${unitPrice}`}
              </span>
            </div>
          </div>
        </div>

        {/* Success Confirmation Card (When ticket just booked) */}
        {bookedResult && (
          <div className="bg-gradient-to-br from-emerald-950/30 via-black to-zinc-950 border-2 border-emerald-500/50 rounded-3xl p-6 lg:p-8 shadow-2xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-emerald-500/20 pb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center">
                  <Check className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Booking Confirmed! Entry Passes Issued</h3>
                  <p className="text-emerald-400 text-xs">
                    Order #{bookedResult.order.orderNumber} &bull; Confirmation email with digital boarding pass sent.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Link
                  href="/events/my-tickets"
                  className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition flex items-center gap-2 shadow"
                >
                  <Ticket className="w-4 h-4" />
                  <span>Open Ticket Wallet</span>
                </Link>
              </div>
            </div>

            {/* Render First Issued Pass */}
            {bookedResult.tickets.length > 0 && (
              <div className="max-w-xl mx-auto bg-black/60 border border-white/15 rounded-3xl p-6 shadow-xl flex flex-col sm:flex-row items-center gap-6">
                <div className="w-40 h-40 bg-white p-2 rounded-2xl shrink-0 shadow-lg">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(
                      bookedResult.tickets[0].ticketCode
                    )}&margin=1`}
                    alt="Ticket QR"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="space-y-2 text-center sm:text-left">
                  <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">
                    Official Digital Gate Pass
                  </span>
                  <h4 className="font-bold text-lg text-white">{event.title}</h4>
                  <p className="text-zinc-400 text-xs">{formattedDate} &bull; {startTime}</p>
                  <div className="pt-2">
                    <span className="text-xs text-zinc-500 block">Unique Gate Pass Code:</span>
                    <span className="font-mono text-sm font-bold text-teal-300 tracking-widest">
                      {bookedResult.tickets[0].ticketCode}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Main Content & Booking Split Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Details & Tiers */}
          <div className="lg:col-span-2 space-y-6">
            {/* Schedule & Venue Card */}
            <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 shrink-0">
                  <Calendar className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Date & Assembly Time</h3>
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
                    <h3 className="text-base font-bold text-white">Venue / Route Flag-off</h3>
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

            {/* Buzzr-Grade Ticket Tiers Selector Grid */}
            <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                    Select Your Pass Tier
                  </h3>
                  <p className="text-zinc-400 text-xs mt-0.5">
                    Official admission passes issued directly to your Revvie ticket wallet.
                  </p>
                </div>
                <span className="text-xs text-zinc-500">
                  {event.ticketTiers?.length || 1} available tier{event.ticketTiers?.length === 1 ? '' : 's'}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(event.ticketTiers && event.ticketTiers.length > 0
                  ? event.ticketTiers
                  : [
                      {
                        id: 'general',
                        name: 'General Rider Pass',
                        price: event.price || 0,
                        availableQuantity: 100,
                        quantity: 100,
                        maxPerUser: 5,
                        description: 'Official admission pass for the rally & meetup.',
                      },
                    ]
                ).map((tier) => {
                  const isSelected = activeTier?.id === tier.id
                  const isSoldOut = tier.availableQuantity <= 0
                  const isFewLeft = tier.availableQuantity > 0 && tier.availableQuantity <= 10

                  return (
                    <div
                      key={tier.id}
                      onClick={() => !isSoldOut && setSelectedTier(tier as any)}
                      className={`relative rounded-2xl p-5 border transition cursor-pointer flex flex-col justify-between gap-4 ${
                        isSoldOut
                          ? 'bg-zinc-900/40 border-white/5 opacity-50 cursor-not-allowed'
                          : isSelected
                          ? 'bg-gradient-to-b from-red-600/15 to-transparent border-red-500 shadow-xl shadow-red-950/30 ring-1 ring-red-500'
                          : 'bg-white/[0.02] border-white/10 hover:border-white/20'
                      }`}
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-bold text-white text-base">{tier.name}</h4>
                          <span
                            className={`font-black text-base ${
                              tier.price === 0 ? 'text-emerald-400' : 'text-teal-400'
                            }`}
                          >
                            {tier.price === 0 ? 'FREE' : `₹${tier.price}`}
                          </span>
                        </div>

                        {tier.description && (
                          <p className="text-zinc-400 text-xs mt-2 leading-relaxed">
                            {tier.description}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2 pt-3 border-t border-white/5">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-zinc-500">Availability</span>
                          <span
                            className={
                              isSoldOut
                                ? 'text-red-400 font-bold'
                                : isFewLeft
                                ? 'text-amber-400 font-bold'
                                : 'text-emerald-400 font-medium'
                            }
                          >
                            {isSoldOut ? 'Sold Out' : `${tier.availableQuantity} passes left`}
                          </span>
                        </div>

                        {/* Inventory Bar */}
                        <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              isSoldOut ? 'bg-zinc-700' : isFewLeft ? 'bg-amber-500' : 'bg-emerald-500'
                            }`}
                            style={{
                              width: `${Math.min(
                                100,
                                Math.max(8, (tier.availableQuantity / (tier.quantity || 100)) * 100)
                              )}%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Right Column: Sticky Booking Bar (Buzzr Inspired) */}
          <div>
            <div className="bg-gradient-to-b from-white/[0.08] to-white/[0.02] border border-white/15 rounded-3xl p-6 space-y-6 shadow-2xl sticky top-8">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-red-400">
                  Instant Pass Reservation
                </span>
                <h3 className="text-lg font-bold text-white mt-0.5">Order Summary</h3>
                <p className="text-zinc-400 text-xs mt-1">
                  Selected Tier: <strong className="text-white">{activeTier?.name || 'General Pass'}</strong>
                </p>
              </div>

              {/* Quantity Selector */}
              <div className="flex items-center justify-between bg-white/5 p-3.5 rounded-2xl border border-white/10">
                <div>
                  <span className="text-xs font-semibold text-zinc-300 block">Number of Passes</span>
                  <span className="text-[10px] text-zinc-500">Max {maxAllowed} per rider</span>
                </div>
                <div className="flex items-center gap-3 bg-black/40 px-2 py-1 rounded-xl border border-white/10">
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center font-bold text-xs transition cursor-pointer"
                  >
                    -
                  </button>
                  <span className="font-bold text-sm text-white px-1">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.min(maxAllowed, quantity + 1))}
                    className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center font-bold text-xs transition cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="border-t border-white/10 pt-4 space-y-2 text-xs">
                <div className="flex justify-between text-zinc-400">
                  <span>Pass Tier Price ({quantity}x)</span>
                  <span className="text-white font-medium">
                    {isFree ? 'FREE' : `₹${totalAmount}`}
                  </span>
                </div>
                <div className="flex justify-between text-zinc-400">
                  <span>Platform Gateway Fee</span>
                  <span className="text-emerald-400 font-semibold">FREE (Covered)</span>
                </div>
                <div className="flex justify-between text-base font-bold text-white pt-2 border-t border-white/5">
                  <span>Total Due</span>
                  <span className="text-emerald-400 font-black">
                    {isFree ? 'FREE' : `₹${totalAmount}`}
                  </span>
                </div>
              </div>

              {/* Booking CTA Button */}
              <button
                type="button"
                onClick={handleOpenCheckout}
                className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white py-3.5 rounded-xl font-bold text-sm shadow-xl shadow-red-950/50 transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Ticket className="w-4 h-4" />
                <span>
                  {isFree
                    ? 'Reserve Free Pass'
                    : `Proceed to Book &bull; ₹${totalAmount}`}
                </span>
              </button>

              <div className="flex items-center justify-center gap-2 text-[11px] text-zinc-500">
                <Shield className="w-3.5 h-3.5 text-emerald-400" />
                <span>Official QR Gate Pass guaranteed</span>
              </div>
            </div>
          </div>
        </div>

        {/* Buzzr-Grade Full Checkout Drawer / Modal */}
        {isCheckoutOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
            <div className="bg-[#121215] border border-white/15 rounded-3xl p-6 lg:p-8 max-w-lg w-full shadow-2xl space-y-6 relative max-h-[90vh] overflow-y-auto">
              <button
                onClick={() => setIsCheckoutOpen(false)}
                className="absolute top-6 right-6 text-zinc-400 hover:text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-red-400">
                  Checkout & Pass Issuance
                </span>
                <h3 className="text-xl font-bold text-white font-[Josefin_Sans] mt-0.5">
                  {event.title}
                </h3>
                <p className="text-zinc-400 text-xs mt-1">
                  {quantity}x {activeTier?.name} &bull; Total:{' '}
                  <strong className="text-emerald-400">{isFree ? 'FREE' : `₹${totalAmount}`}</strong>
                </p>
              </div>

              {/* Payment Methods */}
              {!isFree && (
                <div className="space-y-4">
                  <label className="block text-xs font-semibold text-zinc-300">
                    Select Payment Option
                  </label>
                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('UPI')}
                      className={`p-3.5 rounded-2xl border text-center transition cursor-pointer ${
                        paymentMethod === 'UPI'
                          ? 'bg-teal-500/15 border-teal-500 text-teal-300 font-bold'
                          : 'bg-white/5 border-white/10 text-zinc-400 hover:bg-white/10'
                      }`}
                    >
                      <CreditCard className="w-5 h-5 mx-auto mb-1.5 text-teal-400" />
                      <span className="text-xs block">Instant UPI QR</span>
                      <span className="text-[10px] text-zinc-500">GPay, PhonePe, Paytm</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('CASH')}
                      className={`p-3.5 rounded-2xl border text-center transition cursor-pointer ${
                        paymentMethod === 'CASH'
                          ? 'bg-red-500/15 border-red-500 text-red-300 font-bold'
                          : 'bg-white/5 border-white/10 text-zinc-400 hover:bg-white/10'
                      }`}
                    >
                      <Banknote className="w-5 h-5 mx-auto mb-1.5 text-red-400" />
                      <span className="text-xs block">Pay Cash at Gate</span>
                      <span className="text-[10px] text-zinc-500">Pay on Arrival</span>
                    </button>
                  </div>

                  {/* UPI QR Display & Deep link */}
                  {paymentMethod === 'UPI' && (
                    <div className="bg-black/60 border border-teal-500/30 rounded-2xl p-4 space-y-4">
                      <div className="flex flex-col sm:flex-row items-center gap-4">
                        <div className="w-32 h-32 bg-white p-2 rounded-xl shrink-0 shadow-lg">
                          <img src={upiQrUrl} alt="UPI QR" className="w-full h-full object-contain" />
                        </div>
                        <div className="space-y-2 text-center sm:text-left">
                          <span className="text-[10px] uppercase font-bold text-teal-400 tracking-wider">
                            Scan with Any UPI App
                          </span>
                          <p className="text-xs text-zinc-300">
                            Scan using Google Pay, PhonePe, Paytm, or BHIM.
                          </p>
                          <div className="flex items-center gap-2 justify-center sm:justify-start">
                            <span className="font-mono text-xs text-white bg-white/10 px-2 py-1 rounded-lg">
                              {upiId}
                            </span>
                            <button
                              type="button"
                              onClick={handleCopyUpi}
                              className="text-zinc-400 hover:text-white p-1"
                              title="Copy UPI ID"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-zinc-300 mb-1">
                          UPI UTR / Transaction Reference (Optional)
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. 423984128912"
                          value={upiRef}
                          onChange={(e) => setUpiRef(e.target.value)}
                          className="w-full bg-white/5 border border-white/15 rounded-xl px-3.5 py-2 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-teal-500 transition"
                        />
                      </div>
                    </div>
                  )}

                  {paymentMethod === 'CASH' && (
                    <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                      <p className="text-xs text-amber-200 leading-relaxed">
                        Your pass will be issued immediately with a <strong>Cash Due</strong> note. Please present your QR pass and pay ₹{totalAmount} in cash at the entry gate.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Free RSVP message */}
              {isFree && (
                <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-4 flex items-start gap-3">
                  <Check className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <p className="text-xs text-emerald-200 leading-relaxed">
                    This is a complimentary motorcycle community event. Your official pass and gate check-in QR code will be generated instantly.
                  </p>
                </div>
              )}

              {/* Confirm Booking CTA */}
              <button
                type="button"
                disabled={isBooking}
                onClick={handleConfirmBooking}
                className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 disabled:opacity-50 text-white py-3.5 rounded-xl font-bold text-sm shadow-xl shadow-red-950/50 transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Ticket className="w-4 h-4" />
                <span>
                  {isBooking
                    ? 'Issuing Pass & QR...'
                    : isFree
                    ? 'Confirm Free Pass'
                    : `Complete Order &bull; Pay ₹${totalAmount}`}
                </span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
