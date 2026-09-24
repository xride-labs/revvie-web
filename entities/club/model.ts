import { z } from 'zod'

import { actorRefSchema } from '@/entities/shared/model'

/**
 * Canonical club shape — transcribed from an actual `GET /clubs/my` response, not from
 * the old `store/slices/clubsSlice.ts` declaration.
 *
 * That distinction matters. The previous type claimed fields the backend has never sent
 * (`avatar`, `membersCount`, `isPrivate`, `tags`, `ridesCount`, `founder`) and the API
 * client asserted them with `apiAuthenticated.get<{ clubs: Club[] }>(...)`, so TypeScript
 * believed the annotation and never checked. Every one of those reads was `undefined` at
 * runtime. Two commits in this repo — "update memberCount to membersCount" and "correct
 * member count property name" — are that bug being found by hand, one screen at a time.
 *
 * `legacy*` getters are deliberately absent: call sites get fixed, not aliased.
 */

/** Upper-case on the wire — the old lower-case union never matched a real response. */
export const clubMemberRoleSchema = z.enum(['FOUNDER', 'ADMIN', 'OFFICER', 'MEMBER'])

/** Matches the Prisma `ClubMemberStatus` enum exactly (backend/prisma/schema.prisma). */
export const clubMemberStatusSchema = z.enum(['ACTIVE', 'MUTED', 'SUSPENDED', 'BANNED'])

/**
 * Membership record. The person is nested under `user` — there are no flat `name` /
 * `avatar` / `username` fields, despite what the previous type declared.
 */
export const clubMemberSchema = z.object({
  id: z.string(),
  clubId: z.string(),
  userId: z.string(),
  role: clubMemberRoleSchema,
  status: clubMemberStatusSchema.catch('ACTIVE'),
  joinedAt: z.string(),
  user: actorRefSchema,

  mutedUntil: z.string().nullable().default(null),
  suspendedUntil: z.string().nullable().default(null),
  bannedUntil: z.string().nullable().default(null),
  lastInteractionAt: z.string().nullable().default(null),
  lastMessageAt: z.string().nullable().default(null),
  messageCount: z.number().int().default(0),
})

export const clubSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().default(''),
  location: z.string().default(''),

  /** The club's primary image. NOT `avatar` — that field does not exist upstream. */
  image: z.string().nullable().default(null),
  coverImage: z.string().nullable().default(null),
  gallery: z.array(z.string()).default([]),

  /** Singular. NOT `membersCount`. */
  memberCount: z.number().int().default(0),

  clubType: z.string().default(''),
  isPublic: z.boolean().default(true),
  requiresLicense: z.boolean().default(false),
  verified: z.boolean().default(false),
  isFeatured: z.boolean().default(false),

  joinPolicy: z.enum(['OPEN', 'APPLICATION', 'INVITE_ONLY']).default('OPEN'),
  joinQuestions: z.array(z.any()).nullable().optional(),

  trophies: z.array(z.string()).default([]),
  trophyCount: z.number().int().default(0),
  reputation: z.number().default(0),

  latitude: z.number().nullable().default(null),
  longitude: z.number().nullable().default(null),

  /** The club's creator. NOT `founder`. */
  owner: actorRefSchema,
  ownerId: z.string(),

  /** Present only on endpoints scoped to the current user (e.g. /clubs/my). */
  role: z.string().optional(),

  /** Prisma relation counts, passed through as-is. */
  _count: z
    .object({ members: z.number().int(), joinRequests: z.number().int() })
    .partial()
    .optional(),

  establishedAt: z.string().nullable().default(null),
  createdAt: z.string(),
  updatedAt: z.string().optional(),
})

export const clubJoinQuestionSchema = z.object({
  id: z.string(),
  question: z.string(),
  type: z.enum(['TEXT', 'CHOICE']).default('TEXT'),
  options: z.array(z.string()).optional(),
  required: z.boolean().default(false),
})
export type ClubJoinQuestion = z.infer<typeof clubJoinQuestionSchema>

/**
 * `GET /clubs/:id`. Membership state and viewer permissions calculated directly by backend.
 */
export const clubDetailsSchema = clubSchema.extend({
  members: z.array(clubMemberSchema),
  joinRequestStatus: z.enum(['PENDING', 'APPROVED', 'REJECTED']).nullable().default(null),
  pendingRequestCount: z.number().int().default(0),
  isMember: z.boolean().default(false),
  isOwner: z.boolean().default(false),
  viewerRole: z.string().nullable().default(null),
  viewerPermissions: z.array(z.string()).default([]),
  viewerCustomRole: z
    .object({
      id: z.string(),
      name: z.string(),
      slug: z.string(),
      color: z.string().nullable().optional(),
      badgeIcon: z.string().nullable().optional(),
      permissions: z.array(z.string()).optional(),
    })
    .nullable()
    .optional(),
  rideCount: z.number().int().default(0),
  announcementsGroupId: z.string().nullable().optional(),
  announcementsConversationId: z.string().nullable().optional(),
})

/** Convenience derivations the UI wants but the backend does not send. */
export function isMemberOf(club: ClubDetails, userId: string | undefined): boolean {
  if (!userId) return false
  return club.members.some((m) => m.userId === userId && m.status === 'ACTIVE')
}

export function memberRoleIn(
  club: ClubDetails,
  userId: string | undefined,
): ClubMemberRole | null {
  if (!userId) return null
  return club.members.find((m) => m.userId === userId)?.role ?? null
}

export type ClubMemberRole = z.infer<typeof clubMemberRoleSchema>
export type ClubMember = z.infer<typeof clubMemberSchema>
export type Club = z.infer<typeof clubSchema>
export type ClubDetails = z.infer<typeof clubDetailsSchema>

export const CLUBS_CACHE_TAG = 'clubs'
export const clubCacheTag = (id: string) => `club:${id}`
