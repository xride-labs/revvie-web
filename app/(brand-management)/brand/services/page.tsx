'use client'

import { useState } from 'react'
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
  Wrench,
  Plus,
  Loader2,
  MoreHorizontal,
  Trash2,
  Pencil,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import {
  useGetServicesQuery,
  useCreateServiceMutation,
  useUpdateServiceMutation,
  useDeleteServiceMutation,
} from '@/features/business/api'
import { useBusinessContext } from '@/contexts/business-context'
import type { ServiceListing, ServiceCategory } from '@/entities/business/model'

const SERVICE_CATEGORIES: { value: ServiceCategory; label: string }[] = [
  { value: 'GENERAL_SERVICE', label: 'General Service' },
  { value: 'OIL_CHANGE', label: 'Oil Change' },
  { value: 'BRAKE_SERVICE', label: 'Brake Service' },
  { value: 'TYRE_CHANGE', label: 'Tyre Change' },
  { value: 'ELECTRICAL', label: 'Electrical' },
  { value: 'SUSPENSION', label: 'Suspension' },
  { value: 'ENGINE_WORK', label: 'Engine Work' },
  { value: 'CUSTOM_MODIFICATION', label: 'Custom Modification' },
  { value: 'INSPECTION', label: 'Inspection' },
  { value: 'ROADSIDE_ASSISTANCE', label: 'Roadside Assistance' },
  { value: 'CONSULTATION', label: 'Consultation' },
]

const EMPTY_FORM = {
  title: '',
  description: '',
  category: 'GENERAL_SERVICE' as ServiceCategory,
  priceRange: '',
  duration: '',
}

