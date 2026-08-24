import { z } from 'zod'

import { namedActorRefSchema } from '@/entities/shared/model'

/**
 * Feed post shape — transcribed from a real `GET /feed` response (2026-08-23).
 *
 * The old type modelled `ride`/`listing`/`club` as nested reference objects embedded per
 * post ("For ride posts: ride?: {...}"). The backend sends none of that — a post just
 * carries a bare `clubId` and a `type` discriminator; the referenced ride/listing must be
 * fetched separately if the UI wants to show more than the id.
 */

export const postTypeSchema = z.enum([
  'ride',
  'content',
  'listing',
  'club-activity',
  'announcement',
])

export const postSchema = z.object({
  id: z.string(),
  type: postTypeSchema,
  content: z.string().default(''),
  images: z.array(z.string()).default([]),
  author: namedActorRefSchema.extend({
    clubs: z.array(z.object({ id: z.string(), name: z.string() })).default([]),
  }),
  clubId: z.string().nullable().default(null),
  isAnnouncement: z.boolean().default(false),
  isPinned: z.boolean().default(false),
  expiresAt: z.string().nullable().default(null),
  likesCount: z.number().int().default(0),
  commentsCount: z.number().int().default(0),
  isLiked: z.boolean().default(false),
  isSaved: z.boolean().default(false),
  createdAt: z.string(),
})

export type PostType = z.infer<typeof postTypeSchema>
export type Post = z.infer<typeof postSchema>

export const FEED_CACHE_TAG = 'feed'
export const clubFeedCacheTag = (clubId: string) => `feed:club:${clubId}`
