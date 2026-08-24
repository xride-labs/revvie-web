import { z } from 'zod'

/**
 * Verified against `backend/src/lib/cloudinary.ts` (`UploadResult`) — this domain's old
 * `lib/server/media` types already matched, similar to business/admin.
 */
export const mediaUploadResultSchema = z.object({
  publicId: z.string(),
  url: z.string(),
  secureUrl: z.string(),
  format: z.string(),
  width: z.number().optional(),
  height: z.number().optional(),
  bytes: z.number(),
  duration: z.number().optional(),
  resourceType: z.string(),
  createdAt: z.string(),
  thumbnailUrl: z.string().optional(),
})

export const mediaUploadResponseSchema = z.object({
  media: mediaUploadResultSchema,
  imageUrl: z.string().optional(),
  listing: z
    .object({
      id: z.string(),
      images: z.array(z.string()),
    })
    .optional(),
})

export type MediaUploadResult = z.infer<typeof mediaUploadResultSchema>
export type MediaUploadResponse = z.infer<typeof mediaUploadResponseSchema>
export type MediaType = 'image' | 'video'
