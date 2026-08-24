import { z } from 'zod'

import { actorRefSchema } from '@/entities/shared/model'

/**
 * Listing shape — transcribed from a real `GET /marketplace` response (2026-08-23).
 *
 * Category/condition are free-form title-case strings from the backend (`"Parts"`,
 * `"New"`), not the lower-case kebab union the old slice declared (`'parts'`, `'new'`) —
 * so every category filter comparing against the old union silently matched nothing.
 * There is no `isNegotiable` (it's `allowBids`), no `isSold` (status is an enum), no
 * `viewsCount`, and the seller is `{id,name,avatar}` with no `rating`/`reviewsCount`/
 * `clubs` — those were invented client-side and never populated.
 */

/** Matches the Prisma `ListingStatus` enum exactly (backend/prisma/schema.prisma). */
export const listingStatusSchema = z.enum(['ACTIVE', 'SOLD', 'INACTIVE'])

/** A plain string column on the backend (`"PUBLIC" | "CLUB_ONLY"`), not a Prisma enum. */
export const listingVisibilitySchema = z.string()

const listingSellerSchema = actorRefSchema.extend({
  /** Only present on the detail response — the list response's seller omits it. */
  username: z.string().optional(),
})

export const listingSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().default(''),
  price: z.number(),
  currency: z.string().default('INR'),
  /** Free-form strings from the backend, not a fixed union — e.g. "Parts" / "Guards". */
  category: z.string().nullable().default(null),
  subcategory: z.string().nullable().default(null),
  condition: z.string().nullable().default(null),
  images: z.array(z.string()).default([]),
  videos: z.array(z.string()).default([]),
  /** Prisma column is `String?` — a JSON-encoded blob, not a structured object. */
  specifications: z.string().nullable().default(null),

  locationLabel: z.string().nullable().default(null),
  latitude: z.number().nullable().default(null),
  longitude: z.number().nullable().default(null),

  allowBids: z.boolean().default(false),
  status: listingStatusSchema,
  visibility: listingVisibilitySchema.default('PUBLIC'),
  featured: z.boolean().default(false),
  featuredUntil: z.string().nullable().default(null),

  clubId: z.string().nullable().default(null),
  seller: listingSellerSchema,
  sellerId: z.string(),

  createdAt: z.string(),
  updatedAt: z.string().optional(),
})

const listingOfferSchema = z.object({
  id: z.string(),
  offeredPrice: z.number(),
  status: z.string(),
  buyerId: z.string(),
  createdAt: z.string(),
})

/**
 * `GET /marketplace/:id`. There is no `sellerPhone` or `relatedListings` — those were
 * invented client-side. What the backend actually attaches is a per-viewer offer view
 * (the caller's own offer plus a summary) and, for the seller, every offer.
 */
export const listingDetailsSchema = listingSchema.extend({
  offers: z.array(listingOfferSchema).default([]),
  offerSummary: z
    .object({
      totalOffers: z.number().int(),
      activeOffers: z.number().int(),
      highestOffer: listingOfferSchema.nullable(),
      myOffer: listingOfferSchema.nullable(),
      interestCount: z.number().int(),
    })
    .optional(),
})

export type ListingStatus = z.infer<typeof listingStatusSchema>
export type Listing = z.infer<typeof listingSchema>
export type ListingDetails = z.infer<typeof listingDetailsSchema>

export const LISTINGS_CACHE_TAG = 'listings'
export const listingCacheTag = (id: string) => `listing:${id}`
