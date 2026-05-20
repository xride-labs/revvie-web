'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Package,
  Plus,
  Loader2,
  MoreHorizontal,
  Trash2,
  Pencil,
  ToggleLeft,
  ToggleRight,
  Star,
  Tag,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import {
  businessApi,
  type BrandProduct,
  type BrandProductCategory,
  type ProductAvailability,
} from '@/lib/server/business'
import { useBusinessContext } from '@/contexts/business-context'

const PRODUCT_CATEGORIES: { value: BrandProductCategory; label: string }[] = [
  { value: 'MOTORCYCLE', label: 'Motorcycle' },
  { value: 'GEAR', label: 'Gear' },
  { value: 'HELMET', label: 'Helmet' },
  { value: 'JACKET', label: 'Jacket' },
  { value: 'GLOVES', label: 'Gloves' },
  { value: 'BOOTS', label: 'Boots' },
  { value: 'PANTS', label: 'Pants' },
  { value: 'PARTS', label: 'Parts' },
  { value: 'ACCESSORIES', label: 'Accessories' },
  { value: 'ELECTRONICS', label: 'Electronics' },
  { value: 'TOOLS', label: 'Tools' },
  { value: 'LUBRICANTS', label: 'Lubricants' },
  { value: 'TYRES', label: 'Tyres' },
  { value: 'LIGHTING', label: 'Lighting' },
  { value: 'APPAREL', label: 'Apparel' },
  { value: 'MEMORABILIA', label: 'Memorabilia' },
  { value: 'OTHER', label: 'Other' },
]

const AVAILABILITY_OPTIONS: { value: ProductAvailability; label: string; color: string }[] = [
  { value: 'IN_STOCK', label: 'In Stock', color: 'text-green-500' },
  { value: 'OUT_OF_STOCK', label: 'Out of Stock', color: 'text-destructive' },
  { value: 'PRE_ORDER', label: 'Pre-Order', color: 'text-amber-500' },
  { value: 'DISCONTINUED', label: 'Discontinued', color: 'text-muted-foreground' },
]

const EMPTY_FORM = {
  title: '',
  description: '',
  sku: '',
  category: 'OTHER' as BrandProductCategory,
  price: '',
  availability: 'IN_STOCK' as ProductAvailability,
  tags: '',
}