export default function BrandServicesPage() {
  const { success: successToast, error: errorToast } = useToast()
  const { business, loading: businessLoading } = useBusinessContext()
  const businessId = business?.id ?? null
  const { data: services = [], isLoading: servicesLoading } = useGetServicesQuery(
    businessId ?? '',
    { skip: !businessId },
  )
  const [createService, { isLoading: creating }] = useCreateServiceMutation()
  const [updateService, { isLoading: updating }] = useUpdateServiceMutation()
  const [deleteService] = useDeleteServiceMutation()
  const saving = creating || updating
  const loading = businessLoading || (!!businessId && servicesLoading)

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<ServiceListing | null>(null)
  const [form, setForm] = useState(EMPTY_FORM)

  const [deleteTarget, setDeleteTarget] = useState<ServiceListing | null>(null)
  const [deleting, setDeleting] = useState(false)

  const openCreate = () => {
    setEditTarget(null)
    setForm(EMPTY_FORM)
    setDialogOpen(true)
  }

  const openEdit = (s: ServiceListing) => {
    setEditTarget(s)
    setForm({
      title: s.title,
      description: s.description ?? '',
      category: s.category,
      priceRange: s.priceRange ?? '',
      duration: s.duration ?? '',
    })
    setDialogOpen(true)
  }

  const handleSave = async () => {
    if (!businessId) return
    try {
      const payload = {
        title: form.title.trim(),
        description: form.description.trim() || null,
        category: form.category,
        priceRange: form.priceRange.trim() || null,
        duration: form.duration.trim() || null,
        isActive: editTarget?.isActive ?? true,
      }
      if (editTarget) {
        await updateService({
          businessId,
          serviceId: editTarget.id,
          data: payload,
        }).unwrap()
        successToast('Service updated')
      } else {
        await createService({ businessId, data: payload }).unwrap()
        successToast('Service added')
      }
      setDialogOpen(false)
    } catch {
      errorToast('Failed to save service')
    }
  }

  const handleToggleActive = async (s: ServiceListing) => {
    if (!businessId) return
    try {
      await updateService({
        businessId,
        serviceId: s.id,
        data: { isActive: !s.isActive },
      }).unwrap()
    } catch {
      errorToast('Failed to update service')
    }
  }

  const handleDelete = async () => {
    if (!businessId || !deleteTarget) return
    setDeleting(true)
    try {
      await deleteService({ businessId, serviceId: deleteTarget.id }).unwrap()
      successToast('Service deleted')
    } catch {
      errorToast('Failed to delete service')
    } finally {
      setDeleting(false)
      setDeleteTarget(null)
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">Services</h2>
          <p className="text-sm text-muted-foreground mt-1">
            List the services your garage or workshop offers
          </p>
        </div>
        <Button
          className="bg-amber-500 hover:bg-amber-600 text-white"
          onClick={openCreate}
        >
          <Plus className="w-4 h-4 mr-2" /> Add Service
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
        </div>
      ) : services.length === 0 ? (
        <Card className="border-dashed border-2">
          <CardContent className="py-20 text-center">
            <Wrench className="w-14 h-14 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="font-semibold text-lg mb-2">No services listed yet</h3>
            <p className="text-muted-foreground text-sm max-w-xs mx-auto mb-6">
              Add the services you offer — oil changes, brake work, custom mods — so
              riders can find and contact you.
            </p>
            <Button variant="outline" onClick={openCreate}>
              <Plus className="w-4 h-4 mr-2" /> Add your first service
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0 divide-y divide-border">
            {services.map((s) => (
              <div key={s.id} className="flex items-start gap-3 px-4 py-4">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0 mt-0.5">
                  <Wrench className="w-5 h-5 text-amber-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-medium text-sm">{s.title}</p>
                    <Badge variant="outline" className="text-xs">
                      {SERVICE_CATEGORIES.find((c) => c.value === s.category)?.label ??
                        s.category}
                    </Badge>
                    {!s.isActive && (
                      <Badge variant="outline" className="text-xs text-muted-foreground">
                        Hidden
                      </Badge>
                    )}
                  </div>
                  {s.description && (
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                      {s.description}
                    </p>
                  )}
                  <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                    {s.priceRange && <span>₹ {s.priceRange}</span>}
                    {s.duration && <span>⏱ {s.duration}</span>}
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => openEdit(s)}>
                      <Pencil className="w-4 h-4 mr-2" /> Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleToggleActive(s)}>
                      {s.isActive ? (
                        <>
                          <ToggleLeft className="w-4 h-4 mr-2" /> Hide from profile
                        </>
                      ) : (
                        <>
                          <ToggleRight className="w-4 h-4 mr-2" /> Show on profile
                        </>
                      )}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive"
                      onClick={() => setDeleteTarget(s)}
                    >
                      <Trash2 className="w-4 h-4 mr-2" /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Create / Edit dialog */}
      <Dialog open={dialogOpen} onOpenChange={(o) => !o && setDialogOpen(false)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editTarget ? 'Edit Service' : 'Add Service'}</DialogTitle>
            <DialogDescription>
              Describe what you offer so riders know what to expect.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-1.5">
              <Label>Service Name</Label>
              <Input
                placeholder="e.g. Full service + oil change"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              />
            </div>
            <div className="grid gap-1.5">
              <Label>Category</Label>
              <Select
                value={form.category}
                onValueChange={(v) =>
                  setForm((f) => ({ ...f, category: v as ServiceCategory }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SERVICE_CATEGORIES.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5">
              <Label>
                Description{' '}
                <span className="text-muted-foreground text-xs">(optional)</span>
              </Label>
              <Textarea
                placeholder="What's included, any conditions…"
                rows={3}
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label>
                  Price Range{' '}
                  <span className="text-muted-foreground text-xs">(optional)</span>
                </Label>
                <Input
                  placeholder="e.g. ₹500 – ₹1500"
                  value={form.priceRange}
                  onChange={(e) => setForm((f) => ({ ...f, priceRange: e.target.value }))}
                />
              </div>
              <div className="grid gap-1.5">
                <Label>
                  Duration{' '}
                  <span className="text-muted-foreground text-xs">(optional)</span>
                </Label>
                <Input
                  placeholder="e.g. 2–3 hours"
                  value={form.duration}
                  onChange={(e) => setForm((f) => ({ ...f, duration: e.target.value }))}
                />
              </div>
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
                'Add Service'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <Dialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete service?</DialogTitle>
            <DialogDescription>
              <span className="font-medium">{deleteTarget?.title}</span> will be
              permanently removed.
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
