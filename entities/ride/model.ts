import { z } from 'zod'

import { actorRefSchema } from '@/entities/shared/model'

/**
 * Ride shape — transcribed from a real `GET /rides` response (2026-08-23), not from the
 * old `store/slices/ridesSlice.ts` declaration. The drift here is larger than clubs had:
 * `startLocation`/`endLocation` are plain strings (`"Jaipur Meetup Point"`), not
 * `{name,lat,lng}` objects — latitude/longitude are separate top-level fields. There is no
 * `organizer` (it's `creator`), no nested `club` ref (it's a bare `clubId`), and no
 * `participantsCount` (it's `_count.participants`). Status is upper-case.
 *
 * See `rideDetailsSchema` below for a correction to an earlier, wrong claim about how
 * `GET /rides/:id` wraps this.
 */

/** Matches the Prisma `RideStatus` enum exactly (backend/prisma/schema.prisma). */
export const rideStatusSchema = z.enum([
  'PLANNED',
  'IN_PROGRESS',
  'PAUSED',
  'COMPLETED',
  'CANCELLED',
])

export const rideExperienceLevelSchema = z.enum([
  'Beginner',
  'Intermediate',
  'Advanced',
  'Expert',
])

export const ridePrivacyLevelSchema = z.enum(['PUBLIC', 'CLUB', 'FRIENDS', 'PRIVATE'])

/** Matches the Prisma `RideParticipantStatus` enum exactly. Verified against a live
 *  `GET /rides/:id` response — the value there is `"ACCEPTED"`, not `"CONFIRMED"`. */
export const rideParticipantStatusSchema = z.enum([
  'REQUESTED',
  'ACCEPTED',
  'DECLINED',
  'COMPLETED',
  'CANCELLED',
])

export const rideParticipantSchema = z.object({
  id: z.string(),
  rideId: z.string(),
  userId: z.string(),
  status: rideParticipantStatusSchema,
  joinedAt: z.string(),
  user: actorRefSchema,
})

export const rideSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().default(''),
  status: rideStatusSchema,
  experienceLevel: rideExperienceLevelSchema.optional(),
  xpRequired: z.number().int().default(0),
  pace: z.string().optional(),
  privacyLevel: ridePrivacyLevelSchema.default('PUBLIC'),

  /** Plain address labels, NOT `{name,lat,lng}` objects. */
  startLocation: z.string(),
  endLocation: z.string().nullable().default(null),
  latitude: z.number().nullable().default(null),
  longitude: z.number().nullable().default(null),
  startLat: z.number().nullable().default(null),
  startLng: z.number().nullable().default(null),
  endLat: z.number().nullable().default(null),
  endLng: z.number().nullable().default(null),

  /** Encoded route geometry — shape still moving on the backend, kept loose. */
  routeData: z.unknown().nullable().default(null),
  waypoints: z.unknown().nullable().default(null),
  images: z.array(z.string()).default([]),

  scheduledAt: z.string(),
  endedAt: z.string().nullable().default(null),
  endedReason: z.string().nullable().default(null),
  pausedAt: z.string().nullable().default(null),

  /** Kilometres / minutes. */
  distance: z.number().nullable().default(null),
  duration: z.number().nullable().default(null),
  effectiveDistanceKm: z.number().nullable().default(null),
  effectiveDurationSec: z.number().nullable().default(null),

  isFeatured: z.boolean().default(false),
  keepPermanently: z.boolean().default(false),
  chatGroupId: z.string().nullable().default(null),
  chatLocked: z.boolean().default(false),

  /** The ride's creator. NOT `organizer`. */
  creator: actorRefSchema,
  creatorId: z.string(),
  /** Bare id — NOT a nested `{id,name,avatar}` ref. Resolve via the clubs API if needed. */
  clubId: z.string().nullable().default(null),
  friendGroupId: z.string().nullable().default(null),

  _count: z.object({ participants: z.number().int() }).partial().optional(),

  createdAt: z.string(),
  updatedAt: z.string().optional(),
})

/**
 * `GET /rides/:id` nests this under a `{ ride, participantStatus, pendingRequestCount }`
 * wrapper (see `features/rides/schemas.ts:rideDetailResponseSchema`) — `participantStatus`
 * and `pendingRequestCount` are siblings of `ride`, not fields on it. There is no
 * `isParticipant`/`chatEnabled`/`trackingEnabled` on the wire anywhere; those were
 * invented client-side (an earlier pass here even asserted "the ride object directly,
 * unwrapped" — that was wrong, caught by the fixture-backed contract test failing).
 */
export const rideDetailsSchema = rideSchema.extend({
  participants: z.array(rideParticipantSchema).default([]),
})

export type RideStatus = z.infer<typeof rideStatusSchema>
export type RideParticipantStatus = z.infer<typeof rideParticipantStatusSchema>
export type RideParticipant = z.infer<typeof rideParticipantSchema>
export type Ride = z.infer<typeof rideSchema>
export type RideDetails = z.infer<typeof rideDetailsSchema>

export const RIDES_CACHE_TAG = 'rides'
export const rideCacheTag = (id: string) => `ride:${id}`
