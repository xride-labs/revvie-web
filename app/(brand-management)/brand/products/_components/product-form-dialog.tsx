import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Loader2, Tag } from 'lucide-react'
import type {
  BrandProduct,
  BrandProductCategory,
  ProductAvailability,
} from '@/entities/business/model'
import { AVAILABILITY_CONFIG, PRODUCT_CATEGORIES } from '../_lib/constants'

export type ProductFormState = {
  title: string
  description: string
  sku: string
  category: BrandProductCategory
  price: string
  currency: string
  availability: ProductAvailability
  tags: string
  stockQty: string
}

export interface ProductFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editTarget: BrandProduct | null
  form: ProductFormState
  onFormChange: (form: ProductFormState) => void
  onSave: () => void
  saving: boolean
  addLabel: string
  dialogTitle: string
}

export function ProductFormDialog({
  open,
  onOpenChange,
  editTarget,
  form,
  onFormChange,
  onSave,
  saving,
  addLabel,
  dialogTitle,
}: ProductFormDialogProps) {
  const set = (patch: Partial<ProductFormState>) => onFormChange({ ...form, ...patch })

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onOpenChange(false)}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{editTarget ? 'Edit Product' : addLabel}</DialogTitle>
          <DialogDescription>
            {editTarget
              ? 'Update product details.'
              : `Add a new item to your ${dialogTitle.toLowerCase()}.`}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2 max-h-[65vh] overflow-y-auto pr-1">
          <div className="grid gap-1.5">
            <Label>
              Product Name <span className="text-destructive">*</span>
            </Label>
            <Input
              autoFocus
              placeholder="e.g. Pro Carbon Helmet V2"
              value={form.title}
              onChange={(e) => set({ title: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label>Category</Label>
              <Select
                value={form.category}
                onValueChange={(v) => set({ category: v as BrandProductCategory })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PRODUCT_CATEGORIES.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      {c.emoji} {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5">
              <Label>Availability</Label>
              <Select
                value={form.availability}
                onValueChange={(v) => set({ availability: v as ProductAvailability })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(
                    Object.entries(AVAILABILITY_CONFIG) as [
                      ProductAvailability,
                      (typeof AVAILABILITY_CONFIG)[ProductAvailability],
                    ][]
                  ).map(([v, cfg]) => (
                    <SelectItem key={v} value={v}>
                      {cfg.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="grid gap-1.5 col-span-2">
              <Label>
                Price <span className="text-muted-foreground text-xs">(₹, optional)</span>
              </Label>
              <Input
                type="number"
                min="0"
                placeholder="e.g. 4999"
                value={form.price}
                onChange={(e) => set({ price: e.target.value })}
              />
            </div>
            <div className="grid gap-1.5">
              <Label>Stock Qty</Label>
              <Input
                type="number"
                min="0"
                placeholder="e.g. 25"
                value={form.stockQty}
                onChange={(e) => set({ stockQty: e.target.value })}
              />
            </div>
          </div>

          <div className="grid gap-1.5">
            <Label>
              SKU <span className="text-muted-foreground text-xs">(optional)</span>
            </Label>
            <Input
              placeholder="e.g. PRO-HLM-V2-BLK"
              value={form.sku}
              onChange={(e) => set({ sku: e.target.value })}
              className="font-mono text-sm"
            />
          </div>

          <div className="grid gap-1.5">
            <Label>
              Description{' '}
              <span className="text-muted-foreground text-xs">(optional)</span>
            </Label>
            <Textarea
              rows={3}
              placeholder="Key features, materials, sizing info, certifications…"
              value={form.description}
              onChange={(e) => set({ description: e.target.value })}
            />
          </div>

          <div className="grid gap-1.5">
            <Label className="flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5" />
              Tags{' '}
              <span className="text-muted-foreground text-xs">(comma-separated)</span>
            </Label>
            <Input
              placeholder="e.g. touring, adventure, DOT certified, ECE 22.06"
              value={form.tags}
              onChange={(e) => set({ tags: e.target.value })}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancel
          </Button>
          <Button
            className="bg-amber-500 hover:bg-amber-600 text-white"
            onClick={onSave}
            disabled={saving || !form.title.trim()}
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Saving…
              </>
            ) : editTarget ? (
              'Save Changes'
            ) : (
              addLabel
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
