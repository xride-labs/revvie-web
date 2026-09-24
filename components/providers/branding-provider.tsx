'use client'

import React, { useEffect } from 'react'
import { useAppSelector } from '@/core/store/hooks'
import { useGetPublicBrandingQuery } from '@/features/platform/api'
import {
  selectBranding,
  selectBrandColors,
} from '@/store/slices/brandingSlice'
import type { BrandingConfig } from '@/entities/admin/model'

function applyBrandTheme(b: BrandingConfig) {
  if (typeof document === 'undefined') return
  const root = document.documentElement

  if (b.primaryColor) {
    root.style.setProperty('--primary', b.primaryColor)
    root.style.setProperty('--ring', b.primaryColor)
    root.style.setProperty('--color-brand-red-light', b.primaryColor)
  }
  if (b.deepColor) {
    root.style.setProperty('--destructive', b.deepColor)
    root.style.setProperty('--color-brand-red', b.deepColor)
  }
  if (b.canvasColor) {
    root.style.setProperty('--background', b.canvasColor)
    root.style.setProperty('--color-canvas', b.canvasColor)
  }
  if (b.surfaceColor) {
    root.style.setProperty('--card', b.surfaceColor)
    root.style.setProperty('--popover', b.surfaceColor)
    root.style.setProperty('--secondary', b.surfaceColor)
    root.style.setProperty('--color-surface', b.surfaceColor)
  }
  if (b.borderColor) {
    root.style.setProperty('--border', b.borderColor)
    root.style.setProperty('--color-brand-grey', b.borderColor)
  }
  if (b.fontFamily) {
    root.style.setProperty('--font-sans', `"${b.fontFamily}", sans-serif`)
  }
}

/**
 * Pure Redux-powered theme synchronizer.
 * Queries RTK Query `useGetPublicBrandingQuery()` on mount and syncs Redux brand tokens to CSS variables.
 */
export function BrandingProvider({ children }: { children: React.ReactNode }) {
  // Triggers RTK Query cache fetch; fulfilled action automatically updates brandingSlice in Redux!
  useGetPublicBrandingQuery()
  const branding = useAppSelector(selectBranding)

  useEffect(() => {
    applyBrandTheme(branding)
  }, [branding])

  return <>{children}</>
}

/**
 * Hook to access active branding from Redux store.
 */
export function useBranding() {
  const branding = useAppSelector(selectBranding)
  const colors = useAppSelector(selectBrandColors)

  return {
    branding,
    logoUrl: branding.logoUrl,
    iconUrl: branding.iconUrl,
    faviconUrl: branding.faviconUrl,
    siteName: branding.siteName,
    tagline: branding.tagline,
    supportEmail: branding.supportEmail,
    fontFamily: branding.fontFamily,
    emailHeaderBadge: branding.emailHeaderBadge,
    colors,
  }
}
