'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  Ticket,
  Plus,
  Loader2,
  Trash2,
  Pencil,
  CalendarRange,
  Star,
  Copy,
  Check,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import {
  useGetDiscountsQuery,
  useCreateDiscountMutation,
  useUpdateDiscountMutation,
  useDeleteDiscountMutation,
} from '@/features/business/api'
import { useBusinessContext } from '@/contexts/business-context'
import type { Discount } from '@/entities/business/model'
import type { CreateDiscountInput } from '@/features/business/schemas'

type DiscountType = 'percent' | 'amount'

interface DiscountForm {
  title: string
  code: string
  type: DiscountType
  percentOff: string
  amountOff: string
  validFrom: string
  validUntil: string
  description: string
  isFeatured: boolean
}

const EMPTY_FORM: DiscountForm = {
  title: '',
  code: '',
  type: 'percent',
  percentOff: '',
  amountOff: '',
  validFrom: '',
  validUntil: '',
  description: '',
  isFeatured: false,
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function isExpired(until: string) {
  return new Date(until) < new Date()
}

export default function BrandDiscountsPage() {
  const { success: successToast, error: errorToast } = useToast()
  const { business, loading: businessLoading } = useBusinessContext()
  const businessId = business?.id ?? null
  const { data: discounts = [], isLoading: discountsLoading } = useGetDiscountsQuery(
    businessId ?? '',
    { skip: !businessId },
  )
  const [createDiscount, { isLoading: creating }] = useCreateDiscountMutation()
  const [updateDiscount, { isLoading: updating }] = useUpdateDiscountMutation()
  const [deleteDiscount] = useDeleteDiscountMutation()
  const saving = creating || updating
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingDiscount, setEditingDiscount] = useState<Discount | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Discount | null>(null)
  const [copiedCode, setCopiedCode] = useState<string | null>(null)
  const [form, setForm] = useState<DiscountForm>(EMPTY_FORM)

  const loading = businessLoading || (!!businessId && discountsLoading)

  const openCreate = () => {
    setEditingDiscount(null)
    setForm(EMPTY_FORM)
    setDialogOpen(true)
  }

  const openEdit = (d: Discount) => {
    setEditingDiscount(d)
    setForm({
      title: d.title,
      code: d.code ?? '',
      type: d.percentOff != null ? 'percent' : 'amount',
      percentOff: d.percentOff != null ? String(d.percentOff) : '',
      amountOff: d.amountOffPaise != null ? String(d.amountOffPaise / 100) : '',
      validFrom: d.validFrom.slice(0, 10),
      validUntil: d.validUntil.slice(0, 10),
      description: d.description ?? '',
      isFeatured: d.isFeatured,
    })
    setDialogOpen(true)
  }

  const handleSave = async () => {
    if (!businessId) return
    if (!form.title.trim()) {
      errorToast('Title is required')
      return
    }
    if (!form.validFrom || !form.validUntil) {
      errorToast('Dates are required')
      return
    }
    if (
      form.type === 'percent' &&
      (!form.percentOff || Number(form.percentOff) <= 0 || Number(form.percentOff) > 100)
    ) {
      errorToast('Enter a valid percentage (1–100)')
      return
    }
    if (form.type === 'amount' && (!form.amountOff || Number(form.amountOff) <= 0)) {
      errorToast('Enter a valid discount amount')
      return
    }

    const payload: CreateDiscountInput = {
      title: form.title.trim(),
      code: form.code.trim().toUpperCase() || null,
      description: form.description.trim() || null,
      percentOff: form.type === 'percent' ? Number(form.percentOff) : null,
      amountOffPaise:
        form.type === 'amount' ? Math.round(Number(form.amountOff) * 100) : null,
      validFrom: new Date(form.validFrom).toISOString(),
      validUntil: new Date(form.validUntil).toISOString(),
      isFeatured: form.isFeatured,
    }

    try {
      if (editingDiscount) {
        await updateDiscount({
          businessId,
          discountId: editingDiscount.id,
          data: payload,
        }).unwrap()
        successToast('Discount updated')
      } else {
        await createDiscount({ businessId, data: payload }).unwrap()
        successToast('Discount created')
      }
      setDialogOpen(false)
    } catch (err) {
      errorToast(err instanceof Error ? err.message : 'Failed to save discount')
    }
  }

  const handleDelete = async () => {
    if (!businessId || !deleteTarget) return
    try {
      await deleteDiscount({ businessId, discountId: deleteTarget.id }).unwrap()
      successToast('Discount deleted')
    } catch {
      errorToast('Failed to delete discount')
    } finally {
      setDeleteTarget(null)
    }
  }

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(code)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">Discount Codes</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Create promo codes and featured deals for your brand
          </p>
        </div>
        <Button
          className="bg-amber-500 hover:bg-amber-600 text-white"
          onClick={openCreate}
        >
          <Plus className="w-4 h-4 mr-2" /> New Discount
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
        </div>
      ) : discounts.length === 0 ? (
        <Card className="border-dashed border-2">
          <CardContent className="py-20 text-center">
            <Ticket className="w-14 h-14 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="font-semibold text-lg mb-2">No discounts yet</h3>
            <p className="text-muted-foreground text-sm max-w-xs mx-auto mb-6">
              Create promo codes or featured deals that riders see on your brand page and
              product listings.
            </p>
            <Button
              className="bg-amber-500 hover:bg-amber-600 text-white"
              onClick={openCreate}
            >
              <Plus className="w-4 h-4 mr-2" /> Create your first discount
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {discounts.map((d) => {
            const expired = isExpired(d.validUntil)
            return (
              <Card key={d.id} className={expired ? 'opacity-60' : ''}>
                <CardContent className="p-4 flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0">
                    <Ticket className="w-6 h-6 text-amber-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-semibold truncate">{d.title}</span>
                      {d.isFeatured && (
                        <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/30 text-xs">
                          <Star className="w-2.5 h-2.5 mr-1" /> Featured
                        </Badge>
                      )}
                      {expired && (
                        <Badge
                          variant="outline"
                          className="text-xs text-muted-foreground"
                        >
                          Expired
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-3 flex-wrap text-sm">
                      {d.code && (
                        <button
                          onClick={() => copyCode(d.code!)}
                          className="flex items-center gap-1 font-mono text-xs bg-muted px-2 py-0.5 rounded hover:bg-muted/70 transition-colors"
                        >
                          {copiedCode === d.code ? (
                            <>
                              <Check className="w-3 h-3 text-green-500" /> Copied
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" /> {d.code}
                            </>
                          )}
                        </button>
                      )}
                      <span className="font-medium text-amber-500">
                        {d.percentOff != null
                          ? `${d.percentOff}% off`
                          : d.amountOffPaise != null
                            ? `₹${(d.amountOffPaise / 100).toLocaleString()} off`
                            : 'Discount'}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <CalendarRange className="w-3 h-3" />
                        {formatDate(d.validFrom)} – {formatDate(d.validUntil)}
                      </span>
                    </div>
                    {d.description && (
                      <p className="text-xs text-muted-foreground mt-1 truncate">
                        {d.description}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => openEdit(d)}
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => setDeleteTarget(d)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingDiscount ? 'Edit Discount' : 'New Discount'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>
                Title <span className="text-destructive">*</span>
              </Label>
              <Input
                placeholder="e.g. Summer Sale 20% Off"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <Label>
                Promo Code{' '}
                <span className="text-muted-foreground text-xs">(optional)</span>
              </Label>
              <Input
                placeholder="e.g. SUMMER20"
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                className="font-mono"
              />
              <p className="text-xs text-muted-foreground">
                Leave blank for an automatic deal with no code required
              </p>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label>
                Discount Type <span className="text-destructive">*</span>
              </Label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setForm({ ...form, type: 'percent' })}
                  className={`flex-1 py-2 px-3 rounded-lg border text-sm font-medium transition-all ${
                    form.type === 'percent'
                      ? 'border-amber-500 bg-amber-500/10 text-amber-500'
                      : 'border-border text-muted-foreground hover:border-amber-500/40'
                  }`}
                >
                  % Percentage Off
                </button>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, type: 'amount' })}
                  className={`flex-1 py-2 px-3 rounded-lg border text-sm font-medium transition-all ${
                    form.type === 'amount'
                      ? 'border-amber-500 bg-amber-500/10 text-amber-500'
                      : 'border-border text-muted-foreground hover:border-amber-500/40'
                  }`}
                >
                  ₹ Fixed Amount Off
                </button>
              </div>
            </div>

            {form.type === 'percent' ? (
              <div className="space-y-1.5">
                <Label>
                  Percentage Off <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <Input
                    type="number"
                    min="1"
                    max="100"
                    placeholder="e.g. 20"
                    value={form.percentOff}
                    onChange={(e) => setForm({ ...form, percentOff: e.target.value })}
                    className="pr-8"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                    %
                  </span>
                </div>
              </div>
            ) : (
              <div className="space-y-1.5">
                <Label>
                  Amount Off (₹) <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                    ₹
                  </span>
                  <Input
                    type="number"
                    min="1"
                    placeholder="e.g. 500"
                    value={form.amountOff}
                    onChange={(e) => setForm({ ...form, amountOff: e.target.value })}
                    className="pl-7"
                  />
                </div>
              </div>
            )}

            <Separator />

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>
                  Valid From <span className="text-destructive">*</span>
                </Label>
                <Input
                  type="date"
                  value={form.validFrom}
                  onChange={(e) => setForm({ ...form, validFrom: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label>
                  Valid Until <span className="text-destructive">*</span>
                </Label>
                <Input
                  type="date"
                  value={form.validUntil}
                  onChange={(e) => setForm({ ...form, validUntil: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>
                Description{' '}
                <span className="text-muted-foreground text-xs">(optional)</span>
              </Label>
              <Textarea
                rows={2}
                placeholder="Describe this offer to riders..."
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Featured Deal</p>
                <p className="text-xs text-muted-foreground">
                  Show prominently on your brand page
                </p>
              </div>
              <Switch
                checked={form.isFeatured}
                onCheckedChange={(v) => setForm({ ...form, isFeatured: v })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              className="bg-amber-500 hover:bg-amber-600 text-white"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Saving...
                </>
              ) : editingDiscount ? (
                'Update Discount'
              ) : (
                'Create Discount'
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
            <DialogTitle>Delete discount?</DialogTitle>
            <DialogDescription>
              <span className="font-medium">{deleteTarget?.title}</span>
              {deleteTarget?.code && (
                <>
                  {' '}
                  (code: <span className="font-mono">{deleteTarget.code}</span>)
                </>
              )}{' '}
              will be permanently removed. This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
