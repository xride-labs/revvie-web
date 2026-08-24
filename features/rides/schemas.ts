import { z } from 'zod'

import { paginationSchema } from '@/entities/shared/model'
import {
  rideDetailsSchema,
  rideParticipantStatusSchema,
  rideSchema,
  rideStatusSchema,
} from '@/entities/ride/model'

/**
 * `GET /rides` returns the ride list bare — `{ items, pagination }`, no per-item wrapper.
 */
export const ridesListResponseSchema = z.object({
  items: z.array(rideSchema),
  pagination: paginationSchema,
})

/**
 * `GET /rides/:id` — confirmed against `backend/src/routes/ride/ride.routes.ts`:
 * `ApiResponse.success(res, { ride, participantStatus, pendingRequestCount })`.
 *
 * An earlier pass here claimed this returned the ride bare, "unwrapped". That was wrong —
 * a verification bug (`j.data.ride ?? j.data` silently picked the nested object either
 * way, so the check couldn't tell wrapped from unwrapped) — caught only once a fixture-
 * backed contract test (schemas.test.ts) started failing on a genuinely missing field.
 */
export const rideDetailResponseSchema = z.object({
  ride: rideDetailsSchema,
  participantStatus: rideParticipantStatusSchema.nullable(),
  pendingRequestCount: z.number().int().default(0),
})

/**
 * `GET /rides/mine` returns a deliberately different, trimmed shape — see the backend's
 * own comment on the route: "the per-ride RideSummary snapshot ... so the mobile profile
 * carousel can render a map preview + distance/time/score without a second fetch." It is
 * NOT the same entity as `rideSchema`; modelling it as one would silently mask that most
 * fields (`creator`, `description`, `images`, ...) are absent here.
 */
export const rideSummarySchema = z.object({
  id: z.string(),
  title: z.string(),
  status: rideStatusSchema,
  startLocation: z.string(),
  endLocation: z.string().nullable().default(null),
  startLat: z.number().nullable().default(null),
  startLng: z.number().nullable().default(null),
  endLat: z.number().nullable().default(null),
  endLng: z.number().nullable().default(null),
  scheduledAt: z.string(),
  endedAt: z.string().nullable().default(null),
  keepPermanently: z.boolean().default(false),
  waypoints: z.unknown().nullable().default(null),
  trackingData: z.unknown().nullable().default(null),
  /** Distance/time/score snapshot — shape still moving, kept loose. */
  summary: z.unknown().nullable().default(null),
  createdAt: z.string(),
})

export const myRidesResponseSchema = z.object({
  items: z.array(rideSummarySchema),
  pagination: paginationSchema,
})

// ── Inputs ───────────────────────────────────────────────────────────────────

export const rideListParamsSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
  status: rideStatusSchema.optional(),
  search: z.string().optional(),
})

/** `POST /rides` / `PATCH /rides/:id` — verified against the backend's `createRideSchema`
 *  in `src/validators/schemas.ts` directly. No `clubId` — a ride cannot be scoped to a
 *  club at creation time on this backend (the field silently no-ops if sent, since zod
 *  strips unrecognized keys); also no `terrain`/`isPrivate`/`requiresApproval`, despite
 *  the create-ride page having form fields for them before this fix. */
export const createRideInputSchema = z.object({
  title: z.string().trim().min(1).max(200),
  description: z.string().trim().max(2000).optional(),
  startLocation: z.string().trim().min(1).max(500),
  endLocation: z.string().trim().max(500).optional(),
  experienceLevel: z.string().trim().max(50).optional(),
  xpRequired: z.number().int().min(0).optional(),
  pace: z.string().trim().max(50).optional(),
  distance: z.number().positive().optional(),
  duration: z.number().int().positive().optional(),
  scheduledAt: z.string().optional(),
  keepPermanently: z.boolean().default(false),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  startLat: z.number().min(-90).max(90).optional(),
  startLng: z.number().min(-180).max(180).optional(),
  endLat: z.number().min(-90).max(90).optional(),
  endLng: z.number().min(-180).max(180).optional(),
  waypoints: z
    .array(
      z.object({
        latitude: z.number().min(-90).max(90),
        longitude: z.number().min(-180).max(180),
        name: z.string().max(500).optional(),
        address: z.string().max(500).optional(),
      }),
    )
    .max(10)
    .optional(),
  routeData: z.union([z.string(), z.record(z.string(), z.any()), z.array(z.any())]).optional(),
  maxParticipants: z.number().int().positive().max(1000).optional(),
  friendGroupId: z.string().optional(),
  image: z.string().optional(),
})

export const updateRideInputSchema = createRideInputSchema.partial()

export type RidesListResponse = z.infer<typeof ridesListResponseSchema>
export type RideDetailResponse = z.infer<typeof rideDetailResponseSchema>
export type MyRidesResponse = z.infer<typeof myRidesResponseSchema>
export type RideSummary = z.infer<typeof rideSummarySchema>
export type RideListParams = z.infer<typeof rideListParamsSchema>
export type CreateRideInput = z.infer<typeof createRideInputSchema>
export type UpdateRideInput = z.infer<typeof updateRideInputSchema>
