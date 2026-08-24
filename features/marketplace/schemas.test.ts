import { describe, expect, it } from 'vitest'

import {
  listingDetailResponseSchema,
  listingsResponseSchema,
  myListingsResponseSchema,
} from './schemas'
import listingsFixture from './__fixtures__/listings.json'
import listingDetailFixture from './__fixtures__/listing-detail.json'
import myListingsFixture from './__fixtures__/my-listings.json'

describe('listingsResponseSchema', () => {
  it('parses a real GET /marketplace payload', () => {
    const result = listingsResponseSchema.safeParse(listingsFixture)
    expect(result.success, JSON.stringify(result.error?.issues, null, 2)).toBe(true)
  })
})

describe('listingDetailResponseSchema', () => {
  it('parses a real GET /marketplace/:id payload', () => {
    const result = listingDetailResponseSchema.safeParse(listingDetailFixture)
    expect(result.success, JSON.stringify(result.error?.issues, null, 2)).toBe(true)
  })

  it('has no sellerPhone or relatedListings — those were invented client-side', () => {
    const { listing } = listingDetailResponseSchema.parse(listingDetailFixture)
    expect('sellerPhone' in listing).toBe(false)
    expect('relatedListings' in listing).toBe(false)
    expect(listing.offerSummary).toBeDefined()
  })
})

/**
 * Contract test against `GET /marketplace/my-listings` (seeded dev database,
 * 2026-08-23). Unlike the general list route, this one has no Prisma `include` — the
 * items carry no `seller` field at all.
 */
describe('myListingsResponseSchema', () => {
  it('parses a real GET /marketplace/my-listings payload', () => {
    const result = myListingsResponseSchema.safeParse(myListingsFixture)
    expect(result.success, JSON.stringify(result.error?.issues, null, 2)).toBe(true)
  })

  it('has no seller field — the route never includes it', () => {
    const [item] = myListingsResponseSchema.parse(myListingsFixture).items
    expect('seller' in item).toBe(false)
  })
})
