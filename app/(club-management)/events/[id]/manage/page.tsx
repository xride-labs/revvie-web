'use client'

import React, { use, useState } from 'react'
import Link from 'next/link'
import {
  DollarSign,
  Ticket,
  Users,
  CheckCircle2,
  AlertTriangle,
  QrCode,
  ScanLine,
  ArrowLeft,
  RefreshCw,
  Search,
} from 'lucide-react'
import {
  useGetEventQuery,
  useGetEventMetricsQuery,
  useValidateTicketMutation,
} from '@/features/events/api'

export default function ManageEventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { data: event } = useGetEventQuery(id)
  const { data: metrics, isLoading, refetch } = useGetEventMetricsQuery(id)
  const [validateTicket, { isLoading: isValidating }] = useValidateTicketMutation()

  const [ticketInput, setTicketInput] = useState('')
  const [scanResult, setScanResult] = useState<any>(null)
  const [attendeeFilter, setAttendeeFilter] = useState('')

  const handleValidate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!ticketInput.trim()) return

    try {
      const res = await validateTicket({
        eventId: id,
        ticketCode: ticketInput.trim(),
      }).unwrap()

      setScanResult(res)
      setTicketInput('')
      refetch()
    } catch (err: any) {
      setScanResult({
        valid: false,
        alreadyUsed: false,
        error: err?.data?.message || 'Invalid ticket code',
      })
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full" />
      </div>
    )
  }

  const gross = metrics?.grossRevenue || 0
  const fee = metrics?.platformFee || 0
  const net = metrics?.netOrganiserEarnings || 0
  const ticketsSold = metrics?.totalTicketsSold || 0
  const checkedIn = metrics?.checkedInCount || 0

  const filteredTickets = (metrics?.recentTickets || []).filter((t) => {
    if (!attendeeFilter.trim()) return true
    const q = attendeeFilter.toLowerCase()
    return (
      t.ticketCode.toLowerCase().includes(q) ||
      t.user?.name?.toLowerCase().includes(q) ||
      t.tier?.name.toLowerCase().includes(q)
    )
  })

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-6 lg:p-10">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div>
            <Link
              href={`/events/${id}`}
              className="flex items-center gap-2 text-zinc-400 hover:text-white text-xs font-semibold uppercase tracking-wider mb-2 transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Event</span>
            </Link>
            <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-white font-[Josefin_Sans]">
              {event?.title || 'Event'} &bull; Organiser Dashboard
            </h1>
            <p className="text-zinc-400 text-xs mt-0.5">
              Live sales performance, 3.5% platform fee deduction, and gate check-in controls.
            </p>
          </div>

          <button
            onClick={() => refetch()}
            className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white border border-white/10 px-4 py-2.5 rounded-xl text-xs font-semibold transition self-start md:self-auto"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh Analytics</span>
          </button>
        </div>

        {/* Analytics KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-5 space-y-1">
            <span className="text-xs text-zinc-400 font-semibold uppercase tracking-wider">
              Total Passes Sold
            </span>
            <p className="text-2xl font-bold text-white">{ticketsSold}</p>
            <span className="text-[11px] text-zinc-500">{metrics?.totalOrders || 0} unique orders</span>
          </div>

          <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-5 space-y-1">
            <span className="text-xs text-zinc-400 font-semibold uppercase tracking-wider">
              Gross Ticket Sales
            </span>
            <p className="text-2xl font-bold text-white">₹{gross.toLocaleString('en-IN')}</p>
            <span className="text-[11px] text-teal-400 font-semibold">100% of pass volume</span>
          </div>

          <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-5 space-y-1">
            <span className="text-xs text-zinc-400 font-semibold uppercase tracking-wider">
              Platform Fee (3.5%)
            </span>
            <p className="text-2xl font-bold text-red-400">₹{fee.toLocaleString('en-IN')}</p>
            <span className="text-[11px] text-zinc-500">Revvie engine commission</span>
          </div>

          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-5 space-y-1">
            <span className="text-xs text-emerald-400 font-semibold uppercase tracking-wider">
              Net Organiser Payout
            </span>
            <p className="text-2xl font-bold text-emerald-300">₹{net.toLocaleString('en-IN')}</p>
            <span className="text-[11px] text-emerald-400/80">Ready for settlement</span>
          </div>
        </div>

        {/* Gate Ticket Scanner Box */}
        <div className="bg-gradient-to-r from-red-950/30 via-zinc-900 to-zinc-950 border border-red-500/30 rounded-3xl p-6 lg:p-8 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-600/20 text-red-400 flex items-center justify-center border border-red-500/40">
                <ScanLine className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Gate Ticket Scanner</h3>
                <p className="text-zinc-400 text-xs">
                  Scan barcode / enter ticket code to check in attendees at venue entrance.
                </p>
              </div>
            </div>

            <div className="bg-black/50 border border-white/10 px-4 py-2 rounded-xl text-xs">
              <span className="text-zinc-400">Checked In: </span>
              <span className="font-bold text-emerald-400">
                {checkedIn} / {ticketsSold}
              </span>
            </div>
          </div>

          <form onSubmit={handleValidate} className="flex gap-3">
            <input
              type="text"
              placeholder="Enter or scan ticket code (e.g. TKT-REV-XXXX-XXXX)..."
              value={ticketInput}
              onChange={(e) => setTicketInput(e.target.value)}
              className="flex-1 bg-black/60 border border-white/15 rounded-xl px-4 py-3 text-sm text-white font-mono placeholder-zinc-500 uppercase tracking-wider focus:outline-none focus:border-red-500 transition"
            />
            <button
              type="submit"
              disabled={isValidating}
              className="bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-bold text-xs px-6 py-3 rounded-xl transition shadow-lg shadow-red-950/50"
            >
              {isValidating ? 'Validating...' : 'Verify Entry'}
            </button>
          </form>

          {/* Scan Feedback Result Banner */}
          {scanResult && (
            <div
              className={`p-4 rounded-2xl border flex items-center justify-between ${
                scanResult.valid
                  ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                  : scanResult.alreadyUsed
                  ? 'bg-yellow-500/15 border-yellow-500/40 text-yellow-300'
                  : 'bg-red-500/15 border-red-500/40 text-red-300'
              }`}
            >
              <div className="flex items-center gap-3">
                {scanResult.valid ? (
                  <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
                ) : (
                  <AlertTriangle className="w-6 h-6 shrink-0" />
                )}
                <div>
                  <p className="font-bold text-sm">
                    {scanResult.valid
                      ? 'VALID ENTRY PASS &bull; CHECKED IN ✓'
                      : scanResult.alreadyUsed
                      ? 'WARNING: TICKET ALREADY USED'
                      : 'INVALID TICKET CODE'}
                  </p>
                  {scanResult.attendee && (
                    <p className="text-xs opacity-80 mt-0.5">
                      Rider: {scanResult.attendee.name} &bull; Pass: {scanResult.ticket?.tier?.name || 'General'}
                    </p>
                  )}
                  {scanResult.error && (
                    <p className="text-xs opacity-80 mt-0.5">{scanResult.error}</p>
                  )}
                </div>
              </div>

              <button
                onClick={() => setScanResult(null)}
                className="text-xs font-semibold opacity-70 hover:opacity-100"
              >
                Dismiss
              </button>
            </div>
          )}
        </div>

        {/* Attendee Pass Roster */}
        <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-4">
            <h3 className="text-lg font-bold text-white">Attendee Passes Roster</h3>
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                type="text"
                placeholder="Filter by rider or pass code..."
                value={attendeeFilter}
                onChange={(e) => setAttendeeFilter(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-zinc-500"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/10 text-zinc-400">
                  <th className="pb-3 font-semibold">Pass Code</th>
                  <th className="pb-3 font-semibold">Rider Name</th>
                  <th className="pb-3 font-semibold">Tier</th>
                  <th className="pb-3 font-semibold">Status</th>
                  <th className="pb-3 font-semibold">Check-in Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredTickets.map((ticket) => (
                  <tr key={ticket.id} className="hover:bg-white/[0.02]">
                    <td className="py-3 font-mono text-zinc-300">{ticket.ticketCode}</td>
                    <td className="py-3 font-semibold text-white">
                      {ticket.user?.name || 'Anonymous Rider'}
                    </td>
                    <td className="py-3 text-teal-400">{ticket.tier?.name || 'General'}</td>
                    <td className="py-3">
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                          ticket.status === 'USED'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-zinc-800 text-zinc-300'
                        }`}
                      >
                        {ticket.status === 'USED' ? 'CHECKED IN' : 'ACTIVE'}
                      </span>
                    </td>
                    <td className="py-3 text-zinc-500">
                      {ticket.scannedAt
                        ? new Date(ticket.scannedAt).toLocaleTimeString()
                        : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
