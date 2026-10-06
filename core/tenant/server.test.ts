import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('server-only', () => ({}))
vi.mock('next/headers', () => ({
  headers: vi.fn(),
}))

import { getTenantContext, requireTenant } from './server'
import { headers } from 'next/headers'

describe('Server Tenant Context Helpers', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('reads tenant context from request headers', async () => {
    const mockHeaders = new Map<string, string>([
      ['x-tenant-type', 'CLUB'],
      ['x-tenant-id', 'org-123'],
      ['x-tenant-slug', 'ktm-bangalore'],
      ['x-tenant-name', 'KTM Bangalore Riders'],
      ['x-tenant-status', 'ACTIVE'],
      ['x-tenant-entity-id', 'club-123'],
    ])

    ;(headers as any).mockResolvedValue({
      get: (key: string) => mockHeaders.get(key) ?? null,
    })

    const tenant = await getTenantContext()
    expect(tenant.type).toBe('CLUB')
    expect(tenant.organizationId).toBe('org-123')
    expect(tenant.slug).toBe('ktm-bangalore')
    expect(tenant.clubId).toBe('club-123')
    expect(tenant.isConsumer).toBe(false)
  })

  it('defaults to CONSUMER when no tenant headers present', async () => {
    ;(headers as any).mockResolvedValue({
      get: () => null,
    })

    const tenant = await getTenantContext()
    expect(tenant.type).toBe('CONSUMER')
    expect(tenant.isConsumer).toBe(true)
    expect(tenant.isPlatform).toBe(false)
  })

  it('requireTenant throws when on root consumer', async () => {
    ;(headers as any).mockResolvedValue({
      get: () => null,
    })

    await expect(requireTenant()).rejects.toThrow(/Tenant context required/i)
  })
})
