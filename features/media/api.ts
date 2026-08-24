import { mediaApi } from '@/core/store/api/services'
import type { MediaType, MediaUploadResponse } from '@/entities/media/model'

import { MEDIA_ENDPOINTS } from './endpoints'

/**
 * Every upload takes a base64 data URL, not a `File` — the backend's `/media/upload/*`
 * routes decode it server-side before handing it to Cloudinary. Callers convert with
 * `fileToDataUrl` (lib/media-utils) before calling these.
 */
export const mediaApiSlice = mediaApi.injectEndpoints({
  endpoints: (build) => ({
    uploadProfileImage: build.mutation<MediaUploadResponse, string>({
      query: (file) => ({ url: MEDIA_ENDPOINTS.profile, method: 'POST', body: { file } }),
    }),

    uploadProfileCover: build.mutation<MediaUploadResponse, string>({
      query: (file) => ({
        url: MEDIA_ENDPOINTS.profileCover,
        method: 'POST',
        body: { file },
      }),
    }),

    uploadProfileGallery: build.mutation<MediaUploadResponse, string>({
      query: (file) => ({
        url: MEDIA_ENDPOINTS.profileGallery,
        method: 'POST',
        body: { file },
      }),
    }),

    uploadClubImage: build.mutation<
      MediaUploadResponse,
      { clubId: string; file: string; type?: 'logo' | 'cover' }
    >({
      query: ({ clubId, file, type = 'logo' }) => ({
        url: MEDIA_ENDPOINTS.club(clubId),
        method: 'POST',
        body: { file, type },
      }),
    }),

    uploadClubGallery: build.mutation<MediaUploadResponse, { clubId: string; file: string }>({
      query: ({ clubId, file }) => ({
        url: MEDIA_ENDPOINTS.clubGallery(clubId),
        method: 'POST',
        body: { file },
      }),
    }),

    uploadBikeImage: build.mutation<MediaUploadResponse, { bikeId: string; file: string }>({
      query: ({ bikeId, file }) => ({
        url: MEDIA_ENDPOINTS.bike(bikeId),
        method: 'POST',
        body: { file },
      }),
    }),

    uploadRideMedia: build.mutation<
      MediaUploadResponse,
      { rideId: string; file: string; type?: MediaType }
    >({
      query: ({ rideId, file, type = 'image' }) => ({
        url: MEDIA_ENDPOINTS.upload,
        method: 'POST',
        body: { folder: 'rides', file, type, resourceId: rideId },
      }),
    }),

    uploadListingImage: build.mutation<
      MediaUploadResponse,
      { listingId: string; file: string }
    >({
      query: ({ listingId, file }) => ({
        url: MEDIA_ENDPOINTS.listing(listingId),
        method: 'POST',
        body: { file },
      }),
    }),

    uploadBusinessImage: build.mutation<
      MediaUploadResponse,
      { businessId: string; file: string; type?: 'logo' | 'banner' }
    >({
      query: ({ businessId, file, type = 'logo' }) => ({
        url: MEDIA_ENDPOINTS.upload,
        method: 'POST',
        body: { folder: 'businesses', file, type, resourceId: businessId },
      }),
    }),

    deleteMedia: build.mutation<void, { publicId: string; resourceType?: MediaType }>({
      query: ({ publicId, resourceType = 'image' }) => ({
        url: MEDIA_ENDPOINTS.delete(publicId),
        method: 'DELETE',
        params: { resourceType },
      }),
    }),
  }),
})

export const {
  useUploadProfileImageMutation,
  useUploadProfileCoverMutation,
  useUploadProfileGalleryMutation,
  useUploadClubImageMutation,
  useUploadClubGalleryMutation,
  useUploadBikeImageMutation,
  useUploadRideMediaMutation,
  useUploadListingImageMutation,
  useUploadBusinessImageMutation,
  useDeleteMediaMutation,
} = mediaApiSlice
