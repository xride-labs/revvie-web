'use client'

import { useEffect, useState, useMemo } from 'react'
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Package,
  Plus,
  Loader2,
  MoreHorizontal,
  Trash2,
  Pencil,
  Star,
  Tag,
  Search,
  LayoutGrid,
  List,
  Eye,
  EyeOff,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'
import {
  businessApi,
  type BrandProduct,
  type BrandProductCategory,
  type ProductAvailability,
} from '@/lib/server/business'
import { useBusinessContext } from '@/contexts/business-context'

// ─── Constants ──────────────────────────────────────────────────────────────

const PRODUCT_CATEGORIES: {
  value: BrandProductCategory
  label: string
  emoji: string
}[] = [
  { value: 'MOTORCYCLE', label: 'Motorcycle', emoji: '🏍️' },
  { value: 'HELMET', label: 'Helmet', emoji: '⛑️' },
  { value: 'JACKET', label: 'Jacket', emoji: '🧥' },
  { value: 'GEAR', label: 'Gear', emoji: '🥊' },
  { value: 'GLOVES', label: 'Gloves', emoji: '🧤' },
  { value: 'BOOTS', label: 'Boots', emoji: '🥾' },
  { value: 'PANTS', label: 'Pants', emoji: '👖' },
  { value: 'PARTS', label: 'Parts', emoji: '⚙️' },
  { value: 'ACCESSORIES', label: 'Accessories', emoji: '🔧' },
  { value: 'TYRES', label: 'Tyres', emoji: '🔵' },
  { value: 'ELECTRONICS', label: 'Electronics', emoji: '📱' },
  { value: 'LIGHTING', label: 'Lighting', emoji: '💡' },
  { value: 'LUBRICANTS', label: 'Lubricants', emoji: '🛢️' },
  { value: 'TOOLS', label: 'Tools', emoji: '🔨' },
  { value: 'APPAREL', label: 'Apparel', emoji: '👕' },
  { value: 'MEMORABILIA', label: 'Memorabilia', emoji: '🏆' },
  { value: 'OTHER', label: 'Other', emoji: '📦' },
]

const AVAILABILITY_CONFIG: Record<
  ProductAvailability,
  { label: string; color: string; bg: string; icon: React.ElementType }
> = {
  IN_STOCK: {
    label: 'In Stock',
    color: 'text-green-600 dark:text-green-400',
    bg: 'bg-green-500/10 border-green-500/20',
    icon: CheckCircle2,
  },
  OUT_OF_STOCK: {
    label: 'Out of Stock',
    color: 'text-red-600 dark:text-destructive',
    bg: 'bg-destructive/10 border-destructive/20',
    icon: XCircle,
  },
  PRE_ORDER: {
    label: 'Pre-Order',
    color: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-500/10 border-amber-500/20',
    icon: Clock,
  },
  DISCONTINUED: {
    label: 'Discontinued',
    color: 'text-muted-foreground',
    bg: 'bg-muted border-border',
    icon: AlertCircle,
  },
}

const EMPTY_FORM = {
  title: '',
  description: '',
  sku: '',
  category: 'OTHER' as BrandProductCategory,
  price: '',
  currency: 'INR',
  availability: 'IN_STOCK' as ProductAvailability,
  tags: '',
  stockQty: '',
}

// Type-specific copy
const TYPE_COPY: Record<
  string,
  {
    title: string
    subtitle: string
    addLabel: string
    emptyTitle: string
    emptyBody: string
  }
