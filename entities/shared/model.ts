import { z } from 'zod'

/**
 * Fragments that recur across domains.
 *
 * These live here rather than being redeclared per entity because the backend genuinely
 * returns the same shape — an author, a seller and a ride organizer are all the same
 * trimmed user record.
 */

export const actorRefSchema = z.object({
  id: z.string(),
  name: z.string(),
  avatar: z.string().nullable().default(null),
})

export const namedActorRefSchema = actorRefSchema.extend({
  username: z.string().default(''),
})

export const clubRefSchema = z.object({
  id: z.string(),
  name: z.string(),
  avatar: z.string().nullable().default(null),
})

export const geoPointSchema = z.object({
  name: z.string().default(''),
  lat: z.number(),
  lng: z.number(),
})

export const paginationSchema = z.object({
  page: z.number().int(),
  limit: z.number().int(),
  total: z.number().int(),
  totalPages: z.number().int(),
})

/** Wraps any item schema in the backend's `{ items, pagination }` list shape. */
export function paginated<T extends z.ZodType>(item: T) {
  return z.object({
    items: z.array(item),
    pagination: paginationSchema,
  })
}

export type ActorRef = z.infer<typeof actorRefSchema>
export type NamedActorRef = z.infer<typeof namedActorRefSchema>
export type ClubRef = z.infer<typeof clubRefSchema>
export type GeoPoint = z.infer<typeof geoPointSchema>
export type Pagination = z.infer<typeof paginationSchema>
export type Paginated<T> = { items: T[]; pagination: Pagination }
