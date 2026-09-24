import { platformApi } from '@/core/store/api/services'
import type { BrandingConfig } from '@/entities/admin/model'

export const platformApiSlice = platformApi.injectEndpoints({
  endpoints: (build) => ({
    getPublicBranding: build.query<BrandingConfig, void>({
      query: () => ({ url: '/public/branding' }),
      providesTags: ['PlatformBranding'],
    }),
  }),
})

export const { useGetPublicBrandingQuery } = platformApiSlice
