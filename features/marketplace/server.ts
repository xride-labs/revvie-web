import 'server-only'

import { authorize } from '@/core/auth/session'
import { gateway } from '@/core/http/gateway'

import { MARKETPLACE_ENDPOINTS } from './endpoints'
import {
  listingDetailResponseSchema,
  listingsResponseSchema,
  myListingsResponseSchema,
  type MarketplaceListParams,
} from './schemas'

export async function listListings(params: Partial<MarketplaceListParams> = {}) {
  const { cookie } = await authorize()

  return gateway.get({
    path: MARKETPLACE_ENDPOINTS.list,
    query: { page: 1, limit: 20, ...params },
    cookie,
    schema: listingsResponseSchema,
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
