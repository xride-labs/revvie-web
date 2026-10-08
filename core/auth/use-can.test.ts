import { renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

vi.mock('@/contexts/business-context', () => ({
  useBusinessContext: () => ({ permissions: ['business:view_analytics'] }),
}))
vi.mock('@/contexts/club-context', () => ({
  useClubContext: () => ({ permissions: [] }),
}))

import { useCan } from './use-can'

describe('useCan', () => {
  it('allows a held code', () => {
    const { result } = renderHook(() => useCan('business:view_analytics'))
    expect(result.current).toBe(true)
  })

  it('denies an unheld code', () => {
    const { result } = renderHook(() => useCan('business:manage_roles'))
    expect(result.current).toBe(false)
  })
})
