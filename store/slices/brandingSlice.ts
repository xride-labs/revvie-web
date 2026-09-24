import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { BrandingConfig } from '@/entities/admin/model'
import { platformApiSlice } from '@/features/platform/api'
import { adminApiSlice } from '@/features/admin/api'

export const DEFAULT_BRANDING: BrandingConfig = {
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

export interface BrandingState {
  current: BrandingConfig
  isLoading: boolean
  error: string | null
}

const initialState: BrandingState = {
  current: DEFAULT_BRANDING,
  isLoading: false,
  error: null,
}

export const brandingSlice = createSlice({
  name: 'branding',
  initialState,
  reducers: {
    setBrandingTokens: (state, action: PayloadAction<BrandingConfig>) => {
      state.current = action.payload
    },
    resetBrandingTokens: (state) => {
      state.current = DEFAULT_BRANDING
    },
  },
  extraReducers: (builder) => {
    builder
      .addMatcher(
        platformApiSlice.endpoints.getPublicBranding.matchFulfilled,
        (state, { payload }) => {
          if (payload) {
            state.current = { ...state.current, ...payload }
            state.isLoading = false
          }
        },
      )
      .addMatcher(
        adminApiSlice.endpoints.getBranding.matchFulfilled,
        (state, { payload }) => {
          if (payload) {
            state.current = { ...state.current, ...payload }
            state.isLoading = false
          }
        },
      )
      .addMatcher(
        adminApiSlice.endpoints.updateBranding.matchFulfilled,
        (state, { payload }) => {
          if (payload) {
            state.current = { ...state.current, ...payload }
            state.isLoading = false
          }
        },
      )
  },
})

export const { setBrandingTokens, resetBrandingTokens } = brandingSlice.actions

export const selectBranding = (state: { branding: BrandingState }) => state.branding.current
export const selectBrandColors = (state: { branding: BrandingState }) => ({
  primary: state.branding.current.primaryColor,
  deep: state.branding.current.deepColor,
  canvas: state.branding.current.canvasColor,
  surface: state.branding.current.surfaceColor,
  border: state.branding.current.borderColor,
})
export const selectBrandLogo = (state: { branding: BrandingState }) =>
  state.branding.current.logoUrl
export const selectBrandSiteName = (state: { branding: BrandingState }) =>
  state.branding.current.siteName

export default brandingSlice.reducer