> = {
  BRAND: {
    title: 'Catalogue',
    subtitle: 'Manage your official product lineup',
    addLabel: 'Add Product',
    emptyTitle: 'Build your catalogue',
    emptyBody:
      "Add your brand's products — helmets, jackets, bikes — to the Zoomies marketplace.",
  },
  GEAR_SELLER: {
    title: 'Gear Inventory',
    subtitle: 'Manage your gear & apparel stock',
    addLabel: 'Add Gear',
    emptyTitle: 'List your gear',
    emptyBody: 'Add riding gear, apparel, and accessories to start selling.',
  },
  HELMET_SELLER: {
    title: 'Helmet Inventory',
    subtitle: 'Manage your helmet catalogue',
    addLabel: 'Add Helmet',
    emptyTitle: 'Add your helmets',
    emptyBody: 'List your helmet models with specs, certifications, and pricing.',
  },
  PARTS_SELLER: {
    title: 'Parts Inventory',
    subtitle: 'SKU-tracked parts & accessories',
    addLabel: 'Add Part',
    emptyTitle: 'Add your parts',
    emptyBody: 'Add spares, performance parts, and accessories with SKU tracking.',
  },
  SERVICE_STORE: {
    title: 'Products & Parts',
    subtitle: 'Retail products and accessories sold at your workshop',
    addLabel: 'Add Product',
    emptyTitle: 'No products yet',
    emptyBody: 'Add retail products or parts you sell at your service centre.',
  },
  MECHANIC: {
    title: 'Parts & Products',
    subtitle: 'Parts and tools you stock',
    addLabel: 'Add Product',
    emptyTitle: 'No products listed',
    emptyBody: 'Add the parts and products you stock and sell to riders.',
  },
  MARKETPLACE_SELLER: {
    title: 'Listings',
    subtitle: 'Your multi-category product listings',
    addLabel: 'Add Listing',
    emptyTitle: 'No listings yet',
    emptyBody: 'Add products across categories to start selling on Zoomies.',
  },
  CONSULTATION: {
    title: 'Products & Resources',
    subtitle: 'Merchandise and resources for your advisory',
    addLabel: 'Add Item',
    emptyTitle: 'No items yet',
    emptyBody: 'Add courses, merchandise, or resources riders can purchase.',
  },
}

// ─── Component ──────────────────────────────────────────────────────────────

