'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  useGetBusinessQuery,
  useUpdateBusinessMutation,
  useSubmitBusinessMutation,
} from '@/features/business/api'
import { useUploadBusinessImageMutation } from '@/features/media/api'
import type { BusinessCategory, BusinessProfile } from '@/entities/business/model'
import type { UpdateBusinessInput } from '@/features/business/schemas'
import { useToast } from '@/hooks/use-toast'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
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
import { Badge } from '@/components/ui/badge'
import { Loader2, ChevronLeft, ExternalLink, Upload, X } from 'lucide-react'
import { Separator } from '@/components/ui/separator'

const CATEGORIES: Array<{ label: string; value: BusinessCategory }> = [
  { label: 'Motorcycle Brand', value: 'BRAND' },
  { label: 'Riding Gear', value: 'GEAR_SELLER' },
  { label: 'Helmets', value: 'HELMET_SELLER' },
  { label: 'Parts & Accessories', value: 'PARTS_SELLER' },
  { label: 'Marketplace Seller', value: 'MARKETPLACE_SELLER' },
  { label: 'Riding Club', value: 'CLUB' },
  { label: 'Service Store', value: 'SERVICE_STORE' },
  { label: 'Independent Mechanic', value: 'MECHANIC' },
  { label: 'Consultation', value: 'CONSULTATION' },
]

function statusBadge(status: BusinessProfile['verification']) {
  switch (status) {
    case 'APPROVED':
      return <Badge className="bg-emerald-500/20 text-emerald-200">Approved</Badge>
    case 'REJECTED':
      return <Badge className="bg-red-500/20 text-red-200">Rejected</Badge>
    case 'SUBMITTED':
      return <Badge className="bg-amber-500/20 text-amber-200">Submitted</Badge>
    default:
      return <Badge className="bg-muted text-muted-foreground">Pending</Badge>
  }
}

const toNull = (value: string) => (value.trim() === '' ? null : value.trim())

