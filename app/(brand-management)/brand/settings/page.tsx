'use client'

import { useEffect, useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Upload,
  CheckCircle2,
  Clock,
  AlertCircle,
  Loader2,
  MapPin,
  Navigation,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import {
  useUpdateBusinessMutation,
  useSubmitBusinessMutation,
} from '@/features/business/api'
import type { BusinessCategory } from '@/entities/business/model'
import { mapApiError } from '@/lib/errors'
import { useBusinessContext } from '@/contexts/business-context'

const BRAND_CATEGORIES: { value: BusinessCategory; label: string }[] = [
  { value: 'BRAND', label: 'Brand / Manufacturer' },
  { value: 'GEAR_SELLER', label: 'Gear & Apparel' },
  { value: 'HELMET_SELLER', label: 'Helmet Seller' },
  { value: 'PARTS_SELLER', label: 'Parts & Accessories' },
  { value: 'MARKETPLACE_SELLER', label: 'Marketplace Seller' },
  { value: 'SERVICE_STORE', label: 'Service & Repair' },
  { value: 'MECHANIC', label: 'Independent Mechanic' },
  { value: 'CONSULTATION', label: 'Consultation' },
]

type VerificationStatus = 'PENDING' | 'SUBMITTED' | 'APPROVED' | 'REJECTED'

const VERIFICATION_CONFIG: Record<
  VerificationStatus,
  { label: string; color: string; icon: React.ElementType }
> = {
  PENDING: { label: 'Not submitted', color: 'text-muted-foreground', icon: Clock },
  SUBMITTED: { label: 'Under review', color: 'text-amber-500', icon: Clock },
  APPROVED: { label: 'Verified', color: 'text-green-500', icon: CheckCircle2 },
  REJECTED: { label: 'Rejected', color: 'text-destructive', icon: AlertCircle },
}

export default function BrandSettingsPage() {
  const { success: successToast, error: errorToast } = useToast()
  const { business, reload } = useBusinessContext()
  const [updateBusiness, { isLoading: isSaving }] = useUpdateBusinessMutation()
  const [submitBusiness, { isLoading: isSubmitting }] = useSubmitBusinessMutation()
  const [locating, setLocating] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [profile, setProfile] = useState({
    displayName: '',
    tagline: '',
    categories: [] as BusinessCategory[],
    email: '',
    phone: '',
    websiteUrl: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    region: '',
    country: 'India',
    description: '',
    latitude: '' as string,
    longitude: '' as string,
  })

  useEffect(() => {
    if (!business) return
    setProfile({
      displayName: business.displayName ?? '',
      tagline: business.tagline ?? '',
      categories: business.categories ?? [],
      email: business.email ?? '',
      phone: business.phone ?? '',
      websiteUrl: business.websiteUrl ?? '',
      addressLine1: business.addressLine1 ?? '',
      addressLine2: business.addressLine2 ?? '',
      city: business.city ?? '',
      region: business.region ?? '',
      country: business.country ?? 'India',
      description: business.description ?? '',
      latitude: business.latitude != null ? String(business.latitude) : '',
      longitude: business.longitude != null ? String(business.longitude) : '',
    })
  }, [business?.id])

  const toggleCategory = (cat: BusinessCategory) => {
    setProfile((p) => ({
      ...p,
      categories: p.categories.includes(cat)
        ? p.categories.filter((c) => c !== cat)
        : [...p.categories, cat],
    }))
  }

  const detectLocation = useCallback(() => {
    if (!navigator.geolocation) {
      errorToast('Geolocation is not supported by your browser')
      return
    }
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude
        const lng = pos.coords.longitude
        setProfile((p) => ({ ...p, latitude: String(lat), longitude: String(lng) }))
        // Reverse geocode via Nominatim (free, no key needed)
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
            { headers: { 'Accept-Language': 'en' } },
          )
          if (res.ok) {
            const data = await res.json()
            const addr = data.address ?? {}
            setProfile((p) => ({
              ...p,
              city: addr.city || addr.town || addr.village || addr.county || p.city,
              region: addr.state || p.region,
              country: addr.country || p.country,
              addressLine1: addr.road
                ? `${addr.house_number ? addr.house_number + ' ' : ''}${addr.road}`
                : p.addressLine1,
            }))
          }
        } catch {
          // Reverse geocode failed — coordinates still set
        }
        setLocating(false)
        successToast('Location detected', {
          description: 'Review the address fields and save.',
        })
      },
      () => {
        setLocating(false)
        errorToast('Could not detect location. Please enter it manually.')
      },
      { timeout: 10000 },
    )
  }, [errorToast, successToast])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!business) return
    setFieldErrors({})
    try {
      await updateBusiness({
        id: business.id,
        data: {
          displayName: profile.displayName || undefined,
          tagline: profile.tagline || null,
          categories: profile.categories.length > 0 ? profile.categories : undefined,
          email: profile.email || null,
          phone: profile.phone || null,
          websiteUrl: profile.websiteUrl || null,
          addressLine1: profile.addressLine1 || null,
          addressLine2: profile.addressLine2 || null,
          city: profile.city || null,
          region: profile.region || null,
          country: profile.country || null,
          latitude: profile.latitude ? parseFloat(profile.latitude) : null,
          longitude: profile.longitude ? parseFloat(profile.longitude) : null,
          description: profile.description || null,
        },
      }).unwrap()
      await reload()
      successToast('Brand profile saved')
    } catch (err) {
      const mapped = mapApiError(err)
      if (mapped.fieldErrors) setFieldErrors(mapped.fieldErrors)
      errorToast(mapped.message)
    }
  }

  const handleSubmitVerification = async () => {
    if (!business) return
    try {
      await submitBusiness(business.id).unwrap()
      await reload()
      successToast('Submitted for verification!', {
        description: 'Admin will review your profile within 2-3 business days.',
      })
    } catch (err) {
      errorToast(err instanceof Error ? err.message : 'Submission failed')
    }
  }

  if (!business) {
    return (
      <div className="flex items-center justify-center min-h-100">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
      </div>
    )
  }

  const verificationStatus = (business.verification ?? 'PENDING') as VerificationStatus
  const vCfg = VERIFICATION_CONFIG[verificationStatus]
  const VIcon = vCfg.icon
  const canSubmit = verificationStatus === 'PENDING' || verificationStatus === 'REJECTED'

  const hasCoords = profile.latitude && profile.longitude
  const mapEmbedUrl = hasCoords
    ? `https://www.openstreetmap.org/export/embed.html?bbox=${parseFloat(profile.longitude) - 0.005},${parseFloat(profile.latitude) - 0.005},${parseFloat(profile.longitude) + 0.005},${parseFloat(profile.latitude) + 0.005}&layer=mapnik&marker=${profile.latitude},${profile.longitude}`
    : null

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      {/* Verification status */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <VIcon className={`w-5 h-5 ${vCfg.color}`} />
              <div>
                <p className="font-medium text-sm">Verification Status</p>
                <p className={`text-xs ${vCfg.color}`}>{vCfg.label}</p>
              </div>
            </div>
            {verificationStatus === 'PENDING' && (
              <Badge variant="outline" className="text-amber-500 border-amber-500/30">
                Action needed
              </Badge>
            )}
            {verificationStatus === 'REJECTED' && business.verificationNotes && (
              <p className="text-xs text-destructive max-w-xs text-right">
                {business.verificationNotes}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Brand Profile */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Brand Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 space-y-1.5">
                <Label>Brand Name</Label>
                <Input
                  placeholder="Your brand name"
                  value={profile.displayName}
                  onChange={(e) =>
                    setProfile({ ...profile, displayName: e.target.value })
                  }
                  aria-invalid={!!fieldErrors.displayName}
                />
                {fieldErrors.displayName && (
                  <p className="text-xs text-destructive">{fieldErrors.displayName}</p>
                )}
              </div>

              <div className="col-span-2 space-y-1.5">
                <Label>
                  Categories{' '}
                  <span className="text-muted-foreground text-xs">
                    (select all that apply)
                  </span>
                </Label>
                <div className="flex flex-wrap gap-2">
                  {BRAND_CATEGORIES.map((c) => (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => toggleCategory(c.value)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                        profile.categories.includes(c.value)
                          ? 'border-amber-500 bg-amber-500/10 text-amber-500'
                          : 'border-border text-muted-foreground hover:border-amber-500/50'
                      }`}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="col-span-2 space-y-1.5">
                <Label>Tagline</Label>
                <Input
                  placeholder="e.g. Gear built for the road"
                  value={profile.tagline}
                  onChange={(e) => setProfile({ ...profile, tagline: e.target.value })}
                />
              </div>
              <div className="col-span-2 space-y-1.5">
                <Label>Description</Label>
                <Textarea
                  rows={3}
                  placeholder="Tell riders about your brand..."
                  value={profile.description}
                  onChange={(e) =>
                    setProfile({ ...profile, description: e.target.value })
                  }
                />
              </div>
            </div>

            <Separator />

            {/* Contact */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Email</Label>
                <Input
                  type="email"
                  placeholder="contact@brand.com"
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  aria-invalid={!!fieldErrors.email}
                />
                {fieldErrors.email && (
                  <p className="text-xs text-destructive">{fieldErrors.email}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label>Phone</Label>
                <Input
                  placeholder="+91 98765 43210"
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  aria-invalid={!!fieldErrors.phone}
                />
                {fieldErrors.phone && (
                  <p className="text-xs text-destructive">{fieldErrors.phone}</p>
                )}
              </div>
              <div className="col-span-2 space-y-1.5">
                <Label>Website</Label>
                <Input
                  placeholder="https://yourbrand.com"
                  value={profile.websiteUrl}
                  onChange={(e) => setProfile({ ...profile, websiteUrl: e.target.value })}
                  aria-invalid={!!fieldErrors.websiteUrl}
                />
                {fieldErrors.websiteUrl && (
                  <p className="text-xs text-destructive">{fieldErrors.websiteUrl}</p>
                )}
              </div>
            </div>

            <Separator />

            {/* Location */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-amber-500" />
                  Location
                </Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="gap-1.5 h-7 text-xs"
                  onClick={detectLocation}
                  disabled={locating}
                >
                  {locating ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <Navigation className="w-3 h-3" />
                  )}
                  {locating ? 'Detecting…' : 'Use My Location'}
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Address Line 1</Label>
                  <Input
                    placeholder="Street address, shop number"
                    value={profile.addressLine1}
                    onChange={(e) =>
                      setProfile({ ...profile, addressLine1: e.target.value })
                    }
                  />
                </div>
                <div className="col-span-2 space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Address Line 2</Label>
                  <Input
                    placeholder="Building, area, landmark"
                    value={profile.addressLine2}
                    onChange={(e) =>
                      setProfile({ ...profile, addressLine2: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">City</Label>
                  <Input
                    placeholder="Mumbai"
                    value={profile.city}
                    onChange={(e) => setProfile({ ...profile, city: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">State / Region</Label>
                  <Input
                    placeholder="Maharashtra"
                    value={profile.region}
                    onChange={(e) => setProfile({ ...profile, region: e.target.value })}
                  />
                </div>
                <div className="col-span-2 space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Country</Label>
                  <Input
                    placeholder="India"
                    value={profile.country}
                    onChange={(e) => setProfile({ ...profile, country: e.target.value })}
                  />
                </div>
              </div>

              {/* Map preview */}
              {mapEmbedUrl && (
                <div
                  className="rounded-xl overflow-hidden border border-border"
                  style={{ height: 200 }}
                >
                  <iframe
                    src={mapEmbedUrl}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    title="Brand location"
                    loading="lazy"
                  />
                </div>
              )}

              {/* Coordinates (auto-filled, editable) */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Latitude</Label>
                  <Input
                    placeholder="19.0760"
                    value={profile.latitude}
                    onChange={(e) => setProfile({ ...profile, latitude: e.target.value })}
                    className="font-mono text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Longitude</Label>
                  <Input
                    placeholder="72.8777"
                    value={profile.longitude}
                    onChange={(e) =>
                      setProfile({ ...profile, longitude: e.target.value })
                    }
                    className="font-mono text-xs"
                  />
                </div>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-amber-500 hover:bg-amber-600 text-white"
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                'Save Profile'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Verification Documents */}
      <Card id="verification">
        <CardHeader>
          <CardTitle className="text-base">Verification Documents</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Upload your business registration, GST certificate, or brand authorization
            letter to get verified and go live on the marketplace.
          </p>
          <div className="border-2 border-dashed rounded-xl p-8 text-center">
            <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground/50" />
            <p className="text-sm font-medium mb-1">Upload documents</p>
            <p className="text-xs text-muted-foreground">PDF, JPG, PNG up to 10MB each</p>
            <Button variant="outline" size="sm" className="mt-4">
              Choose Files
            </Button>
          </div>
          <Button
            className="w-full bg-amber-500 hover:bg-amber-600 text-white"
            disabled={!canSubmit || isSubmitting}
            onClick={handleSubmitVerification}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Submitting...
              </>
            ) : (
              'Submit for Verification'
            )}
          </Button>
          {!canSubmit && (
            <p className="text-xs text-center text-muted-foreground">
              {verificationStatus === 'SUBMITTED'
                ? 'Already submitted — awaiting admin review'
                : 'Already verified'}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
