'use client'

import { useState, useMemo } from 'react'
import { AdminLayout } from '@/components/admin/admin-layout'
import { BrandForm } from './_components/brand-form'
import { BrandPreview } from './_components/brand-preview'
import { useGetBrandingQuery, useUpdateBrandingMutation } from '@/features/admin/api'
import type { BrandingConfig } from '@/entities/admin/model'
import { toast } from 'sonner'

const DEFAULT_BRANDING: BrandingConfig = {
  siteName: 'Revvie',
  siteUrl: 'https://revvie.xride-labs.in',
  supportEmail: 'hello@xride-labs.in',
  tagline: 'RIDE • TRACK • CONNECT',
  logoUrl: 'https://res.cloudinary.com/xride-labs/image/upload/revvie/icon_f6occl.png',
  iconUrl: 'https://res.cloudinary.com/xride-labs/image/upload/revvie/icon_f6occl.png',
  faviconUrl: null,
  primaryColor: '#ff1d2d',
  deepColor: '#b3151f',
  canvasColor: '#0d0d0f',
  surfaceColor: '#1c1c1e',
  borderColor: '#3a3a3c',
  fontFamily: 'Josefin Sans',
  emailHeaderBadge: 'OFFICIAL DISPATCH',
}

export default function AdminBrandingPage() {
  const { data: fetchedBranding, isLoading } = useGetBrandingQuery()
  const [updateBranding, { isLoading: isSaving }] = useUpdateBrandingMutation()

  const [draftBranding, setDraftBranding] = useState<BrandingConfig | null>(null)

  const branding = draftBranding ?? fetchedBranding ?? DEFAULT_BRANDING
  const baseBranding = fetchedBranding ?? DEFAULT_BRANDING

  const isDirty = useMemo(() => {
    if (!draftBranding) return false
    return JSON.stringify(draftBranding) !== JSON.stringify(baseBranding)
  }, [draftBranding, baseBranding])

  const handleSave = async () => {
    try {
      await updateBranding(branding).unwrap()
      setDraftBranding(null)
      toast.success('Brand tokens updated successfully! Cached emails & UI refreshed.')
    } catch (err: unknown) {
      console.error('Failed to update branding:', err)
      const errorMsg =
        typeof err === 'object' && err !== null && 'data' in err
          ? (err as { data?: { message?: string } }).data?.message
          : 'Failed to save branding tokens'
      toast.error(errorMsg || 'Failed to save branding tokens')
    }
  }

  const handleReset = () => {
    setDraftBranding(DEFAULT_BRANDING)
    toast.info('Reset to canonical "One Red Light in a Black Garage" defaults')
  }

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-[#ff1d2d] border-t-transparent animate-spin" />
          <p className="text-xs text-neutral-400 font-mono tracking-wider uppercase">Loading Brand Studio...</p>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="flex flex-col gap-6 p-4 md:p-8 max-w-[1700px] mx-auto">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Brand Studio
          </h1>
          <p className="text-sm text-neutral-400 mt-1">
            Customize platform identities, colors, typography, logos, and real-time email dispatch badges.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Form & Dropzones */}
          <div className="lg:col-span-6 xl:col-span-5">
            <BrandForm
              branding={branding}
              onChange={setDraftBranding}
              onSave={handleSave}
              onReset={handleReset}
              isSaving={isSaving}
              isDirty={isDirty}
            />
          </div>

          {/* Right Column: Live Dual Simulation Studio */}
          <div className="lg:col-span-6 xl:col-span-7 lg:sticky lg:top-8 h-[850px]">
            <BrandPreview branding={branding} />
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
