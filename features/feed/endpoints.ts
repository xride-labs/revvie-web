/**
 * `/api/feed` and `/api/posts` are the same router mounted twice (backend/src/server.ts),
 * so both prefixes resolve identically — used interchangeably below to match what each
 * caller reads more naturally.
 *
 * NOTE: like `marketplace`, there is no save/unsave route (`grep '"/:id/save"'` on
 * `feed.routes.ts` finds nothing). `savePost`/`unsavePost` in the old client have always
 * 404'd.
 *
 * NOTE: `feedQuerySchema` (backend/src/validators/schemas.ts) accepts `page`, `limit`,
 * `search`, `type`, `authorId` — there is no `clubId` filter. The old home-feed page called
 * `feedApi.getFeed({ clubId: activeClub?.id, page: 1 })`; zod silently strips unknown
 * query keys rather than rejecting them, so that call has always returned the *global*
 * feed regardless of which club was selected. There is no route-level fix available from
 * the frontend — either the backend gains a `clubId` filter, or the club feed is built by
 * filtering client-side after fetch (breaks pagination). Left unresolved; `listFeed` below
 * accepts `clubId` in its params type for forward-compatibility but the backend ignores it.
 */
export const FEED_ENDPOINTS = {
  list: '/feed',
  post: (postId: string) => `/posts/${postId}`,
  like: (postId: string) => `/posts/${postId}/like`,
  comments: (postId: string) => `/posts/${postId}/comments`,
} as const
