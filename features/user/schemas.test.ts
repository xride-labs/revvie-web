import { describe, expect, it } from 'vitest'

import { meResponseSchema } from './schemas'
import meFixture from './__fixtures__/me.json'

describe('meResponseSchema', () => {
  it('parses a real GET /account/me payload', () => {
    const result = meResponseSchema.safeParse(meFixture)
    expect(result.success, JSON.stringify(result.error?.issues, null, 2)).toBe(true)
  })

  it('carries the fields the profile page reads that the old type lacked', () => {
    const { user } = meResponseSchema.parse(meFixture)
    expect(user.badges.length).toBeGreaterThan(0)
    expect(user.rideStats).toBeDefined()
    expect(user.clubs[0].logo === null || typeof user.clubs[0].logo === 'string').toBe(
      true,
    )
  })
})
