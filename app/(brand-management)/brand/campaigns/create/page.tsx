'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { useToast } from '@/hooks/use-toast'
import { useCreateCampaignMutation } from '@/features/business/api'
import { useBusinessContext } from '@/contexts/business-context'
import type { AdPlacementSlot as AdSlot } from '@/entities/business/model'

const AD_SLOTS: { value: AdSlot; label: string; description: string }[] = [
  { value: 'HOME_FEED', label: 'Home Feed', description: 'Top of the home tab' },
  { value: 'DISCOVER_TOP', label: 'Discover', description: 'Discover tab hero banner' },
  {
    value: 'MARKETPLACE_INLINE',
    label: 'Marketplace',
    description: 'Inline between listings',
  },
  { value: 'CHAT_LIST_TOP', label: 'Chat List', description: 'Top of conversations' },
  {
    value: 'POST_RIDE_SUMMARY',
    label: 'Post-Ride',
    description: 'Shown after a ride ends',
  },
]

export default function CreateCampaignPage() {
  const router = useRouter()
  const { success: successToast, error: errorToast } = useToast()
  const { business } = useBusinessContext()
  const [createCampaign, { isLoading: loading }] = useCreateCampaignMutation()
  const [form, setForm] = useState({
    title: '',
    ctaLabel: '',
    ctaUrl: '',
    imageUrl: '',
    startsAt: '',
    endsAt: '',
    budgetPaise: '',
    selectedSlots: [] as AdSlot[],
  })

  const toggleSlot = (slot: AdSlot) => {
    setForm((f) => ({
      ...f,
      selectedSlots: f.selectedSlots.includes(slot)
        ? f.selectedSlots.filter((s) => s !== slot)
        : [...f.selectedSlots, slot],
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (form.selectedSlots.length === 0) {
      errorToast('Select at least one ad placement')
      return
    }
    if (!business) {
      errorToast('No brand profile found')
      return
    }
    try {
      await createCampaign({
        businessId: business.id,
        data: {
          title: form.title,
          ctaLabel: form.ctaLabel,
          ctaUrl: form.ctaUrl || null,
          imageUrl: form.imageUrl,
          startsAt: new Date(form.startsAt).toISOString(),
          endsAt: new Date(form.endsAt).toISOString(),
          budgetPaise: form.budgetPaise ? parseInt(form.budgetPaise) * 100 : 0,
          slots: form.selectedSlots,
          targetTags: [],
        },
      }).unwrap()
      successToast('Campaign submitted for review!', {
        description: 'Admin will approve it before it goes live.',
      })
      router.push('/brand/campaigns')
    } catch (err) {
      errorToast(err instanceof Error ? err.message : 'Failed to create campaign')
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/brand/campaigns">
            <ArrowLeft className="w-4 h-4" />
          </Link>
        </Button>
        <div>
          <h2 className="text-2xl font-bold">New Campaign</h2>
          <p className="text-sm text-muted-foreground">
            Campaigns go live after admin approval
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Campaign Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label>Campaign Title</Label>
              <Input
                placeholder="e.g. Summer Gear Sale"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>CTA Button Label</Label>
                <Input
                  placeholder="e.g. Shop Now"
                  value={form.ctaLabel}
                  onChange={(e) => setForm({ ...form, ctaLabel: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label>
                  CTA URL{' '}
                  <span className="text-muted-foreground text-xs">(optional)</span>
                </Label>
                <Input
                  placeholder="https://..."
                  value={form.ctaUrl}
                  onChange={(e) => setForm({ ...form, ctaUrl: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Ad Image URL</Label>
              <Input
                placeholder="https://cdn.example.com/banner.jpg"
                value={form.imageUrl}
                onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Start Date</Label>
                <Input
                  type="date"
                  value={form.startsAt}
                  onChange={(e) => setForm({ ...form, startsAt: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label>End Date</Label>
                <Input
                  type="date"
                  value={form.endsAt}
                  onChange={(e) => setForm({ ...form, endsAt: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>
                Budget (₹){' '}
                <span className="text-muted-foreground text-xs">(optional)</span>
              </Label>
              <Input
                type="number"
                placeholder="e.g. 5000"
                value={form.budgetPaise}
                onChange={(e) => setForm({ ...form, budgetPaise: e.target.value })}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Ad Placements</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {AD_SLOTS.map((slot) => (
                <button
                  key={slot.value}
                  type="button"
                  onClick={() => toggleSlot(slot.value)}
                  className={`w-full text-left px-4 py-3 rounded-xl border transition-all ${
                    form.selectedSlots.includes(slot.value)
                      ? 'border-amber-500 bg-amber-500/10'
                      : 'border-border hover:border-amber-500/50'
                  }`}
                >
                  <div className="font-medium text-sm">{slot.label}</div>
                  <div className="text-xs text-muted-foreground">{slot.description}</div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Button
          type="submit"
          className="w-full bg-amber-500 hover:bg-amber-600 text-white h-12"
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              Submitting...
            </>
          ) : (
            'Submit Campaign for Review'
          )}
        </Button>
      </form>
    </div>
  )
}
