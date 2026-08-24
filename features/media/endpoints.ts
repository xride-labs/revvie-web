export const MEDIA_ENDPOINTS = {
  upload: '/media/upload',
  profile: '/media/upload/profile',
  profileCover: '/media/upload/profile/cover',
  profileGallery: '/media/upload/profile/gallery',
  club: (clubId: string) => `/media/upload/club/${clubId}`,
  clubGallery: (clubId: string) => `/media/upload/club/${clubId}/gallery`,
  bike: (bikeId: string) => `/media/upload/bike/${bikeId}`,
  listing: (listingId: string) => `/media/upload/listing/${listingId}`,
  delete: (publicId: string) => `/media/${publicId}`,
} as const
