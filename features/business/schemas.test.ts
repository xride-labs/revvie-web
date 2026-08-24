import { describe, expect, it } from 'vitest'

import { adCampaignSchema, discountSchema, myBusinessesResponseSchema } from './schemas'
import businessMeFixture from './__fixtures__/business-me.json'
import campaignsFixture from './__fixtures__/campaigns.json'
import discountsFixture from './__fixtures__/discounts.json'
import { z } from 'zod'

/**
 * Contract tests against payloads captured from the running backend (brand seed
 * account `brand1@thundergear.com`, 2026-08-23). Unlike clubs/rides/marketplace/feed,
 * this domain's pre-existing `lib/server/business` types were already accurate — these
 * tests confirm that rather than documenting a correction.
 */
describe('myBusinessesResponseSchema', () => {
  it('parses a real GET /business/me payload — an array, no wrapper', () => {
    const result = myBusinessesResponseSchema.safeParse(businessMeFixture)
    expect(result.success, JSON.stringify(result.error?.issues, null, 2)).toBe(true)
  })
})

describe('adCampaignSchema', () => {
  it('parses real campaign records', () => {
    const result = z.array(adCampaignSchema).safeParse(campaignsFixture)
    expect(result.success, JSON.stringify(result.error?.issues, null, 2)).toBe(true)
  })
})

describe('discountSchema', () => {
  it('parses real discount records', () => {
    const result = z.array(discountSchema).safeParse(discountsFixture)
    expect(result.success, JSON.stringify(result.error?.issues, null, 2)).toBe(true)
  })
})
