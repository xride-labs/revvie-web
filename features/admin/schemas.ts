import { z } from 'zod'

import { paginationSchema } from '@/entities/shared/model'
import {
  adCampaignStatusSchema,
  adminAdCampaignSchema,
  adminClubRecordSchema,
  adminDiscountSchema,
  adminListingRecordSchema,
  adminNotificationRecordSchema,
  adminReportRecordSchema,
  adminRideRecordSchema,
  adminSettingsSchema,
  adminUserRecordSchema,
  pendingBusinessSchema,
  pendingClubRequestSchema,
  pendingClubSchema,
  pendingRideRequestSchema,
} from '@/entities/admin/model'

function paginatedResponse<T extends z.ZodType>(item: T) {
  return z.object({ items: z.array(item), pagination: paginationSchema })
}

export const adminUsersResponseSchema = paginatedResponse(adminUserRecordSchema)
export const adminRidesResponseSchema = paginatedResponse(adminRideRecordSchema)
export const adminClubsResponseSchema = paginatedResponse(adminClubRecordSchema)
export const adminListingsResponseSchema = paginatedResponse(adminListingRecordSchema)
export const adminReportsResponseSchema = paginatedResponse(adminReportRecordSchema)
export const adminNotificationsResponseSchema = paginatedResponse(
  adminNotificationRecordSchema,
)
export const adminAdCampaignsResponseSchema = paginatedResponse(adminAdCampaignSchema)
export const adminDiscountsResponseSchema = paginatedResponse(adminDiscountSchema)
export const pendingBusinessesResponseSchema = paginatedResponse(pendingBusinessSchema)

export const adminApprovalsResponseSchema = z.object({
  pendingClubs: z.array(pendingClubSchema),
  pendingClubRequests: z.array(pendingClubRequestSchema),
  pendingRideRequests: z.array(pendingRideRequestSchema),
})

export const bulkActionResultSchema = z.object({
  success: z.boolean(),
  processed: z.number(),
  failed: z.number(),
  errors: z.array(z.object({ id: z.string(), error: z.string() })).optional(),
})

// ── Inputs ───────────────────────────────────────────────────────────────────

export const userFiltersSchema = z.object({
  page: z.number().int().positive().optional(),
  limit: z.number().int().positive().optional(),
  role: z.string().optional(),
  status: z.enum(['active', 'pending']).optional(),
  search: z.string().optional(),
})

export const createAdminUserInputSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().optional(),
  username: z.string().optional(),
  phone: z.string().optional(),
  bio: z.string().optional(),
  location: z.string().optional(),
  activityLevel: z.enum(['Casual', 'Regular', 'Enthusiast', 'Pro']).optional(),
  roles: z.array(z.enum(['ADMIN', 'CO_ADMIN', 'RIDER', 'CLUB_OWNER'])).optional(),
})

export const updateAdminUserInputSchema = z.object({
  email: z.string().email().optional(),
  name: z.string().optional(),
  username: z.string().optional(),
  phone: z.string().nullable().optional(),
  bio: z.string().nullable().optional(),
  location: z.string().nullable().optional(),
  activityLevel: z.enum(['Casual', 'Regular', 'Enthusiast', 'Pro']).optional(),
  emailVerified: z.boolean().optional(),
  phoneVerified: z.boolean().optional(),
  roles: z.array(z.enum(['ADMIN', 'CO_ADMIN', 'RIDER', 'CLUB_OWNER'])).optional(),
})

export const bulkActionModuleSchema = z.enum([
  'clubs',
  'club-join-requests',
  'ride-participants',
  'businesses',
  'ad-campaigns',
  'club-member-requests',
  'brand-campaigns',
  'brand-products',
])

export const bulkActionActionSchema = z.enum([
  'approve',
  'reject',
  'verify',
  'accept',
  'decline',
  'delete',
  'feature',
  'unfeature',
  'hide',
  'show',
])

export const bulkActionRequestSchema = z.object({
  module: bulkActionModuleSchema,
  action: bulkActionActionSchema,
  ids: z.array(z.string()),
  data: z.record(z.string(), z.unknown()).optional(),
})

export type AdminUsersResponse = z.infer<typeof adminUsersResponseSchema>
export type AdminRidesResponse = z.infer<typeof adminRidesResponseSchema>
export type AdminClubsResponse = z.infer<typeof adminClubsResponseSchema>
export type AdminListingsResponse = z.infer<typeof adminListingsResponseSchema>
export type AdminReportsResponse = z.infer<typeof adminReportsResponseSchema>
export type AdminNotificationsResponse = z.infer<typeof adminNotificationsResponseSchema>
export type AdminAdCampaignsResponse = z.infer<typeof adminAdCampaignsResponseSchema>
export type AdminDiscountsResponse = z.infer<typeof adminDiscountsResponseSchema>
export type PendingBusinessesResponse = z.infer<typeof pendingBusinessesResponseSchema>
export type AdminApprovalsResponse = z.infer<typeof adminApprovalsResponseSchema>
export type BulkActionResult = z.infer<typeof bulkActionResultSchema>
export type UserFilters = z.infer<typeof userFiltersSchema>
export type CreateAdminUserInput = z.infer<typeof createAdminUserInputSchema>
export type UpdateAdminUserInput = z.infer<typeof updateAdminUserInputSchema>
export type BulkActionRequest = z.infer<typeof bulkActionRequestSchema>
export { adCampaignStatusSchema }
export { adminSettingsSchema }
