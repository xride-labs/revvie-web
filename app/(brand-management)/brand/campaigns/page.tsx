'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Tag,
  Plus,
  Loader2,
  Calendar,
  Eye,
  MousePointer,
  MoreHorizontal,
  Trash2,
  Pencil,
} from 'lucide-react'
import Link from 'next/link'
import { useToast } from '@/hooks/use-toast'
import {
  useGetCampaignsQuery,
  useUpdateCampaignMutation,
  useDeleteCampaignMutation,
} from '@/features/business/api'
import { useBusinessContext } from '@/contexts/business-context'
import type { AdCampaign } from '@/entities/business/model'

const STATUS_BADGE: Record<string, string> = {
  DRAFT: 'text-muted-foreground border-border',
  PENDING_APPROVAL: 'text-amber-500 border-amber-500/30 bg-amber-500/5',
  ACTIVE: 'text-green-500 border-green-500/30 bg-green-500/5',
  PAUSED: 'text-blue-400 border-blue-400/30 bg-blue-400/5',
  COMPLETED: 'text-muted-foreground border-border',
  REJECTED: 'text-destructive border-destructive/30 bg-destructive/5',
}

interface EditForm {
  title: string
  ctaLabel: string
  ctaUrl: string
  startsAt: string
  endsAt: string
  budgetRupees: string
}

function toInputDate(iso: string) {
  return iso ? iso.slice(0, 10) : ''
}