const parseCoordinate = (value: string) => {
  if (!value.trim()) return null
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

export default function BusinessDetailPage() {
  const params = useParams()
  const router = useRouter()
  const businessId = params?.id as string
  const { error: errorToast, loading: loadingToast, dismiss: dismissToast } = useToast()
  const { data: business, isLoading: loading } = useGetBusinessQuery(businessId, {
    skip: !businessId,
  })
  const [updateBusiness, { isLoading: isSaving }] = useUpdateBusinessMutation()
  const [submitBusiness] = useSubmitBusinessMutation()
  const [uploadBusinessImage] = useUploadBusinessImageMutation()
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [uploadingBanner, setUploadingBanner] = useState(false)
  const logoInputRef = useRef<HTMLInputElement>(null)
  const bannerInputRef = useRef<HTMLInputElement>(null)
  const [form, setForm] = useState({
    category: '' as BusinessCategory | '',
    displayName: '',
    tagline: '',
    description: '',
    logoUrl: '',
    bannerUrl: '',
    phone: '',
    email: '',
    websiteUrl: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    region: '',
    country: '',
    latitude: '',
    longitude: '',
  })

  useEffect(() => {
    if (!business) return
    setForm({
      category: business.categories[0] ?? '',
      displayName: business.displayName,
      tagline: business.tagline ?? '',
      description: business.description ?? '',
      logoUrl: business.logoUrl ?? '',
      bannerUrl: business.bannerUrl ?? '',
      phone: business.phone ?? '',
      email: business.email ?? '',
      websiteUrl: business.websiteUrl ?? '',
      addressLine1: business.addressLine1 ?? '',
      addressLine2: business.addressLine2 ?? '',
      city: business.city ?? '',
      region: business.region ?? '',
      country: business.country ?? '',
      latitude: business.latitude?.toString() ?? '',
      longitude: business.longitude?.toString() ?? '',
    })
  }, [business])

  const canSubmit = useMemo(() => {
    return Boolean(form.displayName.trim() && form.category)
  }, [form.displayName, form.category])

  const fileToBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(file)
    })

  const handleImageUpload = async (file: File, type: 'logo' | 'banner') => {
    if (!businessId) return
    const setter = type === 'logo' ? setUploadingLogo : setUploadingBanner
    setter(true)
    try {
      const base64 = await fileToBase64(file)
      const result = await uploadBusinessImage({
        businessId,
        file: base64,
        type,
      }).unwrap()
      const url = result.media?.secureUrl ?? result.media?.url ?? result.imageUrl
      if (url) {
        setForm((prev) => ({
          ...prev,
          [type === 'logo' ? 'logoUrl' : 'bannerUrl']: url,
        }))
      }
    } catch (err) {
      errorToast(`Failed to upload ${type}`, {
        description: err instanceof Error ? err.message : 'Please try again.',
      })
    } finally {
      setter(false)
    }
  }

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!businessId || !canSubmit) return

    const toastId = loadingToast('Saving business...', {
      description: 'Updating your brand profile.',
    })

    const payload: UpdateBusinessInput = {
      categories: form.category ? [form.category as BusinessCategory] : undefined,
      displayName: form.displayName.trim() || undefined,
      tagline: toNull(form.tagline),
      description: toNull(form.description),
      logoUrl: toNull(form.logoUrl),
      bannerUrl: toNull(form.bannerUrl),
      phone: toNull(form.phone),
      email: toNull(form.email),
      websiteUrl: toNull(form.websiteUrl),
      addressLine1: toNull(form.addressLine1),
      addressLine2: toNull(form.addressLine2),
      city: toNull(form.city),
      region: toNull(form.region),
      country: toNull(form.country),
      latitude: parseCoordinate(form.latitude),
      longitude: parseCoordinate(form.longitude),
    }

    try {
      await updateBusiness({ id: businessId, data: payload }).unwrap()
    } catch (err) {
      errorToast('Could not save business', {
        description: err instanceof Error ? err.message : 'Please try again.',
      })
    } finally {
      dismissToast(toastId)
    }
  }

  const handleSubmitForReview = async () => {
    if (!businessId) return
    const toastId = loadingToast('Submitting for review...', {
      description: 'Our team will take a look shortly.',
    })
    try {
      await submitBusiness(businessId).unwrap()
    } catch (err) {
      errorToast('Could not submit', {
        description: err instanceof Error ? err.message : 'Please try again.',
      })
    } finally {
      dismissToast(toastId)
    }
  }

  if (loading) {
    return <div className="flex justify-center py-20">Loading…</div>
  }

  if (!business) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-10 text-center text-muted-foreground">
        Business not found.
      </div>
    )
  }

  const isApproved = business.verification === 'APPROVED'

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <Link
        href="/business"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground mb-4"
      >
        <ChevronLeft className="w-4 h-4" />
        Back to portal
      </Link>

      <Card className="mb-6">
        <CardHeader>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>{business.displayName}</CardTitle>
              <CardDescription>Keep your public brand page up to date.</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {statusBadge(business.verification)}
              <Button asChild variant="outline" size="sm">
                <Link href={`/b/${business.id}`}>
                  <ExternalLink className="w-4 h-4" />
                </Link>
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          {business.verificationNotes
            ? business.verificationNotes
            : 'Review updates typically take 1-2 business days.'}
        </CardContent>
      </Card>

      <form onSubmit={handleSave} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Basics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Category</Label>
              <Select
                value={form.category}
                onValueChange={(value) =>
                  setForm((prev) => ({ ...prev, category: value as BusinessCategory }))
                }
                disabled={isApproved}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {isApproved ? (
                <p className="text-xs text-muted-foreground">
                  Approved businesses cannot change their category.
                </p>
              ) : null}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Business name</Label>
                <Input
                  value={form.displayName}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, displayName: event.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Tagline</Label>
                <Input
                  value={form.tagline}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, tagline: event.target.value }))
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={form.description}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, description: event.target.value }))
                }
                rows={4}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Media</CardTitle>
            <CardDescription>Upload files directly or paste a CDN URL.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6 md:grid-cols-2">
            {/* Logo */}
            <div className="space-y-3">
              <Label>Logo</Label>
              {form.logoUrl && (
                <div className="relative w-20 h-20 rounded-xl overflow-hidden border border-border">
                  <img
                    src={form.logoUrl}
                    alt="Logo preview"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => setForm((prev) => ({ ...prev, logoUrl: '' }))}
                    className="absolute top-1 right-1 w-5 h-5 rounded-full bg-background/80 flex items-center justify-center"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
              <div className="flex gap-2">
                <Input
                  placeholder="Paste logo URL…"
                  value={form.logoUrl}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, logoUrl: e.target.value }))
                  }
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  disabled={uploadingLogo}
                  onClick={() => logoInputRef.current?.click()}
                >
                  {uploadingLogo ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Upload className="w-4 h-4" />
                  )}
                </Button>
              </div>
              <input
                ref={logoInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) handleImageUpload(file, 'logo')
                  e.target.value = ''
                }}
              />
            </div>

            {/* Banner */}
            <div className="space-y-3">
              <Label>Banner</Label>
              {form.bannerUrl && (
                <div className="relative w-full h-20 rounded-xl overflow-hidden border border-border">
                  <img
                    src={form.bannerUrl}
                    alt="Banner preview"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => setForm((prev) => ({ ...prev, bannerUrl: '' }))}
                    className="absolute top-1 right-1 w-5 h-5 rounded-full bg-background/80 flex items-center justify-center"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
              <div className="flex gap-2">
                <Input
                  placeholder="Paste banner URL…"
                  value={form.bannerUrl}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, bannerUrl: e.target.value }))
                  }
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  disabled={uploadingBanner}
                  onClick={() => bannerInputRef.current?.click()}
                >
                  {uploadingBanner ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Upload className="w-4 h-4" />
                  )}
                </Button>
              </div>
              <input
                ref={bannerInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) handleImageUpload(file, 'banner')
                  e.target.value = ''
                }}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Contact</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input
                value={form.phone}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, phone: event.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                value={form.email}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, email: event.target.value }))
                }
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Website</Label>
              <Input
                value={form.websiteUrl}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, websiteUrl: event.target.value }))
                }
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Location</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Address line 1</Label>
                <Input
                  value={form.addressLine1}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, addressLine1: event.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Address line 2</Label>
                <Input
                  value={form.addressLine2}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, addressLine2: event.target.value }))
                  }
                />
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label>City</Label>
                <Input
                  value={form.city}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, city: event.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Region</Label>
                <Input
                  value={form.region}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, region: event.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Country</Label>
                <Input
                  value={form.country}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, country: event.target.value }))
                  }
                />
              </div>
            </div>
            <Separator />
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Latitude</Label>
                <Input
                  value={form.latitude}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, latitude: event.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Longitude</Label>
                <Input
                  value={form.longitude}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, longitude: event.target.value }))
                  }
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-wrap items-center gap-3">
          <Button type="submit" disabled={isSaving || !canSubmit}>
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save changes'}
          </Button>
          {!isApproved && (
            <Button type="button" variant="outline" onClick={handleSubmitForReview}>
              Submit for review
            </Button>
          )}
          <Button
            type="button"
            variant="ghost"
            onClick={() => router.push('/marketplace/create')}
          >
            Create listing
          </Button>
        </div>
      </form>
    </div>
  )
}
