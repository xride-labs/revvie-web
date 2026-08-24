import { z } from 'zod'

/**
 * Business/brand domain — verified against `backend/prisma/schema.prisma` (models
 * `BusinessProfile`, `AdCampaign`, `Discount`, `BrandMember`, `ServiceListing`) and a
 * live `GET /business/me` + `/campaigns` + `/discounts` capture (brand seed account,
 * 2026-08-23). Unlike clubs/rides/marketplace/feed, this domain's existing
 * `lib/server/business` types were already accurate — carried forward here rather than
 * rebuilt from nothing, with the small corrections noted inline.
 */

export const businessCategorySchema = z.enum([
  'BRAND',
  'GEAR_SELLER',
  'HELMET_SELLER',
  'PARTS_SELLER',
  'MARKETPLACE_SELLER',
  'CLUB',
  'SERVICE_STORE',
  'MECHANIC',
  'CONSULTATION',
])

export const businessVerificationStatusSchema = z.enum([
  'PENDING',
  'SUBMITTED',
  'APPROVED',
  'REJECTED',
])

export const businessProfileSchema = z.object({
  id: z.string(),
  ownerId: z.string(),
  categories: z.array(businessCategorySchema).default([]),
  displayName: z.string(),
  slug: z.string(),
  tagline: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  logoUrl: z.string().nullable().optional(),
  bannerUrl: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
  email: z.string().nullable().optional(),
  websiteUrl: z.string().nullable().optional(),
  addressLine1: z.string().nullable().optional(),
  addressLine2: z.string().nullable().optional(),
  city: z.string().nullable().optional(),
  region: z.string().nullable().optional(),
  country: z.string().nullable().optional(),
  latitude: z.number().nullable().optional(),
  longitude: z.number().nullable().optional(),
  /** Plain string column on the backend (`"BASIC" | "PRO" | "ENTERPRISE"`), not an enum. */
  pricingTier: z.string().nullable().optional(),
  /** Plain string column (`"FREE" | "PRO"`), not an enum. */
  brandTier: z.string().default('FREE'),
  brandProExpiresAt: z.string().nullable().optional(),
  onboardingCompleted: z.boolean().default(false),
  verification: businessVerificationStatusSchema,
  verificationNotes: z.string().nullable().optional(),
  documents: z.array(z.unknown()).nullable().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export const adPlacementSlotSchema = z.enum([
  'HOME_FEED',
  'DISCOVER_TOP',
  'MARKETPLACE_INLINE',
  'CHAT_LIST_TOP',
  'POST_RIDE_SUMMARY',
])

export const adStatusSchema = z.enum([
  'DRAFT',
  'PENDING_APPROVAL',
  'ACTIVE',
  'PAUSED',
  'COMPLETED',
  'REJECTED',
])

export const adCampaignSchema = z.object({
  id: z.string(),
  businessId: z.string(),
  title: z.string(),
  ctaLabel: z.string(),
  ctaUrl: z.string().nullable().optional(),
  deepLink: z.string().nullable().optional(),
  imageUrl: z.string(),
  videoUrl: z.string().nullable().optional(),
  startsAt: z.string(),
  endsAt: z.string(),
  /** Budget in paise (1/100 INR). */
  budgetPaise: z.number(),
  status: adStatusSchema,
  slots: z.array(adPlacementSlotSchema).default([]),
  targetTags: z.array(z.string()).default([]),
  impressionCap: z.number().int().nullable().optional(),
  impressionCount: z.number().int().default(0),
  clickCount: z.number().int().default(0),
  /** Present when admin moderation rejected or annotated the campaign. */
  reviewNotes: z.string().nullable().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export const discountSchema = z.object({
  id: z.string(),
  businessId: z.string(),
  code: z.string().nullable().optional(),
  title: z.string(),
  description: z.string().nullable().optional(),
  imageUrl: z.string().nullable().optional(),
  percentOff: z.number().nullable().optional(),
  amountOffPaise: z.number().nullable().optional(),
  validFrom: z.string(),
  validUntil: z.string(),
  appliesTo: z.unknown().nullable().optional(),
  isFeatured: z.boolean().default(false),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export const brandMemberRoleSchema = z.enum(['OWNER', 'ADMIN', 'MODERATOR', 'MEMBER'])

export const brandTeamMemberSchema = z.object({
  id: z.string(),
  businessId: z.string(),
  userId: z.string(),
  role: brandMemberRoleSchema,
  invitedBy: z.string().nullable().optional(),
  joinedAt: z.string(),
  user: z.object({
    id: z.string(),
    name: z.string().nullable().optional(),
    email: z.string().nullable().optional(),
    avatar: z.string().nullable().optional(),
  }),
})

export const serviceCategorySchema = z.enum([
  'GENERAL_SERVICE',
  'OIL_CHANGE',
  'BRAKE_SERVICE',
  'TYRE_CHANGE',
  'ELECTRICAL',
  'SUSPENSION',
  'ENGINE_WORK',
  'CUSTOM_MODIFICATION',
  'INSPECTION',
  'ROADSIDE_ASSISTANCE',
  'CONSULTATION',
])

export const serviceListingSchema = z.object({
  id: z.string(),
  businessId: z.string(),
  title: z.string(),
  description: z.string().nullable().optional(),
  category: serviceCategorySchema,
  priceRange: z.string().nullable().optional(),
  duration: z.string().nullable().optional(),
  isActive: z.boolean().default(true),
  createdAt: z.string(),
  updatedAt: z.string(),
})

/** `GET/POST/PATCH /business/:id/products` — verified against `business.routes.ts`
 *  directly (`brandProductCategoryEnum`, `productAvailabilityEnum`, `createProductSchema`). */
export const brandProductCategorySchema = z.enum([
  'MOTORCYCLE',
  'GEAR',
  'HELMET',
  'JACKET',
  'GLOVES',
  'BOOTS',
  'PANTS',
  'PARTS',
  'ACCESSORIES',
  'ELECTRONICS',
  'TOOLS',
  'LUBRICANTS',
  'TYRES',
  'LIGHTING',
  'APPAREL',
  'MEMORABILIA',
  'OTHER',
])

export const productAvailabilitySchema = z.enum([
  'IN_STOCK',
  'OUT_OF_STOCK',
  'PRE_ORDER',
  'DISCONTINUED',
])

export const brandProductSchema = z.object({
  id: z.string(),
  businessId: z.string(),
  title: z.string(),
  description: z.string().nullable().optional(),
  sku: z.string().nullable().optional(),
  category: brandProductCategorySchema,
  price: z.number().nullable().optional(),
  currency: z.string().default('INR'),
  images: z.array(z.string()).default([]),
  availability: productAvailabilitySchema,
  tags: z.array(z.string()).default([]),
  specs: z.record(z.string(), z.unknown()).nullable().optional(),
  isActive: z.boolean(),
  isFeatured: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export type BusinessCategory = z.infer<typeof businessCategorySchema>
export type BusinessVerificationStatus = z.infer<typeof businessVerificationStatusSchema>
export type BusinessProfile = z.infer<typeof businessProfileSchema>
export type AdPlacementSlot = z.infer<typeof adPlacementSlotSchema>
export type AdStatus = z.infer<typeof adStatusSchema>
export type AdCampaign = z.infer<typeof adCampaignSchema>
export type Discount = z.infer<typeof discountSchema>
export type BrandMemberRole = z.infer<typeof brandMemberRoleSchema>
export type BrandTeamMember = z.infer<typeof brandTeamMemberSchema>
export type ServiceCategory = z.infer<typeof serviceCategorySchema>
export type ServiceListing = z.infer<typeof serviceListingSchema>
export type BrandProductCategory = z.infer<typeof brandProductCategorySchema>
export type ProductAvailability = z.infer<typeof productAvailabilitySchema>
export type BrandProduct = z.infer<typeof brandProductSchema>

export const BUSINESS_CACHE_TAG = 'business'
export const businessCacheTag = (id: string) => `business:${id}`
