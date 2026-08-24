import { z } from 'zod'

import { paginationSchema } from '@/entities/shared/model'
import {
  adCampaignSchema,
  adPlacementSlotSchema,
  brandProductCategorySchema,
  brandTeamMemberSchema,
  businessCategorySchema,
  businessProfileSchema,
  discountSchema,
  productAvailabilitySchema,
  serviceCategorySchema,
  serviceListingSchema,
} from '@/entities/business/model'

const teamMemberRoleSchema = z.enum(['ADMIN', 'MODERATOR', 'MEMBER'])

export const businessListResponseSchema = z.object({
  items: z.array(businessProfileSchema),
  pagination: paginationSchema,
})

/** `GET /business/me` returns the array bare, no `{ items }` wrapper — a business owner
 *  can run more than one storefront. */
export const myBusinessesResponseSchema = z.array(businessProfileSchema)

export const billingStatusSchema = z.object({
  tier: z.enum(['FREE', 'PRO']),
  expiresAt: z.string().nullable(),
})

/** `GET /business/:id/analytics` — verified against `business.routes.ts` directly. */
export const businessAnalyticsSchema = z.object({
  campaigns: z.number(),
  discounts: z.number(),
  listings: z.number(),
  totalImpressions: z.number(),
  totalClicks: z.number(),
})

// ── Inputs ───────────────────────────────────────────────────────────────────

/** `POST /business` — a separate, deliberately minimal backend schema from update:
 *  the wizard creates a draft with just these three fields, then fills in the rest
 *  via PATCH. Not derived from `updateBusinessInputSchema` — they're independent. */
export const createBusinessInputSchema = z.object({
  categories: z.array(businessCategorySchema).min(1).max(5),
  displayName: z.string().trim().min(2).max(100),
  tagline: z.string().trim().max(200).optional(),
})

/** `PATCH /business/:id` — every field optional (partial drafts), and most are
 *  nullable (clearing a field sends `null`, not omission). Verified against the
 *  backend's `updateBusinessSchema` in `business.routes.ts` directly. */
export const updateBusinessInputSchema = z.object({
  categories: z.array(businessCategorySchema).min(1).max(5).optional(),
  displayName: z.string().trim().min(2).max(100).optional(),
  tagline: z.string().trim().max(200).optional().nullable(),
  description: z.string().trim().max(5000).optional().nullable(),
  logoUrl: z.string().optional().nullable(),
  bannerUrl: z.string().optional().nullable(),
  phone: z.string().max(40).optional().nullable(),
  email: z.string().email().optional().nullable(),
  websiteUrl: z.string().optional().nullable(),
  addressLine1: z.string().max(200).optional().nullable(),
  addressLine2: z.string().max(200).optional().nullable(),
  city: z.string().max(100).optional().nullable(),
  region: z.string().max(100).optional().nullable(),
  country: z.string().max(100).optional().nullable(),
  latitude: z.number().min(-90).max(90).optional().nullable(),
  longitude: z.number().min(-180).max(180).optional().nullable(),
  pricingTier: z.enum(['BASIC', 'PRO', 'ENTERPRISE']).optional().nullable(),
  onboardingCompleted: z.boolean().optional(),
})

/** `POST /business/:id/campaigns` — verified against the backend's
 *  `createCampaignSchema` in `business.routes.ts` directly. `ctaUrl` is nullable, not
 *  just optional; `budgetPaise` defaults to 0 rather than requiring a positive value. */
export const createCampaignInputSchema = z.object({
  title: z.string().trim().min(2).max(120),
  ctaLabel: z.string().trim().min(1).max(40),
  ctaUrl: z.string().optional().nullable(),
  deepLink: z.string().max(200).optional().nullable(),
  imageUrl: z.string(),
  videoUrl: z.string().optional().nullable(),
  startsAt: z.string(),
  endsAt: z.string(),
  budgetPaise: z.number().int().min(0).default(0),
  slots: z.array(adPlacementSlotSchema).min(1),
  targetTags: z.array(z.string()).default([]),
  impressionCap: z.number().int().positive().optional(),
})

export const updateCampaignInputSchema = createCampaignInputSchema.partial()

