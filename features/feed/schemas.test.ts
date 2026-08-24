import { describe, expect, it } from 'vitest'

import { feedResponseSchema } from './schemas'
import feedFixture from './__fixtures__/feed.json'

describe('feedResponseSchema', () => {
  it('parses a real GET /feed payload', () => {
    const result = feedResponseSchema.safeParse(feedFixture)
    expect(result.success, JSON.stringify(result.error?.issues, null, 2)).toBe(true)
  })

  it('has no nested ride/listing payload on posts — those were invented client-side', () => {
    const { posts } = feedResponseSchema.parse(feedFixture)
    expect('ride' in posts[0]).toBe(false)
    expect('listing' in posts[0]).toBe(false)
    expect(typeof posts[0].clubId === 'string' || posts[0].clubId === null).toBe(true)
  })
})
