import 'server-only'

import { authorize } from '@/core/auth/session'
import { gateway } from '@/core/http/gateway'

import { MARKETPLACE_ENDPOINTS } from './endpoints'
import {
  listingDetailResponseSchema,
  myListingsResponseSchema,
  publicListingsResponseSchema,
  type PublicListingQueryParams,
} from './schemas'

/**
 * Backs the public `/marketplace` page — no session required. The authenticated
 * list was never any more permissive than this anyway (club-only listings are
 * filtered out for every caller), so there's nothing to branch on here.
 */
export async function listListings(params: Partial<PublicListingQueryParams> = {}) {
  return gateway.get({
    path: MARKETPLACE_ENDPOINTS.publicList,
    query: { page: 1, limit: 20, ...params },
    schema: publicListingsResponseSchema,
  })
}

export async function getMyListings(params: { page?: number; status?: string } = {}) {
  const { cookie } = await authorize()

  return gateway.get({
    path: MARKETPLACE_ENDPOINTS.myListings,
    query: params,
    cookie,
    schema: myListingsResponseSchema,
  })
}

export async function getListing(listingId: string) {
  const { cookie } = await authorize()

  return gateway.get({
    path: MARKETPLACE_ENDPOINTS.detail(listingId),
    cookie,
    schema: listingDetailResponseSchema,
  })
}
