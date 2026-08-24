import 'server-only'

import { authorize } from '@/core/auth/session'
import { gateway } from '@/core/http/gateway'

import { FEED_ENDPOINTS } from './endpoints'
import { feedResponseSchema, type FeedParams } from './schemas'

export async function getFeed(params: Partial<FeedParams> = {}) {
  const { cookie } = await authorize()
  // `clubId` is intentionally not forwarded — the backend does not accept it. See the
  // note in endpoints.ts.
  const { clubId: _clubId, ...query } = params

  return gateway.get({
    path: FEED_ENDPOINTS.list,
    query: { page: 1, limit: 20, ...query },
    cookie,
    schema: feedResponseSchema,
  })
}