export default function BrandCampaignsPage() {
  const { success: successToast, error: errorToast } = useToast()
  const { business, loading: businessLoading } = useBusinessContext()
  const businessId = business?.id ?? null
  const { data: campaigns = [], isLoading: campaignsLoading } = useGetCampaignsQuery(
    businessId ?? '',
    { skip: !businessId },
  )
  const [updateCampaign, { isLoading: saving }] = useUpdateCampaignMutation()
  const [deleteCampaign, { isLoading: deleting }] = useDeleteCampaignMutation()
  const [deleteTarget, setDeleteTarget] = useState<AdCampaign | null>(null)
  const [editTarget, setEditTarget] = useState<AdCampaign | null>(null)
  const [editForm, setEditForm] = useState<EditForm>({
    title: '',
    ctaLabel: '',
    ctaUrl: '',
    startsAt: '',
    endsAt: '',
    budgetRupees: '',
  })

  const loading = businessLoading || (!!businessId && campaignsLoading)

  const openEdit = (c: AdCampaign) => {
    setEditForm({
      title: c.title,
      ctaLabel: c.ctaLabel,
      ctaUrl: c.ctaUrl ?? '',
      startsAt: toInputDate(c.startsAt),
      endsAt: toInputDate(c.endsAt),
      budgetRupees: c.budgetPaise ? String(Math.round(c.budgetPaise / 100)) : '',
    })
    setEditTarget(c)
  }

  const handleSave = async () => {
    if (!businessId || !editTarget) return
    try {
      await updateCampaign({
        businessId,
        campaignId: editTarget.id,
        data: {
          title: editForm.title.trim(),
          ctaLabel: editForm.ctaLabel.trim(),
          ctaUrl: editForm.ctaUrl.trim() || null,
          startsAt: editForm.startsAt
            ? new Date(editForm.startsAt).toISOString()
            : editTarget.startsAt,
          endsAt: editForm.endsAt
            ? new Date(editForm.endsAt).toISOString()
            : editTarget.endsAt,
          ...(editForm.budgetRupees
            ? { budgetPaise: Math.round(parseFloat(editForm.budgetRupees) * 100) }
            : {}),
        },
      }).unwrap()
      successToast('Campaign updated')
      setEditTarget(null)
    } catch {
      errorToast('Failed to update campaign')
    }
  }

  const handleDelete = async () => {
    if (!businessId || !deleteTarget) return
    try {
      await deleteCampaign({ businessId, campaignId: deleteTarget.id }).unwrap()
      successToast('Campaign deleted')
    } catch {
      errorToast('Failed to delete campaign')
    } finally {
      setDeleteTarget(null)
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">Ad Campaigns</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Reach riders based on location, bike type, and riding style
          </p>
        </div>
        <Button className="bg-amber-500 hover:bg-amber-600 text-white" asChild>
          <Link href="/brand/campaigns/create">
            <Plus className="w-4 h-4 mr-2" /> New Campaign
          </Link>
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
        </div>
      ) : campaigns.length === 0 ? (
        <Card className="border-dashed border-2">
          <CardContent className="py-20 text-center">
            <Tag className="w-14 h-14 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="font-semibold text-lg mb-2">No campaigns yet</h3>
            <p className="text-muted-foreground text-sm max-w-xs mx-auto mb-6">
              Sponsor rides, promote listings, and target riders by location and bike
              type.
            </p>
            <Button variant="outline" asChild>
              <Link href="/brand/campaigns/create">
                <Plus className="w-4 h-4 mr-2" /> Create your first campaign
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {campaigns.map((c) => (
            <Card key={c.id}>
              <CardContent className="p-4 flex items-center gap-4">
                {c.imageUrl && (
                  <img
                    src={c.imageUrl}
                    alt={c.title}
                    className="w-16 h-16 rounded-lg object-cover shrink-0"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium truncate">{c.title}</p>
                    <Badge
                      variant="outline"
                      className={`text-xs shrink-0 ${STATUS_BADGE[c.status] ?? ''}`}
                    >
                      {c.status.replace(/_/g, ' ')}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(c.startsAt).toLocaleDateString()} –{' '}
                      {new Date(c.endsAt).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye className="w-3 h-3" /> {c.impressionCount.toLocaleString()}{' '}
                      impressions
                    </span>
                    <span className="flex items-center gap-1">
                      <MousePointer className="w-3 h-3" /> {c.clickCount.toLocaleString()}{' '}
                      clicks
                    </span>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {c.status === 'DRAFT' && (
                      <>
                        <DropdownMenuItem onClick={() => openEdit(c)}>
                          <Pencil className="w-4 h-4 mr-2" /> Edit campaign
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                      </>
                    )}
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive"
                      onClick={() => setDeleteTarget(c)}
                    >
                      <Trash2 className="w-4 h-4 mr-2" /> Delete campaign
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Dialog — DRAFT campaigns only */}
      <Dialog open={!!editTarget} onOpenChange={(open) => !open && setEditTarget(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Campaign</DialogTitle>
            <DialogDescription>
              Changes apply to this draft before it goes live.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-1.5">
              <Label>Campaign Title</Label>
              <Input
                value={editForm.title}
                onChange={(e) => setEditForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="Campaign name"
              />
            </div>
            <div className="grid gap-1.5">
              <Label>CTA Button Label</Label>
              <Input
                value={editForm.ctaLabel}
                onChange={(e) => setEditForm((f) => ({ ...f, ctaLabel: e.target.value }))}
                placeholder="e.g. Shop Now"
              />
            </div>
            <div className="grid gap-1.5">
              <Label>
                CTA URL <span className="text-muted-foreground text-xs">(optional)</span>
              </Label>
              <Input
                value={editForm.ctaUrl}
                onChange={(e) => setEditForm((f) => ({ ...f, ctaUrl: e.target.value }))}
                placeholder="https://..."
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label>Start Date</Label>
                <Input
                  type="date"
                  value={editForm.startsAt}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, startsAt: e.target.value }))
                  }
                />
              </div>
              <div className="grid gap-1.5">
                <Label>End Date</Label>
                <Input
                  type="date"
                  value={editForm.endsAt}
                  onChange={(e) => setEditForm((f) => ({ ...f, endsAt: e.target.value }))}
                />
              </div>
            </div>
            <div className="grid gap-1.5">
              <Label>
                Budget (₹){' '}
                <span className="text-muted-foreground text-xs">(optional)</span>
              </Label>
              <Input
                type="number"
                min="0"
                value={editForm.budgetRupees}
                onChange={(e) =>
                  setEditForm((f) => ({ ...f, budgetRupees: e.target.value }))
                }
                placeholder="e.g. 5000"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditTarget(null)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              className="bg-amber-500 hover:bg-amber-600 text-white"
              onClick={handleSave}
              disabled={saving || !editForm.title.trim()}
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete campaign?</DialogTitle>
            <DialogDescription>
              <span className="font-medium">{deleteTarget?.title}</span> will be
              permanently deleted. This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteTarget(null)}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
