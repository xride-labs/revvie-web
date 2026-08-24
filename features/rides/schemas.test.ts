import { describe, expect, it } from 'vitest'

import {
  myRidesResponseSchema,
  rideDetailResponseSchema,
  ridesListResponseSchema,
} from './schemas'
import ridesListFixture from './__fixtures__/rides-list.json'
import rideDetailFixture from './__fixtures__/ride-detail.json'
import ridesMineFixture from './__fixtures__/rides-mine.json'

/**
 * Contract tests against payloads captured from the running backend (seeded dev
 * database, 2026-08-23). `/rides` returns the ride list bare — `{ items, pagination }`.
 * `/rides/:id` wraps its result — `{ ride, participantStatus, pendingRequestCount }` —
 * confirmed against `backend/src/routes/ride/ride.routes.ts`. `/rides/mine` returns a
 * distinct trimmed "RideSummary" shape, not the full ride entity. The old client's return
 * types matched none of this.
 *
 * The detail wrapper was gotten wrong once already in this migration: an earlier pass
 * verified it with `Object.keys(j.data.ride ?? j.data)`, which picks `j.data.ride`
 * whenever it exists and therefore can't distinguish wrapped from unwrapped — it looked
 * like confirmation but was really begging the question. This test — parsing an actual
 * captured response through the real schema — is what caught it.
 */
describe('ridesListResponseSchema', () => {
  it('parses a real GET /rides payload', () => {
    const result = ridesListResponseSchema.safeParse(ridesListFixture)
    expect(result.success, JSON.stringify(result.error?.issues, null, 2)).toBe(true)
  })
})

describe('rideDetailResponseSchema', () => {
  it('parses a real GET /rides/:id payload', () => {
    const result = rideDetailResponseSchema.safeParse(rideDetailFixture)
    expect(result.success, JSON.stringify(result.error?.issues, null, 2)).toBe(true)
  })

  it('wraps the ride rather than returning it bare', () => {
    // `{ clubs: [] }` was to clubs what a flat ride would be here — the shape someone
    // might assume without checking. Assert the wrapper explicitly so a regression to
    // "return the ride bare" fails loudly instead of silently.
    expect('ride' in rideDetailFixture).toBe(true)
    expect('participantStatus' in rideDetailFixture).toBe(true)
    const parsed = rideDetailResponseSchema.parse(rideDetailFixture)
    expect(parsed.ride.id).toBeTypeOf('string')
  })

  it('uses the real RideParticipantStatus enum, not the invented CONFIRMED/PENDING pair', () => {
    const { ride } = rideDetailResponseSchema.parse(rideDetailFixture)
    if (ride.participants.length > 0) {
      expect(ride.participants[0].status).toMatch(
        /^(REQUESTED|ACCEPTED|DECLINED|COMPLETED|CANCELLED)$/,
      )
    }
  })
})

describe('myRidesResponseSchema', () => {
  it('parses the distinct RideSummary shape from GET /rides/mine', () => {
    const result = myRidesResponseSchema.safeParse(ridesMineFixture)
    expect(result.success, JSON.stringify(result.error?.issues, null, 2)).toBe(true)
  })

  it('rejects the full ride entity being assumed here', () => {
    // The mine-list item has no `creator`/`description`/`images` — asserting the full
    // Ride shape would have hidden that.
    expect('creator' in ridesMineFixture.items[0]).toBe(false)
  })
})
