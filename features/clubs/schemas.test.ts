import { describe, expect, it } from 'vitest'

import {
  clubAnalyticsSchema,
  clubResponseSchema,
  clubRidesResponseSchema,
  myClubsResponseSchema,
} from './schemas'
import clubsMyFixture from './__fixtures__/clubs-my.json'
import clubDetailFixture from './__fixtures__/club-detail.json'
import clubAnalyticsFixture from './__fixtures__/club-analytics.json'
import clubRidesFixture from './__fixtures__/club-rides.json'

/**
 * Contract test against a payload captured from the running backend
 * (`GET /clubs/my`, seeded dev database, 2026-08-23).
 *
 * This is the guard that the old `apiAuthenticated.get<{ clubs: Club[] }>(...)` cast
 * could never be: a type assertion tells TypeScript what to believe, it does not check
 * anything. When the backend changes shape, this test fails instead of a screen silently
 * rendering `undefined`. Re-capture the fixture when the endpoint legitimately changes.
 */
describe('myClubsResponseSchema', () => {
  it('parses a real /clubs/my payload', () => {
    const result = myClubsResponseSchema.safeParse(clubsMyFixture)

    expect(result.success, JSON.stringify(result.error?.issues, null, 2)).toBe(true)
    expect(result.data!.items.length).toBeGreaterThan(0)
  })

  it('exposes the fields the UI actually reads', () => {
    const [club] = myClubsResponseSchema.parse(clubsMyFixture).items

    // Each of these was previously misspelled in the type and therefore undefined.
    expect(club.memberCount).toBeTypeOf('number')
    expect(club.image === null || typeof club.image === 'string').toBe(true)
    expect(club.owner.id).toBeTypeOf('string')
  })

  it('rejects the shape the old type claimed', () => {
    // `{ clubs: [...] }` was what the client asserted; the backend never sent it.
    const result = myClubsResponseSchema.safeParse({ clubs: [] })
    expect(result.success).toBe(false)
  })
})

describe('clubResponseSchema', () => {
  it('parses a real /clubs/:id payload', () => {
    const result = clubResponseSchema.safeParse(clubDetailFixture)
    expect(result.success, JSON.stringify(result.error?.issues, null, 2)).toBe(true)
  })

  it('models membership the way the backend expresses it', () => {
    const { club } = clubResponseSchema.parse(clubDetailFixture)

    // Upper-case roles, person nested under `user`, and joinRequestStatus rather than
    // the isMember/isPending/userRole trio the old type invented.
    expect(club.members[0].role).toMatch(/^[A-Z_]+$/)
    expect(club.members[0].user.id).toBeTypeOf('string')
    expect(
      club.joinRequestStatus === null || typeof club.joinRequestStatus === 'string',
    ).toBe(true)
  })
})

/**
 * Contract test against `GET /clubs/:id/analytics` (seeded dev database, 2026-08-23).
 * A prior draft of this schema (`{ membersTotal, ridesTotal }.loose()`) was never
 * verified against the backend — the real payload is per-member chat-activity data
 * plus community aggregates, with no ride stats at all.
 */
describe('clubAnalyticsSchema', () => {
  it('parses a real /clubs/:id/analytics payload', () => {
    const result = clubAnalyticsSchema.safeParse(clubAnalyticsFixture)
    expect(result.success, JSON.stringify(result.error?.issues, null, 2)).toBe(true)
  })

  it('exposes per-member chat-activity fields, not ride stats', () => {
    const parsed = clubAnalyticsSchema.parse(clubAnalyticsFixture)
    expect(parsed.summary.totalMembers).toBeTypeOf('number')
    expect(parsed.members[0].role).toMatch(/^[A-Z_]+$/)
    expect(parsed.members[0].user.name).toBeTypeOf('string')
  })
})

describe('clubRidesResponseSchema', () => {
  it('parses a real /clubs/:id/rides payload, reusing the standard ride shape', () => {
    const result = clubRidesResponseSchema.safeParse(clubRidesFixture)
    expect(result.success, JSON.stringify(result.error?.issues, null, 2)).toBe(true)
    expect(clubRidesResponseSchema.parse(clubRidesFixture).items[0].creator.id).toBeTypeOf(
      'string',
    )
  })
})
