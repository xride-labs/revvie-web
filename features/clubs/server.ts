import 'server-only'

import { authorize } from '@/core/auth/session'
import { gateway } from '@/core/http/gateway'

import { CLUB_ENDPOINTS } from './endpoints'
import {
  clubAnalyticsSchema,
  clubMembersResponseSchema,
  clubRequestsResponseSchema,
  clubResponseSchema,
  clubRidesResponseSchema,
  discoverClubsResponseSchema,
  myClubsResponseSchema,
} from './schemas'

/**
 * Server data-access layer for clubs.
 *
 * Every function opens with `authorize()` — session check and cookie in one call. This is
 * the security boundary: `proxy.ts` only sees whether a cookie exists, and the client
 * layout guard only hides UI. Read from Server Components and Server Actions.
 */

export async function getMyClubs() {
  const { cookie } = await authorize()

  return gateway.get({
    path: CLUB_ENDPOINTS.myClubs,
    cookie,
    schema: myClubsResponseSchema,
  })
}

export async function discoverClubs(page = 1) {
  const { cookie } = await authorize()

  return gateway.get({
    path: CLUB_ENDPOINTS.discover,
    query: { page },
    cookie,
    schema: discoverClubsResponseSchema,
  })
}

export async function getClub(clubId: string) {
  const { cookie } = await authorize()

  return gateway.get({
    path: CLUB_ENDPOINTS.detail(clubId),
    cookie,
    schema: clubResponseSchema,
  })
}

export async function getClubMembers(clubId: string, page = 1) {
  const { cookie } = await authorize()

  return gateway.get({
    path: CLUB_ENDPOINTS.members(clubId),
    query: { page },
    cookie,
    schema: clubMembersResponseSchema,
  })
}

export async function getPendingRequests(clubId: string) {
  const { cookie } = await authorize()

  return gateway.get({
    path: CLUB_ENDPOINTS.requests(clubId),
    cookie,
    schema: clubRequestsResponseSchema,
  })
}

export async function getClubRides(clubId: string, page = 1) {
  const { cookie } = await authorize()

  return gateway.get({
    path: CLUB_ENDPOINTS.rides(clubId),
    query: { page },
    cookie,
    schema: clubRidesResponseSchema,
  })
}

export async function getClubAnalytics(clubId: string) {
  const { cookie } = await authorize()

  return gateway.get({
    path: CLUB_ENDPOINTS.analytics(clubId),
    cookie,
    schema: clubAnalyticsSchema,
  })
}