export default function BrandProductsPage() {
  const { success: successToast, error: errorToast } = useToast()
  const { business } = useBusinessContext()

  const [products, setProducts] = useState<BrandProduct[]>([])
  const [loading, setLoading] = useState(true)

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<BrandProduct | null>(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)

  const [deleteTarget, setDeleteTarget] = useState<BrandProduct | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (!business) return
    async function load() {
      try {
        const items = await businessApi.getBrandProducts(business!.id)
        setProducts(items)
      } catch {
        // no-op
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [business])

  const openCreate = () => {
    setEditTarget(null)
    setForm(EMPTY_FORM)
    setDialogOpen(true)
  }

  const openEdit = (p: BrandProduct) => {
    setEditTarget(p)
    setForm({
      title: p.title,
      description: p.description ?? '',
      sku: p.sku ?? '',
      category: p.category,
      price: p.price != null ? String(p.price) : '',
      availability: p.availability,
      tags: p.tags.join(', '),
    })
    setDialogOpen(true)
  }

  const handleSave = async () => {
    if (!business) return
    setSaving(true)
    try {
      const payload = {
        title: form.title.trim(),
        description: form.description.trim() || null,
        sku: form.sku.trim() || null,
        category: form.category,
        price: form.price ? parseFloat(form.price) : null,
        availability: form.availability,
        tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
      }
      if (editTarget) {
        const updated = await businessApi.updateBrandProduct(business.id, editTarget.id, payload)
        setProducts((prev) => prev.map((p) => p.id === updated.id ? updated : p))
        successToast('Product updated')
      } else {
        const created = await businessApi.createBrandProduct(business.id, payload)
        setProducts((prev) => [created, ...prev])
        successToast('Product added')
      }
      setDialogOpen(false)
    } catch {
      errorToast('Failed to save product')
    } finally {
      setSaving(false)
    }
  }

  const handleToggleActive = async (p: BrandProduct) => {
    if (!business) return
    try {
      const updated = await businessApi.updateBrandProduct(business.id, p.id, { isActive: !p.isActive })
      setProducts((prev) => prev.map((item) => item.id === updated.id ? updated : item))
    } catch {
      errorToast('Failed to update product')
    }
  }

  const handleToggleFeatured = async (p: BrandProduct) => {
    if (!business) return
    try {
      const updated = await businessApi.updateBrandProduct(business.id, p.id, { isFeatured: !p.isFeatured })
      setProducts((prev) => prev.map((item) => item.id === updated.id ? updated : item))
    } catch {
      errorToast('Failed to update product')
    }
  }

  const handleDelete = async () => {
    if (!business || !deleteTarget) return
    setDeleting(true)
    try {
      await businessApi.deleteBrandProduct(business.id, deleteTarget.id)
      setProducts((prev) => prev.filter((p) => p.id !== deleteTarget.id))
      successToast('Product deleted')
    } catch {
      errorToast('Failed to delete product')
    } finally {
      setDeleting(false)
      setDeleteTarget(null)
    }
  }

  const getCategoryLabel = (cat: BrandProductCategory) =>
    PRODUCT_CATEGORIES.find((c) => c.value === cat)?.label ?? cat

  const getAvailabilityConfig = (a: ProductAvailability) =>
    AVAILABILITY_OPTIONS.find((o) => o.value === a) ?? AVAILABILITY_OPTIONS[0]

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">Products</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Your brand catalog — gear, parts, merchandise</p>
        </div>
        <Button className="bg-amber-500 hover:bg-amber-600 text-white" onClick={openCreate}>
          <Plus className="w-4 h-4 mr-2" /> Add Product
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
        </div>
      ) : products.length === 0 ? (
        <Card className="border-dashed border-2">
          <CardContent className="py-20 text-center">
            <Package className="w-14 h-14 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="font-semibold text-lg mb-2">No products yet</h3>
            <p className="text-muted-foreground text-sm max-w-xs mx-auto mb-6">
              Add your brand&apos;s products — helmets, jackets, parts, merchandise — and list them on the Zoomies marketplace.
            </p>
            <Button className="bg-amber-500 hover:bg-amber-600 text-white" onClick={openCreate}>
              <Plus className="w-4 h-4 mr-2" /> Add your first product
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((p) => {
            const avail = getAvailabilityConfig(p.availability)
            return (
              <Card key={p.id} className={`overflow-hidden ${!p.isActive ? 'opacity-60' : ''}`}>
                <div className="relative">
                  {p.images?.[0] ? (
                    <img src={p.images[0]} alt={p.title} className="w-full h-40 object-cover" />
                  ) : (
                    <div className="w-full h-40 bg-muted flex items-center justify-center">
                      <Package className="w-10 h-10 text-muted-foreground/30" />
                    </div>
                  )}
                  {p.isFeatured && (
                    <div className="absolute top-2 left-2">
                      <Badge className="bg-amber-500 text-white text-[10px] px-1.5 gap-0.5">
                        <Star className="w-2.5 h-2.5 fill-white" /> Featured
                      </Badge>
                    </div>
                  )}
                  {!p.isActive && (
                    <div className="absolute inset-0 bg-background/60 flex items-center justify-center">
                      <span className="bg-background text-sm font-semibold px-3 py-1 rounded-full border">Hidden</span>
                    </div>
                  )}
                </div>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-medium truncate flex-1 text-sm">{p.title}</p>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0 -mr-1 -mt-0.5">
                          <MoreHorizontal className="w-3.5 h-3.5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEdit(p)}>
                          <Pencil className="w-4 h-4 mr-2" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleToggleFeatured(p)}>
                          <Star className="w-4 h-4 mr-2" /> {p.isFeatured ? 'Unfeature' : 'Feature'}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleToggleActive(p)}>
                          {p.isActive
                            ? <><ToggleLeft className="w-4 h-4 mr-2" /> Hide</>
                            : <><ToggleRight className="w-4 h-4 mr-2" /> Show</>}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => setDeleteTarget(p)}
                        >
                          <Trash2 className="w-4 h-4 mr-2" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <Badge variant="outline" className="text-[10px] px-1.5">{getCategoryLabel(p.category)}</Badge>
                    <span className={`text-xs font-medium ${avail.color}`}>{avail.label}</span>
                  </div>
                  {p.price != null && (
                    <p className="text-sm font-bold text-amber-500 mt-1">
                      ₹{p.price.toLocaleString()}
                    </p>
                  )}
                  {p.tags.length > 0 && (
                    <div className="flex items-center gap-1 mt-1 flex-wrap">
                      <Tag className="w-3 h-3 text-muted-foreground" />
                      {p.tags.slice(0, 3).map((t) => (
                        <span key={t} className="text-[10px] text-muted-foreground">{t}</span>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Create / Edit dialog */}
      <Dialog open={dialogOpen} onOpenChange={(o) => !o && setDialogOpen(false)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editTarget ? 'Edit Product' : 'Add Product'}</DialogTitle>
            <DialogDescription>
              {editTarget ? 'Update your product details.' : 'Add a new product to your brand catalog.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2 max-h-[60vh] overflow-y-auto pr-1">
            <div className="grid gap-1.5">
              <Label>Product Name <span className="text-destructive">*</span></Label>
              <Input
                placeholder="e.g. Pro Carbon Helmet V2"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label>Category</Label>
                <Select value={form.category} onValueChange={(v) => setForm((f) => ({ ...f, category: v as BrandProductCategory }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {PRODUCT_CATEGORIES.map((c) => (
                      <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-1.5">
                <Label>Availability</Label>
                <Select value={form.availability} onValueChange={(v) => setForm((f) => ({ ...f, availability: v as ProductAvailability }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {AVAILABILITY_OPTIONS.map((o) => (
                      <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label>Price <span className="text-muted-foreground text-xs">(₹, optional)</span></Label>
                <Input
                  type="number"
                  placeholder="e.g. 4999"
                  value={form.price}
                  onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                />
              </div>
              <div className="grid gap-1.5">
                <Label>SKU <span className="text-muted-foreground text-xs">(optional)</span></Label>
                <Input
                  placeholder="e.g. PRO-HLM-V2-BLK"
                  value={form.sku}
                  onChange={(e) => setForm((f) => ({ ...f, sku: e.target.value }))}
                />
              </div>
            </div>
            <div className="grid gap-1.5">
              <Label>Description <span className="text-muted-foreground text-xs">(optional)</span></Label>
              <Textarea
                rows={3}
                placeholder="Key features, materials, sizing info..."
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              />
            </div>
            <div className="grid gap-1.5">
              <Label>Tags <span className="text-muted-foreground text-xs">(comma-separated, optional)</span></Label>
              <Input
                placeholder="e.g. touring, adventure, DOT certified"
                value={form.tags}
                onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={saving}>Cancel</Button>
            <Button
              className="bg-amber-500 hover:bg-amber-600 text-white"
              onClick={handleSave}
              disabled={saving || !form.title.trim()}
            >
              {saving ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Saving…</> : editTarget ? 'Save Changes' : 'Add Product'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <Dialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete product?</DialogTitle>
            <DialogDescription>
              <span className="font-medium">{deleteTarget?.title}</span> will be permanently removed from your catalog.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)} disabled={deleting}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Deleting…</> : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
