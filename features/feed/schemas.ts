import { z } from 'zod'

import { postSchema, postTypeSchema } from '@/entities/post/model'

export const feedResponseSchema = z.object({
  posts: z.array(postSchema),
  hasMore: z.boolean().default(false),
})

export const feedParamsSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
  type: postTypeSchema.optional(),
  authorId: z.string().optional(),
  search: z.string().optional(),
  /** Accepted by the client type, ignored by the backend — see endpoints.ts. */
  clubId: z.string().optional(),
})

/** `POST /feed` — verified against the route's own locally-scoped `createPostSchema` in
 *  `src/routes/feed/feed.routes.ts` (NOT the differently-shaped, unused schema of the
 *  same name in `src/validators/schemas.ts` — always confirm which schema a route's
 *  `validateBody(...)` call actually resolves to, a shared file can have a same-named
 *  but stale sibling). */
export const createPostInputSchema = z.object({
  type: postTypeSchema.default('content'),
  content: z.string().trim().min(1).max(2000),
  images: z.array(z.string()).default([]),
  clubId: z.string().optional().nullable(),
  isAnnouncement: z.boolean().optional(),
  isPinned: z.boolean().optional(),
  expiresAt: z.string().nullable().optional(),
})

export type FeedResponse = z.infer<typeof feedResponseSchema>
export type FeedParams = z.infer<typeof feedParamsSchema>
export type CreatePostInput = z.infer<typeof createPostInputSchema>
