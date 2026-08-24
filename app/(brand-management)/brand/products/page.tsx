'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Loader2, Search, Star, EyeOff, Trash2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { useBulkSelection } from '@/hooks/use-bulk-selection'
import { BulkActionBar } from '@/components/bulk-action-bar'
import { usePerformBrandManagerBulkActionMutation } from '@/features/admin/api'
import {
  useGetBrandProductsQuery,
  useCreateBrandProductMutation,
  useUpdateBrandProductMutation,
  useDeleteBrandProductMutation,
} from '@/features/business/api'
import type {
  BrandProduct,
  BrandProductCategory,
  ProductAvailability,
} from '@/entities/business/model'
import { useBusinessContext } from '@/contexts/business-context'

import { PRODUCT_CATEGORIES, EMPTY_FORM, TYPE_COPY } from './_lib/constants'
import { ProductStats } from './_components/product-stats'
import { ProductFilters } from './_components/product-filters'
import { ProductCard } from './_components/product-card'
import { ProductTable } from './_components/product-table'
import {
  ProductFormDialog,
  type ProductFormState,
} from './_components/product-form-dialog'
import { DeleteProductDialog } from './_components/delete-product-dialog'

export default function BrandProductsPage() {
  const { success: successToast, error: errorToast } = useToast()
  const { business } = useBusinessContext()

  const {
    data: products = [],
    isLoading: loading,
    refetch: refetchProducts,
  } = useGetBrandProductsQuery(business?.id ?? '', { skip: !business?.id })
  const [createBrandProduct] = useCreateBrandProductMutation()
  const [updateBrandProduct] = useUpdateBrandProductMutation()
  const [deleteBrandProduct] = useDeleteBrandProductMutation()
  const [view, setView] = useState<'grid' | 'table'>('grid')
  const [search, setSearch] = useState('')
  const [filterCategory, setFilterCategory] = useState<BrandProductCategory | 'ALL'>(
    'ALL',
  )
  const [filterAvail, setFilterAvail] = useState<ProductAvailability | 'ALL'>('ALL')

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<BrandProduct | null>(null)
  const [form, setForm] = useState<ProductFormState>(EMPTY_FORM)
  const [saving, setSaving] = useState(false)

  const [deleteTarget, setDeleteTarget] = useState<BrandProduct | null>(null)
  const [deleting, setDeleting] = useState(false)

  const primaryCategory = business?.categories?.[0] ?? 'BRAND'
  const copy = TYPE_COPY[primaryCategory] ?? TYPE_COPY.BRAND

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

  const categoryCounts = useMemo(() => {
    const counts = new Map<BrandProductCategory, number>()
    for (const p of products) counts.set(p.category, (counts.get(p.category) ?? 0) + 1)
    return counts
  }, [products])

  // ─ Handlers ─────────────────────────────────────────────────────
  const openCreate = () => {
    setEditTarget(null)
    setForm(EMPTY_FORM)
    setDialogOpen(true)
  }

  const openEdit = (p: BrandProduct) => {
    setEditTarget(p)
    const stockQty = p.specs?.stockQty
    setForm({
      title: p.title,
      description: p.description ?? '',
      sku: p.sku ?? '',
      category: p.category,
      price: p.price != null ? String(p.price) : '',
      currency: p.currency ?? 'INR',
      availability: p.availability,
      tags: p.tags.join(', '),
      stockQty: typeof stockQty === 'number' ? String(stockQty) : '',
    })
    setDialogOpen(true)
  }

  const handleSave = async () => {
    if (!business) return
    setSaving(true)
    try {
      const specs: Record<string, number> = {}
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
        images: editTarget?.images ?? [],
        isActive: editTarget?.isActive ?? true,
        isFeatured: editTarget?.isFeatured ?? false,
      }
      if (editTarget) {
        await updateBrandProduct({
          businessId: business.id,
          productId: editTarget.id,
          data: payload,
        }).unwrap()
        successToast('Product updated')
      } else {
        await createBrandProduct({ businessId: business.id, data: payload }).unwrap()
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
      await updateBrandProduct({
        businessId: business.id,
        productId: p.id,
        data: { isActive: !p.isActive },
      }).unwrap()
    } catch {
      errorToast('Failed to update product')
    }
  }

  const handleToggleFeatured = async (p: BrandProduct) => {
    if (!business) return
    try {
      await updateBrandProduct({
        businessId: business.id,
        productId: p.id,
        data: { isFeatured: !p.isFeatured },
      }).unwrap()
    } catch {
      errorToast('Failed to update product')
    }
  }

  const handleDelete = async () => {
    if (!business || !deleteTarget) return
    setDeleting(true)
    try {
      await deleteBrandProduct({ businessId: business.id, productId: deleteTarget.id }).unwrap()
      successToast('Product deleted')
    } catch {
      errorToast('Failed to delete product')
    } finally {
      setDeleting(false)
      setDeleteTarget(null)
    }
  }

  // ── Bulk actions over the product catalogue (brand-manager scope) ──────────
  const sel = useBulkSelection()
  const [bulkBusy, setBulkBusy] = useState<string | null>(null)
  const [performBrandManagerBulkAction] = usePerformBrandManagerBulkActionMutation()

  const runBulkProducts = async (action: 'feature' | 'hide' | 'delete') => {
    if (!business || sel.count === 0) return
    const ids = sel.selectedIds
    setBulkBusy(action)
    try {
      const result = await performBrandManagerBulkAction({
        module: 'brand-products',
        action,
        ids,
      }).unwrap()
      await refetchProducts()
      sel.clear()
      successToast(
        `${result.processed} product${result.processed === 1 ? '' : 's'} updated`,
      )
    } catch {
      errorToast(`Bulk ${action} failed`)
    } finally {
      setBulkBusy(null)
    }
  }

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

      {products.length > 0 && <ProductStats stats={stats} />}

      {products.length > 0 && (
        <>
          <ProductFilters
            search={search}
            onSearchChange={setSearch}
            filterAvail={filterAvail}
            onFilterAvailChange={setFilterAvail}
            view={view}
            onViewChange={setView}
            filterCategory={filterCategory}
            onFilterCategoryChange={setFilterCategory}
            usedCategories={usedCategories}
            categoryCounts={categoryCounts}
            totalCount={products.length}
          />

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
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filtered.map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  onEdit={openEdit}
                  onToggleFeatured={handleToggleFeatured}
                  onToggleActive={handleToggleActive}
                  onDelete={setDeleteTarget}
                />
              ))}
            </div>
          ) : (
            <ProductTable
              products={filtered}
              isSelected={sel.isSelected}
              allSelected={sel.allSelected(filtered.map((p) => p.id))}
              onToggle={sel.toggle}
              onToggleAll={() => sel.toggleAll(filtered.map((p) => p.id))}
              onEdit={openEdit}
              onToggleFeatured={handleToggleFeatured}
              onToggleActive={handleToggleActive}
              onDelete={setDeleteTarget}
            />
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

      <ProductFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        editTarget={editTarget}
        form={form}
        onFormChange={setForm}
        onSave={handleSave}
        saving={saving}
        addLabel={copy.addLabel}
        dialogTitle={copy.title}
      />

      <BulkActionBar
        count={sel.count}
        busyKey={bulkBusy}
        onClear={sel.clear}
        actions={[
          {
            key: 'feature',
            label: 'Feature',
            icon: <Star className="h-4 w-4" />,
            onClick: () => runBulkProducts('feature'),
          },
          {
            key: 'hide',
            label: 'Hide',
            variant: 'outline',
            icon: <EyeOff className="h-4 w-4" />,
            onClick: () => runBulkProducts('hide'),
          },
          {
            key: 'delete',
            label: 'Delete',
            variant: 'destructive',
            icon: <Trash2 className="h-4 w-4" />,
            onClick: () => runBulkProducts('delete'),
          },
        ]}
      />

      <DeleteProductDialog
        target={deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        onConfirm={handleDelete}
        deleting={deleting}
      />
    </div>
  )
}
