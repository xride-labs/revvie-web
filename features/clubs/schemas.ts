import { z } from 'zod'

import { clubDetailsSchema, clubMemberSchema, clubSchema } from '@/entities/club/model'
import { rideSchema } from '@/entities/ride/model'
import { paginationSchema } from '@/entities/shared/model'

/**
 * Response and input contracts for the clubs feature.
 *
 * Entities describe the domain object; these describe the *envelopes the backend wraps it
 * in* — `{ clubs }`, `{ club }`, `{ members, hasMore }` — which differ per route and are
 * not domain concepts.
 */

/**
 * Note the inconsistency, verified against the running backend: `/clubs/my` returns
 * `{ items, pagination }` while `/clubs/discover` returns `{ clubs, hasMore }`. The old
 * client typed both as `{ clubs }`, so `getMyClubs()` handed every caller `undefined`.
 * Modelled as-is rather than "fixed" here — normalizing belongs on the backend.
 */
/**
 * The list key is required, never `.default([])`. A default would turn a wrong-shaped
 * response into a silent empty list — exactly the failure mode this layer exists to
 * catch. Defaults belong on optional fields *within* an entity, not on the payload's
 * presence.
 */
export const myClubsResponseSchema = z.object({
  items: z.array(clubSchema),
  pagination: paginationSchema.optional(),
})

export const discoverClubsResponseSchema = z.object({
  clubs: z.array(clubSchema),
  hasMore: z.boolean().default(false),
})

export const clubResponseSchema = z.object({
  club: clubDetailsSchema,
})

export const clubMembersResponseSchema = z.object({
  members: z.array(clubMemberSchema),
  hasMore: z.boolean().default(false),
})

/** `GET /clubs/:id/requests` — a `ClubJoinRequest`, NOT a `ClubMember`. It has no
 *  `role`/`joinedAt` (those only exist once a request is approved); verified against
 *  the `ClubJoinRequest` Prisma model and the route's own `include`. */
export const clubJoinRequestSchema = z.object({
  id: z.string(),
  clubId: z.string(),
  userId: z.string(),
  message: z.string().nullable(),
  status: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  user: z.object({
    id: z.string(),
    name: z.string().nullable(),
    avatar: z.string().nullable(),
    email: z.string().nullable(),
  }),
})

export const clubRequestsResponseSchema = z.object({
  requests: z.array(clubJoinRequestSchema),
})

/** `PATCH /clubs/:id/members/:userId` — verified against `updateMemberRoleSchema` in
 *  `src/validators/schemas.ts`: no `FOUNDER` in the settable set (founders aren't
 *  assigned via this route). */
export const updateMemberRoleInputSchema = z.object({
  role: z.enum(['MEMBER', 'OFFICER', 'ADMIN']),
})

export const updateMemberRoleResponseSchema = z.object({
  membership: z.object({
    id: z.string(),
    clubId: z.string(),
    userId: z.string(),
    role: z.string(),
    user: z.object({
      id: z.string(),
      name: z.string().nullable(),
      avatar: z.string().nullable(),
    }),
  }),
})

/** `GET /clubs/:id/rides` — reuses the same paginated `{ items, pagination }` shape as
 *  the top-level rides list, with the standard `rideSchema` per item (creator + _count
 *  are included by the route's Prisma query). */
export const clubRidesResponseSchema = z.object({
  items: z.array(rideSchema),
  pagination: paginationSchema,
})

/** `GET /clubs/:id/analytics` — ADMIN/FOUNDER only. Verified against
 *  `backend/src/routes/club/club.routes.ts`: NOT the `{membersTotal, ridesTotal}` shape
 *  an earlier, never-verified draft of this schema assumed — the real payload is
 *  per-member chat-activity data plus community aggregates, no ride stats at all. */
export const clubAnalyticsSchema = z.object({
  club: z.object({
    name: z.string().optional(),
    memberCount: z.number().optional(),
  }),
  summary: z.object({
    totalMembers: z.number(),
    activeToday: z.number(),
    activeWeek: z.number(),
    dormant: z.number(),
    totalMessages: z.number(),
    groupCount: z.number(),
    moderated: z.number(),
  }),
  members: z.array(
    z.object({
      userId: z.string(),
      user: z.object({
        id: z.string(),
        name: z.string().nullable(),
        avatar: z.string().nullable(),
        email: z.string().nullable(),
      }),
      role: z.string(),
      status: z.string(),
      joinedAt: z.string(),
      lastInteractionAt: z.string().nullable(),
      lastMessageAt: z.string().nullable(),
      messageCount: z.number(),
    }),
  ),
})

// ── Inputs ───────────────────────────────────────────────────────────────────

/** `POST /clubs` / `PATCH /clubs/:id` — verified against the backend's
 *  `createClubSchema`/`updateClubSchema` in `src/validators/schemas.ts` directly.
 *  Field names match the `Club` entity (`image`, not `avatar`); there is no
 *  `isPrivate`/`requireApproval`/`tags` on this backend at all. */
export const createClubInputSchema = z.object({
  name: z.string().trim().min(2, 'Club name must be at least 2 characters').max(200),
  description: z.string().trim().max(2000).optional(),
  location: z.string().trim().max(500).optional(),
  clubType: z.string().trim().max(100).optional(),
  isPublic: z.boolean().default(true),
  requiresLicense: z.boolean().default(false),
  image: z.string().optional(),
  coverImage: z.string().optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
})

export const updateClubInputSchema = createClubInputSchema.partial()

export const listParamsSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
})

export type MyClubsResponse = z.infer<typeof myClubsResponseSchema>
export type DiscoverClubsResponse = z.infer<typeof discoverClubsResponseSchema>
export type ClubResponse = z.infer<typeof clubResponseSchema>
export type ClubMembersResponse = z.infer<typeof clubMembersResponseSchema>
export type ClubRequestsResponse = z.infer<typeof clubRequestsResponseSchema>
export type ClubRidesResponse = z.infer<typeof clubRidesResponseSchema>
export type UpdateMemberRoleInput = z.infer<typeof updateMemberRoleInputSchema>
export type UpdateMemberRoleResponse = z.infer<typeof updateMemberRoleResponseSchema>
export type ClubAnalytics = z.infer<typeof clubAnalyticsSchema>
export type CreateClubInput = z.infer<typeof createClubInputSchema>
export type UpdateClubInput = z.infer<typeof updateClubInputSchema>
export type ListParams = z.infer<typeof listParamsSchema>
