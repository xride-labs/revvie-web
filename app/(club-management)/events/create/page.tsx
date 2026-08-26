'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Calendar,
  Clock,
  MapPin,
  Image as ImageIcon,
  Plus,
  Trash2,
  Ticket,
  Shield,
  ArrowLeft,
  DollarSign,
  Sparkles,
} from 'lucide-react'
import { useCreateEventMutation } from '@/features/events/api'
import { useGetMyClubsQuery } from '@/features/clubs/api'

interface TierForm {
  name: string
  price: number
  quantity: number
  description: string
  maxPerUser: number
}

const CATEGORIES = [
  { value: 'MEETUP', label: 'Meetup & Breakfast Run' },
  { value: 'TRACK_DAY', label: 'Track Day & Circuit Race' },
  { value: 'RALLY', label: 'Long Distance Rally & Tour' },
  { value: 'WORKSHOP', label: 'Workshop & Maintenance Training' },
  { value: 'TOUR', label: 'Night Ride & City Cruise' },
]

export default function CreateEventPage() {
  const router = useRouter()
  const [createEvent, { isLoading: isSubmitting }] = useCreateEventMutation()
  const { data: myClubsData } = useGetMyClubsQuery()

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('MEETUP')
  const [visibility, setVisibility] = useState<'PUBLIC' | 'CLUB_ONLY' | 'PRIVATE'>('PUBLIC')
  const [clubId, setClubId] = useState<string>('')
  const [bannerImage, setBannerImage] = useState('')
  const [scheduledAt, setScheduledAt] = useState('')
  const [endedAt, setEndedAt] = useState('')
  const [location, setLocation] = useState('')
  const [ticketUrl, setTicketUrl] = useState('')
  const [price, setPrice] = useState('0')

  // Multi-tier management
  const [hasTiers, setHasTiers] = useState(false)
  const [tiers, setTiers] = useState<TierForm[]>([
    {
      name: 'General Admission',
      price: 0,
      quantity: 150,
      description: 'Standard rider entry pass',
      maxPerUser: 5,
    },
  ])

  const handleAddTier = () => {
    setTiers((prev) => [
      ...prev,
      {
        name: `VIP Pass #${prev.length + 1}`,
        price: 499,
        quantity: 50,
        description: 'Priority paddock access & merchandise',
        maxPerUser: 2,
      },
    ])
  }

  const handleRemoveTier = (index: number) => {
    if (tiers.length <= 1) return
    setTiers((prev) => prev.filter((_, i) => i !== index))
  }

  const handleTierChange = (index: number, field: keyof TierForm, value: any) => {
    setTiers((prev) => {
      const copy = [...prev]
      copy[index] = { ...copy[index], [field]: value }
      return copy
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !scheduledAt) return

    try {
      const payload: any = {
        title: title.trim(),
        description: description.trim() || undefined,
        category,
        visibility,
        clubId: clubId || undefined,
        bannerImage: bannerImage.trim() || undefined,
        scheduledAt: new Date(scheduledAt).toISOString(),
        endedAt: endedAt ? new Date(endedAt).toISOString() : undefined,
        location: location.trim() || undefined,
        price: parseFloat(price) || 0,
        ticketUrl: ticketUrl.trim() || undefined,
        tiers: hasTiers
          ? tiers.map((t) => ({
              name: t.name.trim(),
              description: t.description.trim() || undefined,
              price: Number(t.price) || 0,
              quantity: Number(t.quantity) || 100,
              maxPerUser: Number(t.maxPerUser) || 5,
            }))
          : undefined,
      }

      const res = await createEvent(payload).unwrap()
      router.push(`/events/${res.id}`)
    } catch (err: any) {
      alert(err?.data?.message || 'Failed to create event.')
    }
  }

  const myClubs = myClubsData?.items || []

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-6 lg:p-10">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link
            href="/events"
            className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold tracking-tight font-[Josefin_Sans]">
              Host a Motorcycle Event
            </h1>
            <p className="text-zinc-400 text-xs mt-0.5">
              Set up your ride schedule, venue, and configure ticket tiers with QR passes.
            </p>
          </div>
        </div>

        {/* Form Container */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 space-y-5">
            <h2 className="text-lg font-bold text-white border-b border-white/5 pb-3">
              1. Event Overview
            </h2>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
                Event Title *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Bangalore Dawn Patrol & Breakfast Meetup"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-red-500 transition"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-red-500 transition"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
                  Visibility
                </label>
                <select
                  value={visibility}
                  onChange={(e) => setVisibility(e.target.value as any)}
                  className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-red-500 transition"
                >
                  <option value="PUBLIC">🌐 Public (Visible to all riders)</option>
                  <option value="CLUB_ONLY">🛡️ Club Only (Members only)</option>
                  <option value="PRIVATE">🔒 Private (Invite only)</option>
                </select>
              </div>
            </div>

            {myClubs.length > 0 && (
              <div>
                <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
                  Host under a Club / Squad (Optional)
                </label>
                <select
                  value={clubId}
                  onChange={(e) => setClubId(e.target.value)}
                  className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-red-500 transition"
                >
                  <option value="">Host as Individual Rider</option>
                  {myClubs.map((club) => (
                    <option key={club.id} value={club.id}>
                      🛡️ {club.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
                Banner Image URL
              </label>
              <input
                type="url"
                placeholder="https://images.unsplash.com/..."
                value={bannerImage}
                onChange={(e) => setBannerImage(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-red-500 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
                Description & Terms
              </label>
              <textarea
                rows={4}
                placeholder="Describe the ride pace, meeting spot guidelines, safety gears required, and schedule breakdown..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-red-500 transition"
              />
            </div>
          </div>

          {/* Schedule & Venue */}
          <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 space-y-5">
            <h2 className="text-lg font-bold text-white border-b border-white/5 pb-3">
              2. Schedule & Venue
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
                  Start Date & Time *
                </label>
                <input
                  type="datetime-local"
                  required
                  value={scheduledAt}
                  onChange={(e) => setScheduledAt(e.target.value)}
                  className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-red-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
                  End Date & Time (Optional)
                </label>
                <input
                  type="datetime-local"
                  value={endedAt}
                  onChange={(e) => setEndedAt(e.target.value)}
                  className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-red-500 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
                Venue Location / Assembly Point
              </label>
              <input
                type="text"
                placeholder="e.g. Shell Petrol Pump, Airport Road / BIC Greater Noida"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-red-500 transition"
              />
            </div>
          </div>

          {/* Ticket Tiers & Pricing */}
          <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <h2 className="text-lg font-bold text-white">
                3. Ticket Tiers & Capacity
              </h2>
              <div className="flex items-center gap-3">
                <span className="text-xs text-zinc-400">Multi-tier passes</span>
                <input
                  type="checkbox"
                  checked={hasTiers}
                  onChange={(e) => setHasTiers(e.target.checked)}
                  className="w-4 h-4 rounded border-zinc-700 text-red-600 focus:ring-red-500"
                />
              </div>
            </div>

            {!hasTiers ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
                    Entry Price (₹ INR) &bull; 0 for Free
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-red-500 transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
                    External Ticket Link (Optional)
                  </label>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={ticketUrl}
                    onChange={(e) => setTicketUrl(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-red-500 transition"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {tiers.map((tier, index) => (
                  <div
                    key={index}
                    className="bg-white/[0.02] border border-white/10 rounded-xl p-4 space-y-3 relative"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-teal-400 uppercase tracking-wider">
                        Tier #{index + 1}
                      </span>
                      {tiers.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveTier(index)}
                          className="text-red-400 hover:text-red-300 text-xs flex items-center gap-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Remove</span>
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[11px] text-zinc-400 mb-1">Tier Name</label>
                        <input
                          type="text"
                          required
                          value={tier.name}
                          onChange={(e) => handleTierChange(index, 'name', e.target.value)}
                          className="w-full bg-zinc-900 border border-white/10 rounded-lg px-3 py-2 text-xs text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-zinc-400 mb-1">Price (₹ INR)</label>
                        <input
                          type="number"
                          min="0"
                          required
                          value={tier.price}
                          onChange={(e) => handleTierChange(index, 'price', e.target.value)}
                          className="w-full bg-zinc-900 border border-white/10 rounded-lg px-3 py-2 text-xs text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-zinc-400 mb-1">Max Passes</label>
                        <input
                          type="number"
                          min="1"
                          required
                          value={tier.quantity}
                          onChange={(e) => handleTierChange(index, 'quantity', e.target.value)}
                          className="w-full bg-zinc-900 border border-white/10 rounded-lg px-3 py-2 text-xs text-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] text-zinc-400 mb-1">Description / Perks</label>
                      <input
                        type="text"
                        placeholder="e.g. Includes breakfast buffet & track timing chip"
                        value={tier.description}
                        onChange={(e) => handleTierChange(index, 'description', e.target.value)}
                        className="w-full bg-zinc-900 border border-white/10 rounded-lg px-3 py-2 text-xs text-white"
                      />
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={handleAddTier}
                  className="w-full border border-dashed border-white/20 hover:border-teal-500/50 hover:bg-teal-500/5 text-teal-400 text-xs font-semibold py-3 rounded-xl transition flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Another Ticket Tier</span>
                </button>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-3 pt-4">
            <Link
              href="/events"
              className="px-6 py-3 rounded-xl border border-white/10 hover:bg-white/5 text-sm font-semibold text-zinc-400 transition"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 disabled:opacity-50 text-white px-8 py-3 rounded-xl font-bold text-sm shadow-xl shadow-red-950/50 transition"
            >
              {isSubmitting ? 'Publishing Event...' : 'Publish Event & Open Ticket Sales'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
