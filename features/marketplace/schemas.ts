import { z } from 'zod'

import { paginationSchema } from '@/entities/shared/model'
import { listingDetailsSchema, listingSchema } from '@/entities/listing/model'

export const listingsResponseSchema = z.object({
  items: z.array(listingSchema),
  pagination: paginationSchema,
})

export const listingDetailResponseSchema = z.object({
  listing: listingDetailsSchema,
})

/** `GET /marketplace/my-listings` — a raw `findMany` with no `include`, so unlike the
 *  general list route it does NOT attach `seller` (it would always be the caller
 *  themselves anyway). Verified against `marketplace.routes.ts` directly. */
export const myListingsResponseSchema = z.object({
  items: z.array(listingSchema.omit({ seller: true })),
  pagination: paginationSchema,
})

export const listParamsSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
  category: z.string().optional(),
  condition: z.string().optional(),
  minPrice: z.number().positive().optional(),
  maxPrice: z.number().positive().optional(),
  status: z.enum(['ACTIVE', 'SOLD', 'INACTIVE']).optional(),
  search: z.string().optional(),
  featured: z.boolean().optional(),
})

/** `POST /marketplace` / `PATCH /marketplace/:id` — verified against the backend's
 *  `createListingSchema` in `src/validators/schemas.ts`. `category`/`condition` are a
 *  strict enum here even though the persisted/response field is a free string (Prisma
 *  `String?`, see `entities/listing/model.ts`) — the old create-listing page's dropdown
 *  offered values ("Bikes", "Excellent", "For Parts") that don't match this enum at all
 *  and would 400 on submit; fixed alongside this schema. No `location` field — it's
 *  `locationLabel`. */
export const listingCategorySchema = z.enum([
  'Motorcycle',
  'Gear',
  'Accessories',
  'Parts',
  'Other',
])
export const listingConditionSchema = z.enum(['New', 'Like New', 'Good', 'Fair', 'Poor'])

export const createListingInputSchema = z.object({
  title: z.string().trim().min(3).max(200),
  description: z.string().trim().max(5000).optional(),
  price: z.number().positive(),
  currency: z.string().length(3).default('INR'),
  images: z.array(z.string()).max(10).optional(),
  videos: z.array(z.string()).max(3).optional(),
  category: listingCategorySchema.optional(),
  subcategory: z.string().trim().max(100).optional(),
  specifications: z.string().trim().max(2000).optional(),
  condition: listingConditionSchema.optional(),
  locationLabel: z.string().trim().max(200).optional(),
  allowBids: z.boolean().optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  clubId: z.string().optional().nullable(),
  visibility: z.enum(['PUBLIC', 'CLUB_ONLY']).optional().default('PUBLIC'),
})

export const updateListingInputSchema = createListingInputSchema.partial().extend({
  status: z.enum(['ACTIVE', 'SOLD', 'INACTIVE']).optional(),
})

export type ListingsResponse = z.infer<typeof listingsResponseSchema>
export type ListingDetailResponse = z.infer<typeof listingDetailResponseSchema>
export type MyListingsResponse = z.infer<typeof myListingsResponseSchema>
export type MarketplaceListParams = z.infer<typeof listParamsSchema>
export type CreateListingInput = z.infer<typeof createListingInputSchema>
export type UpdateListingInput = z.infer<typeof updateListingInputSchema>
export type ListingCategory = z.infer<typeof listingCategorySchema>
export type ListingCondition = z.infer<typeof listingConditionSchema>
