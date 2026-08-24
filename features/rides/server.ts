import 'server-only'

import { authorize } from '@/core/auth/session'
import { gateway } from '@/core/http/gateway'

import { RIDE_ENDPOINTS } from './endpoints'
import {
  myRidesResponseSchema,
  rideDetailResponseSchema,
  ridesListResponseSchema,
  type RideListParams,
} from './schemas'

export async function listRides(params: Partial<RideListParams> = {}) {
  const { cookie } = await authorize()

  return gateway.get({
    path: RIDE_ENDPOINTS.list,
    query: { page: 1, limit: 20, ...params },
    cookie,
    schema: ridesListResponseSchema,
  })
}

export async function getMyRides(status: 'all' | undefined = undefined) {
  const { cookie } = await authorize()

  return gateway.get({
    path: RIDE_ENDPOINTS.mine,
    query: { status },
    cookie,
    schema: myRidesResponseSchema,
  })
}

export async function getRide(rideId: string) {
  const { cookie } = await authorize()

  return gateway.get({
    path: RIDE_ENDPOINTS.detail(rideId),
    cookie,
    schema: rideDetailResponseSchema,
  })
}
