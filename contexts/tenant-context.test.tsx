import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import React from 'react'
import { TenantProvider, useTenantContext } from './tenant-context'

describe('TenantProvider & useTenantContext', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('provides default consumer context when no initial tenant or subdomain', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <TenantProvider>{children}</TenantProvider>
    )

    const { result } = renderHook(() => useTenantContext(), { wrapper })

    expect(result.current.type).toBe('CONSUMER')
    expect(result.current.isConsumer).toBe(true)
    expect(result.current.isPlatform).toBe(false)
  })

  it('uses provided initialTenant when passed', () => {
    const initialTenant = {
      type: 'CLUB' as const,
      organizationId: 'org-test',
      slug: 'ktm-bangalore',
      name: 'KTM Bangalore',
      clubId: 'club-1',
      isPlatform: false,
      isConsumer: false,
    }

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <TenantProvider initialTenant={initialTenant}>{children}</TenantProvider>
    )

    const { result } = renderHook(() => useTenantContext(), { wrapper })

    expect(result.current.type).toBe('CLUB')
    expect(result.current.organizationId).toBe('org-test')
    expect(result.current.slug).toBe('ktm-bangalore')
    expect(result.current.clubId).toBe('club-1')
  })

  it('fetches tenant metadata when on a tenant subdomain in window.location', async () => {
    const originalLocation = window.location
    // Mock window.location.host
    delete (window as any).location
    ;(window as any).location = {
      host: 'ktm-bangalore.revvie.app',
      protocol: 'https:',
    }

    const mockResponse = {
      data: {
        organizationId: 'org-fetch-1',
        slug: 'ktm-bangalore',
        name: 'KTM Bangalore Official',
        type: 'CLUB',
        status: 'ACTIVE',
        entityId: 'club-fetch-1',
      },
    }

    const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    } as any)

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <TenantProvider>{children}</TenantProvider>
    )

    const { result } = renderHook(() => useTenantContext(), { wrapper })

    await waitFor(() => {
      expect(result.current.type).toBe('CLUB')
      expect(result.current.organizationId).toBe('org-fetch-1')
      expect(result.current.clubId).toBe('club-fetch-1')
    })

    window.location = originalLocation
  })
})