/** `POST /business/:id/discounts` — verified against `createDiscountSchema` in
 *  `business.routes.ts`. Every optional field is nullable too (clearing sends `null`). */
export const createDiscountInputSchema = z.object({
  code: z.string().trim().max(40).optional().nullable(),
  title: z.string().trim().min(2).max(120),
  description: z.string().trim().max(2000).optional().nullable(),
  imageUrl: z.string().optional().nullable(),
  percentOff: z.number().int().min(1).max(100).optional().nullable(),
  amountOffPaise: z.number().int().min(1).optional().nullable(),
  validFrom: z.string(),
  validUntil: z.string(),
  isFeatured: z.boolean().default(false),
})

export const updateDiscountInputSchema = createDiscountInputSchema.partial()

/** `POST /business/:id/members` / `PATCH /business/:id/members/:userId/role` — verified
 *  against `inviteMemberSchema`/`updateMemberRoleSchema` in `business.routes.ts`. No
 *  `OWNER` in the settable set — ownership isn't assigned via this route. */
export const inviteTeamMemberInputSchema = z.object({
  email: z.string().email(),
  role: teamMemberRoleSchema.default('MEMBER'),
})

export const updateTeamMemberRoleInputSchema = z.object({
  role: teamMemberRoleSchema,
})

/** `POST /business/:id/services` — verified against `createServiceSchema` in
 *  `business.routes.ts`; `category` defaults server-side too. */
export const createServiceInputSchema = z.object({
  title: z.string().trim().min(2).max(120),
  description: z.string().trim().max(2000).optional().nullable(),
  category: serviceCategorySchema.default('GENERAL_SERVICE'),
  priceRange: z.string().max(60).optional().nullable(),
  duration: z.string().max(60).optional().nullable(),
  isActive: z.boolean().default(true),
})

export const updateServiceInputSchema = createServiceInputSchema.partial()

/** `POST /business/:id/products` — verified against `createProductSchema` in
 *  `business.routes.ts`. */
export const createBrandProductInputSchema = z.object({
  title: z.string().trim().min(2).max(200),
  description: z.string().trim().max(5000).optional().nullable(),
  sku: z.string().trim().max(80).optional().nullable(),
  category: brandProductCategorySchema.default('OTHER'),
  price: z.number().positive().optional().nullable(),
  currency: z.string().max(10).default('INR'),
  images: z.array(z.string()).max(10).default([]),
  availability: productAvailabilitySchema.default('IN_STOCK'),
  tags: z.array(z.string().max(40)).max(20).default([]),
  specs: z.record(z.string(), z.unknown()).optional().nullable(),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
})

export const updateBrandProductInputSchema = createBrandProductInputSchema.partial()

export type BusinessListResponse = z.infer<typeof businessListResponseSchema>
export type MyBusinessesResponse = z.infer<typeof myBusinessesResponseSchema>
export type BillingStatus = z.infer<typeof billingStatusSchema>
export type InviteTeamMemberInput = z.infer<typeof inviteTeamMemberInputSchema>
export type UpdateTeamMemberRoleInput = z.infer<typeof updateTeamMemberRoleInputSchema>
export type BusinessAnalytics = z.infer<typeof businessAnalyticsSchema>
export type CreateBusinessInput = z.infer<typeof createBusinessInputSchema>
export type UpdateBusinessInput = z.infer<typeof updateBusinessInputSchema>
export type CreateCampaignInput = z.infer<typeof createCampaignInputSchema>
export type UpdateCampaignInput = z.infer<typeof updateCampaignInputSchema>
export type CreateDiscountInput = z.infer<typeof createDiscountInputSchema>
export type UpdateDiscountInput = z.infer<typeof updateDiscountInputSchema>
export type CreateServiceInput = z.infer<typeof createServiceInputSchema>
export type UpdateServiceInput = z.infer<typeof updateServiceInputSchema>
export type CreateBrandProductInput = z.infer<typeof createBrandProductInputSchema>
export type UpdateBrandProductInput = z.infer<typeof updateBrandProductInputSchema>

export {
  adCampaignSchema,
  brandTeamMemberSchema,
  businessProfileSchema,
  discountSchema,
  serviceListingSchema,
}
