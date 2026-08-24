import { describe, expect, it } from 'vitest'

import {
  adminApprovalsResponseSchema,
  adminClubsResponseSchema,
  adminAdCampaignsResponseSchema,
  adminDiscountsResponseSchema,
  adminListingsResponseSchema,
  adminNotificationsResponseSchema,
  adminRidesResponseSchema,
  adminUsersResponseSchema,
  adminSettingsSchema,
} from './schemas'
import { adminStatsSchema, adminUserDetailSchema } from '@/entities/admin/model'

import statsFixture from './__fixtures__/stats.json'
import usersFixture from './__fixtures__/users.json'
import clubsFixture from './__fixtures__/clubs.json'
import ridesFixture from './__fixtures__/rides.json'
import listingsFixture from './__fixtures__/listings.json'
import approvalsFixture from './__fixtures__/approvals.json'
import userDetailFixture from './__fixtures__/user-detail.json'
import notificationsFixture from './__fixtures__/notifications.json'
import adCampaignsFixture from './__fixtures__/ad-campaigns.json'
import discountsFixture from './__fixtures__/discounts.json'
import settingsFixture from './__fixtures__/settings.json'

/**
 * Contract tests against payloads captured from the running backend (seeded admin
 * session, 2026-08-23). Unlike clubs/rides/marketplace/feed, most of this domain's old
 * `lib/server/admin` types were already accurate — these tests confirm that for the CRUD
 * list endpoints. `/admin/approvals` is the one area with real drift (see the comment in
 * entities/admin/model.ts) and gets an explicit shape assertion below.
 */
describe('admin schemas', () => {
  it('adminStatsSchema matches a real GET /admin/stats payload', () => {
    const r = adminStatsSchema.safeParse(statsFixture)
    expect(r.success, JSON.stringify(r.error?.issues, null, 2)).toBe(true)
  })

  it('adminUsersResponseSchema matches a real GET /admin/users payload', () => {
    const r = adminUsersResponseSchema.safeParse(usersFixture)
    expect(r.success, JSON.stringify(r.error?.issues, null, 2)).toBe(true)
  })

  it('adminUserDetailSchema matches a real GET /admin/users/:id payload', () => {
    const r = adminUserDetailSchema.safeParse(userDetailFixture)
    expect(r.success, JSON.stringify(r.error?.issues, null, 2)).toBe(true)
  })

  it('adminClubsResponseSchema matches a real GET /admin/clubs payload', () => {
    const r = adminClubsResponseSchema.safeParse(clubsFixture)
    expect(r.success, JSON.stringify(r.error?.issues, null, 2)).toBe(true)
  })

  it('adminRidesResponseSchema matches a real GET /admin/rides payload', () => {
    const r = adminRidesResponseSchema.safeParse(ridesFixture)
    expect(r.success, JSON.stringify(r.error?.issues, null, 2)).toBe(true)
  })

  it('adminListingsResponseSchema matches a real GET /admin/marketplace payload', () => {
    const r = adminListingsResponseSchema.safeParse(listingsFixture)
    expect(r.success, JSON.stringify(r.error?.issues, null, 2)).toBe(true)
  })

  it('adminNotificationsResponseSchema matches a real GET /admin/notifications payload', () => {
    const r = adminNotificationsResponseSchema.safeParse(notificationsFixture)
    expect(r.success, JSON.stringify(r.error?.issues, null, 2)).toBe(true)
  })

  it('adminAdCampaignsResponseSchema matches a real GET /admin/ad-campaigns payload', () => {
    const r = adminAdCampaignsResponseSchema.safeParse(adCampaignsFixture)
    expect(r.success, JSON.stringify(r.error?.issues, null, 2)).toBe(true)
  })

  it('adminDiscountsResponseSchema matches a real GET /admin/discounts payload', () => {
    const r = adminDiscountsResponseSchema.safeParse(discountsFixture)
    expect(r.success, JSON.stringify(r.error?.issues, null, 2)).toBe(true)
  })

  it('adminSettingsSchema matches a real GET /admin/settings payload', () => {
    const r = adminSettingsSchema.safeParse(settingsFixture)
    expect(r.success, JSON.stringify(r.error?.issues, null, 2)).toBe(true)
  })

  it('adminApprovalsResponseSchema matches a real GET /admin/approvals payload', () => {
    const r = adminApprovalsResponseSchema.safeParse(approvalsFixture)
    expect(r.success, JSON.stringify(r.error?.issues, null, 2)).toBe(true)
  })

  it('approvals: pendingClub has no location/clubType/memberCount, and pendingRideRequest nests ride/user — the old types claimed otherwise', () => {
    const parsed = adminApprovalsResponseSchema.parse(approvalsFixture)
    if (parsed.pendingClubs.length > 0) {
      expect('location' in parsed.pendingClubs[0]).toBe(false)
      expect('clubType' in parsed.pendingClubs[0]).toBe(false)
      expect('memberCount' in parsed.pendingClubs[0]).toBe(false)
      expect(parsed.pendingClubs[0]._count.members).toBeTypeOf('number')
    }
    if (parsed.pendingRideRequests.length > 0) {
      expect(parsed.pendingRideRequests[0].ride.id).toBeTypeOf('string')
      expect(parsed.pendingRideRequests[0].user.id).toBeTypeOf('string')
    }
  })
})