export default function BrandProductsPage() {
  const { success: successToast, error: errorToast } = useToast()
  const { business } = useBusinessContext()

  const [products, setProducts] = useState<BrandProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<'grid' | 'table'>('grid')
  const [search, setSearch] = useState('')
  const [filterCategory, setFilterCategory] = useState<BrandProductCategory | 'ALL'>(
    'ALL',
  )
  const [filterAvail, setFilterAvail] = useState<ProductAvailability | 'ALL'>('ALL')

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<BrandProduct | null>(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)

  const [deleteTarget, setDeleteTarget] = useState<BrandProduct | null>(null)
  const [deleting, setDeleting] = useState(false)

  const primaryCategory = business?.categories?.[0] ?? 'BRAND'
  const copy = TYPE_COPY[primaryCategory] ?? TYPE_COPY.BRAND

  useEffect(() => {
    if (!business) return
    setLoading(true)
    businessApi
      .getBrandProducts(business.id)
      .then(setProducts)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [business])

  // ─ Derived ──────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    let list = products
    if (search)
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(search.toLowerCase()) ||
          (p.sku ?? '').toLowerCase().includes(search.toLowerCase()),
      )
    if (filterCategory !== 'ALL') list = list.filter((p) => p.category === filterCategory)
    if (filterAvail !== 'ALL') list = list.filter((p) => p.availability === filterAvail)
    return list
  }, [products, search, filterCategory, filterAvail])

  const stats = useMemo(
    () => ({
      total: products.length,
      inStock: products.filter((p) => p.availability === 'IN_STOCK' && p.isActive).length,
      outOfStock: products.filter((p) => p.availability === 'OUT_OF_STOCK').length,
      hidden: products.filter((p) => !p.isActive).length,
      featured: products.filter((p) => p.isFeatured).length,
    }),
    [products],
  )

  const usedCategories = useMemo(() => {
    const cats = new Set(products.map((p) => p.category))
    return PRODUCT_CATEGORIES.filter((c) => cats.has(c.value))
  }, [products])

  // ─ Handlers ─────────────────────────────────────────────────────
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
      currency: (p as any).currency ?? 'INR',
      availability: p.availability,
      tags: p.tags.join(', '),
      stockQty:
        (p as any).specs?.stockQty != null ? String((p as any).specs.stockQty) : '',
    })
    setDialogOpen(true)
  }

  const handleSave = async () => {
    if (!business) return
    setSaving(true)
    try {
      const specs: Record<string, any> = {}
      if (form.stockQty) specs.stockQty = parseInt(form.stockQty, 10)

      const payload = {
        title: form.title.trim(),
        description: form.description.trim() || null,
        sku: form.sku.trim() || null,
        category: form.category,
        price: form.price ? parseFloat(form.price) : null,
        currency: form.currency,
        availability: form.availability,
        tags: form.tags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
        specs: Object.keys(specs).length > 0 ? specs : undefined,
      }
      if (editTarget) {
        const updated = await businessApi.updateBrandProduct(
          business.id,
          editTarget.id,
          payload,
        )
        setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)))
        successToast('Product updated')
      } else {
        const created = await businessApi.createBrandProduct(business.id, payload)
        setProducts((prev) => [created, ...prev])
        successToast(`${copy.addLabel.replace('Add ', '')} added to catalogue`)
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
      const updated = await businessApi.updateBrandProduct(business.id, p.id, {
        isActive: !p.isActive,
      })
      setProducts((prev) => prev.map((item) => (item.id === updated.id ? updated : item)))
    } catch {
      errorToast('Failed to update product')
    }
  }

  const handleToggleFeatured = async (p: BrandProduct) => {
    if (!business) return
    try {
      const updated = await businessApi.updateBrandProduct(business.id, p.id, {
        isFeatured: !p.isFeatured,
      })
      setProducts((prev) => prev.map((item) => (item.id === updated.id ? updated : item)))
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

  const getCategoryMeta = (cat: BrandProductCategory) =>
    PRODUCT_CATEGORIES.find((c) => c.value === cat)

  // ─ Render ────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-5">
      {/* Page header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">{copy.title}</h2>
          <p className="text-sm text-muted-foreground mt-0.5">{copy.subtitle}</p>
        </div>
        <Button
          className="bg-amber-500 hover:bg-amber-600 text-white shrink-0"
          onClick={openCreate}
        >
          <Plus className="w-4 h-4 mr-2" /> {copy.addLabel}
        </Button>
      </div>

      {/* Stats strip */}
      {products.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {[
            { label: 'Total', value: stats.total, color: 'text-foreground' },
            { label: 'In Stock', value: stats.inStock, color: 'text-green-500' },
            { label: 'Out of Stock', value: stats.outOfStock, color: 'text-destructive' },
            { label: 'Hidden', value: stats.hidden, color: 'text-muted-foreground' },
            { label: 'Featured', value: stats.featured, color: 'text-amber-500' },
          ].map((s) => (
            <Card key={s.label}>
              <CardContent className="py-3 px-4">
                <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {products.length > 0 && (
        <>
          {/* Filters row */}
          <div className="flex flex-wrap gap-3 items-center">
            <div className="relative flex-1 min-w-48">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or SKU…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>

            <Select value={filterAvail} onValueChange={(v) => setFilterAvail(v as any)}>
              <SelectTrigger className="w-40">
                <Filter className="w-3.5 h-3.5 mr-1.5" />
                <SelectValue placeholder="Availability" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All availability</SelectItem>
                {(Object.keys(AVAILABILITY_CONFIG) as ProductAvailability[]).map((a) => (
                  <SelectItem key={a} value={a}>
                    {AVAILABILITY_CONFIG[a].label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* View toggle */}
            <div className="flex items-center border border-border rounded-lg overflow-hidden">
              <button
                onClick={() => setView('grid')}
                className={cn(
                  'p-2 transition-colors',
                  view === 'grid' ? 'bg-muted' : 'hover:bg-muted/50',
                )}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setView('table')}
                className={cn(
                  'p-2 transition-colors',
                  view === 'table' ? 'bg-muted' : 'hover:bg-muted/50',
                )}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Category filter pills */}
          {usedCategories.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide -mx-4 px-4">
              <button
                onClick={() => setFilterCategory('ALL')}
                className={cn(
                  'px-3 py-1.5 rounded-full text-xs font-medium border whitespace-nowrap transition-all',
                  filterCategory === 'ALL'
                    ? 'border-amber-500 bg-amber-500/10 text-amber-600 dark:text-amber-400'
                    : 'border-border text-muted-foreground hover:border-amber-500/40',
                )}
              >
                All ({products.length})
              </button>
              {usedCategories.map((c) => {
                const count = products.filter((p) => p.category === c.value).length
                return (
                  <button
                    key={c.value}
                    onClick={() => setFilterCategory(c.value)}
                    className={cn(
                      'px-3 py-1.5 rounded-full text-xs font-medium border whitespace-nowrap transition-all',
                      filterCategory === c.value
                        ? 'border-amber-500 bg-amber-500/10 text-amber-600 dark:text-amber-400'
                        : 'border-border text-muted-foreground hover:border-amber-500/40',
                    )}
                  >
                    {c.emoji} {c.label} ({count})
                  </button>
                )
              })}
            </div>
          )}

          {filtered.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Search className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="font-medium">No products match your filters</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-3"
                onClick={() => {
                  setSearch('')
                  setFilterCategory('ALL')
                  setFilterAvail('ALL')
                }}
              >
                Clear filters
              </Button>
            </div>
          ) : view === 'grid' ? (
            /* ── Grid view ── */
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filtered.map((p) => {
                const avail = AVAILABILITY_CONFIG[p.availability]
                const catMeta = getCategoryMeta(p.category)
                const AvailIcon = avail.icon
                const stockQty = (p as any).specs?.stockQty
                return (
                  <Card
                    key={p.id}
                    className={cn(
                      'overflow-hidden group transition-all hover:shadow-md',
                      !p.isActive && 'opacity-60',
                    )}
                  >
                    {/* Image */}
                    <div className="relative">
                      {p.images?.[0] ? (
                        <img
                          src={p.images[0]}
                          alt={p.title}
                          className="w-full h-44 object-cover"
                        />
                      ) : (
                        <div className="w-full h-44 bg-muted flex items-center justify-center">
                          <span className="text-4xl">{catMeta?.emoji ?? '📦'}</span>
                        </div>
                      )}
                      {/* Availability chip on image */}
                      <div
                        className={cn(
                          'absolute top-2 right-2 flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-semibold backdrop-blur-sm',
                          avail.bg,
                          avail.color,
                        )}
                      >
                        <AvailIcon className="w-3 h-3" />
                        {avail.label}
                      </div>
                      {p.isFeatured && (
                        <div className="absolute top-2 left-2">
                          <Badge className="bg-amber-500 text-white text-[10px] px-1.5 gap-0.5">
                            <Star className="w-2.5 h-2.5 fill-white" /> Featured
                          </Badge>
                        </div>
                      )}
                      {!p.isActive && (
                        <div className="absolute inset-0 bg-background/60 flex items-center justify-center">
                          <span className="bg-background text-xs font-semibold px-3 py-1 rounded-full border flex items-center gap-1">
                            <EyeOff className="w-3.5 h-3.5" /> Hidden
                          </span>
                        </div>
                      )}
                    </div>

                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm leading-snug truncate">
                            {p.title}
                          </p>
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            <span className="text-[10px] text-muted-foreground border border-border rounded px-1.5 py-0.5">
                              {catMeta?.emoji} {catMeta?.label ?? p.category}
                            </span>
                            {p.sku && (
                              <span className="text-[10px] text-muted-foreground font-mono">
                                {p.sku}
                              </span>
                            )}
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 shrink-0 opacity-0 group-hover:opacity-100 -mr-1 -mt-0.5"
                            >
                              <MoreHorizontal className="w-3.5 h-3.5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openEdit(p)}>
                              <Pencil className="w-4 h-4 mr-2" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleToggleFeatured(p)}>
                              <Star className="w-4 h-4 mr-2" />{' '}
                              {p.isFeatured ? 'Unfeature' : 'Feature'}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleToggleActive(p)}>
                              {p.isActive ? (
                                <>
                                  <EyeOff className="w-4 h-4 mr-2" /> Hide
                                </>
                              ) : (
                                <>
                                  <Eye className="w-4 h-4 mr-2" /> Show
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => setDeleteTarget(p)}
                            >
                              <Trash2 className="w-4 h-4 mr-2" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      <div className="mt-2 flex items-center justify-between">
                        {p.price != null ? (
                          <p className="text-base font-bold text-amber-500">
                            ₹{p.price.toLocaleString('en-IN')}
                          </p>
                        ) : (
                          <p className="text-xs text-muted-foreground italic">
                            No price set
                          </p>
                        )}
                        {stockQty != null && (
                          <span
                            className={cn(
                              'text-xs font-medium',
                              stockQty === 0
                                ? 'text-destructive'
                                : 'text-muted-foreground',
                            )}
                          >
                            Qty: {stockQty}
                          </span>
                        )}
                      </div>

                      {p.tags.length > 0 && (
                        <div className="flex items-center gap-1 mt-2 flex-wrap">
                          {p.tags.slice(0, 3).map((t) => (
                            <span
                              key={t}
                              className="text-[10px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground"
                            >
                              {t}
                            </span>
                          ))}
                          {p.tags.length > 3 && (
                            <span className="text-[10px] text-muted-foreground">
                              +{p.tags.length - 3}
                            </span>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          ) : (
            /* ── Table view ── */
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10" />
                    <TableHead>Product</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Availability</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-10" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((p) => {
                    const avail = AVAILABILITY_CONFIG[p.availability]
                    const catMeta = getCategoryMeta(p.category)
                    const AvailIcon = avail.icon
                    const stockQty = (p as any).specs?.stockQty
                    return (
                      <TableRow key={p.id} className={!p.isActive ? 'opacity-60' : ''}>
                        <TableCell>
                          <div className="w-10 h-10 rounded-lg bg-muted overflow-hidden flex items-center justify-center shrink-0">
                            {p.images?.[0] ? (
                              <img
                                src={p.images[0]}
                                alt=""
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span className="text-lg">{catMeta?.emoji ?? '📦'}</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium text-sm">{p.title}</p>
                            {p.isFeatured && (
                              <Badge className="bg-amber-500 text-white text-[10px] px-1.5 gap-0.5 mt-0.5">
                                <Star className="w-2.5 h-2.5 fill-white" /> Featured
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-xs">
                            {catMeta?.emoji} {catMeta?.label}
                          </span>
                        </TableCell>
                        <TableCell>
                          {p.sku ? (
                            <span className="text-xs font-mono text-muted-foreground">
                              {p.sku}
                            </span>
                          ) : (
                            <span className="text-xs text-muted-foreground/40">—</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {p.price != null ? (
                            <span className="font-semibold text-amber-500 text-sm">
                              ₹{p.price.toLocaleString('en-IN')}
                            </span>
                          ) : (
                            <span className="text-xs text-muted-foreground/40">—</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {stockQty != null ? (
                            <span
                              className={cn(
                                'text-sm font-medium',
                                stockQty === 0 ? 'text-destructive' : '',
                              )}
                            >
                              {stockQty}
                            </span>
                          ) : (
                            <span className="text-xs text-muted-foreground/40">—</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div
                            className={cn(
                              'inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-xs font-medium',
                              avail.bg,
                              avail.color,
                            )}
                          >
                            <AvailIcon className="w-3 h-3" />
                            {avail.label}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span
                            className={cn(
                              'text-xs font-medium',
                              p.isActive ? 'text-green-500' : 'text-muted-foreground',
                            )}
                          >
                            {p.isActive ? 'Visible' : 'Hidden'}
                          </span>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-7 w-7">
                                <MoreHorizontal className="w-3.5 h-3.5" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => openEdit(p)}>
                                <Pencil className="w-4 h-4 mr-2" /> Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleToggleFeatured(p)}>
                                <Star className="w-4 h-4 mr-2" />{' '}
                                {p.isFeatured ? 'Unfeature' : 'Feature'}
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleToggleActive(p)}>
                                {p.isActive ? (
                                  <>
                                    <EyeOff className="w-4 h-4 mr-2" /> Hide
                                  </>
                                ) : (
                                  <>
                                    <Eye className="w-4 h-4 mr-2" /> Show
                                  </>
                                )}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => setDeleteTarget(p)}
                              >
                                <Trash2 className="w-4 h-4 mr-2" /> Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </Card>
          )}
        </>
      )}

      {/* Empty state */}
      {products.length === 0 && (
        <Card className="border-dashed border-2">
          <CardContent className="py-20 text-center">
            <div className="text-5xl mb-4">
              {primaryCategory === 'HELMET_SELLER'
                ? '⛑️'
                : primaryCategory === 'GEAR_SELLER'
                  ? '🥊'
                  : primaryCategory === 'PARTS_SELLER'
                    ? '⚙️'
                    : primaryCategory === 'SERVICE_STORE' ||
                        primaryCategory === 'MECHANIC'
                      ? '🔧'
                      : '📦'}
            </div>
            <h3 className="font-semibold text-lg mb-2">{copy.emptyTitle}</h3>
            <p className="text-muted-foreground text-sm max-w-xs mx-auto mb-6">
              {copy.emptyBody}
            </p>
            <Button
              className="bg-amber-500 hover:bg-amber-600 text-white"
              onClick={openCreate}
            >
              <Plus className="w-4 h-4 mr-2" /> {copy.addLabel}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* ── Create / Edit dialog ── */}
      <Dialog open={dialogOpen} onOpenChange={(o) => !o && setDialogOpen(false)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editTarget ? 'Edit Product' : copy.addLabel}</DialogTitle>
            <DialogDescription>
              {editTarget
                ? 'Update product details.'
                : `Add a new item to your ${copy.title.toLowerCase()}.`}
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
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label>Category</Label>
                <Select
                  value={form.category}
                  onValueChange={(v) =>
                    setForm((f) => ({ ...f, category: v as BrandProductCategory }))
                  }
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
                  onValueChange={(v) =>
                    setForm((f) => ({ ...f, availability: v as ProductAvailability }))
                  }
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
                  Price{' '}
                  <span className="text-muted-foreground text-xs">(₹, optional)</span>
                </Label>
                <Input
                  type="number"
                  min="0"
                  placeholder="e.g. 4999"
                  value={form.price}
                  onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                />
              </div>
              <div className="grid gap-1.5">
                <Label>Stock Qty</Label>
                <Input
                  type="number"
                  min="0"
                  placeholder="e.g. 25"
                  value={form.stockQty}
                  onChange={(e) => setForm((f) => ({ ...f, stockQty: e.target.value }))}
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
                onChange={(e) => setForm((f) => ({ ...f, sku: e.target.value }))}
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
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
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
                onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))}
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
                copy.addLabel
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Delete confirmation ── */}
      <Dialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete product?</DialogTitle>
            <DialogDescription>
              <span className="font-medium">{deleteTarget?.title}</span> will be
              permanently removed from your catalogue.
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
                  Deleting…
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
