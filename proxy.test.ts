import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'
import { proxy } from './proxy'
import * as resolveTenantModule from './core/tenant/resolve-tenant'

describe('Next.js Proxy Subdomain Routing', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    delete process.env.ROOT_DOMAIN
    delete process.env.NEXT_PUBLIC_ROOT_DOMAIN
  })

  it('allows consumer requests on root domain to pass through', async () => {
    const req = new NextRequest('http://revvie.app/home', {
      headers: { host: 'revvie.app' },
    })
    const res = await proxy(req)
    // Passes through (not a rewrite to /admin or /tenant-*)
    const rewriteHeader = res.headers.get('x-middleware-rewrite')
    expect(rewriteHeader).toBeNull()
  })

  it('rewrites platform requests on admin.revvie.app to /admin', async () => {
    const req = new NextRequest('http://admin.revvie.app/', {
      headers: { host: 'admin.revvie.app' },
    })
    const res = await proxy(req)
    const rewriteHeader = res.headers.get('x-middleware-rewrite')
    expect(rewriteHeader).toContain('/admin')
  })

  it('rewrites platform requests on admin.revvie.app/users to /admin/users', async () => {
    const req = new NextRequest('http://admin.revvie.app/users', {
      headers: {
        host: 'admin.revvie.app',
        cookie: 'revvie.session_token=test-session',
      },
    })
    const res = await proxy(req)
    const rewriteHeader = res.headers.get('x-middleware-rewrite')
    expect(rewriteHeader).toContain('/admin/users')
  })

  it('rewrites club tenant /dashboard to /clubs/[entityId] with tenant headers', async () => {
    vi.spyOn(resolveTenantModule, 'fetchTenantBySlug').mockResolvedValueOnce({
      organizationId: 'org-club-1',
      slug: 'ktm-bangalore',
      name: 'KTM Bangalore Riders',
      type: 'CLUB',
      status: 'ACTIVE',
      entityId: 'club-123',
    })

    const req = new NextRequest('http://ktm-bangalore.revvie.app/dashboard', {
      headers: { host: 'ktm-bangalore.revvie.app' },
    })
    const res = await proxy(req)
    const rewriteHeader = res.headers.get('x-middleware-rewrite')
    expect(rewriteHeader).toContain('/clubs/club-123')
  })

  it('rewrites unknown tenant subdomain to /tenant-not-found', async () => {
    vi.spyOn(resolveTenantModule, 'fetchTenantBySlug').mockResolvedValueOnce(null)

    const req = new NextRequest('http://unknown-club.revvie.app/', {
      headers: { host: 'unknown-club.revvie.app' },
    })
    const res = await proxy(req)
    const rewriteHeader = res.headers.get('x-middleware-rewrite')
    expect(rewriteHeader).toContain('/tenant-not-found')
  })

  it('rewrites suspended tenant subdomain to /tenant-suspended', async () => {
    vi.spyOn(resolveTenantModule, 'fetchTenantBySlug').mockResolvedValueOnce({
      organizationId: 'org-suspended-1',
      slug: 'banned-club',
      name: 'Banned Club',
      type: 'CLUB',
      status: 'SUSPENDED',
      entityId: 'club-999',
    })

    const req = new NextRequest('http://banned-club.revvie.app/', {
      headers: { host: 'banned-club.revvie.app' },
    })
    const res = await proxy(req)
    const rewriteHeader = res.headers.get('x-middleware-rewrite')
    expect(rewriteHeader).toContain('/tenant-suspended')
  })

  it('rewrites brand tenant /dashboard to /brand/dashboard', async () => {
    vi.spyOn(resolveTenantModule, 'fetchTenantBySlug').mockResolvedValueOnce({
      organizationId: 'org-brand-1',
      slug: 'ktm',
      name: 'KTM Official',
      type: 'BRAND',
      status: 'ACTIVE',
      entityId: 'brand-101',
    })

    const req = new NextRequest('http://ktm.revvie.app/dashboard', {
      headers: {
        host: 'ktm.revvie.app',
        cookie: 'revvie.session_token=test-session',
      },
    })
    const res = await proxy(req)
    const rewriteHeader = res.headers.get('x-middleware-rewrite')
    expect(rewriteHeader).toContain('/brand/dashboard')
  })

  it('works seamlessly on staging domain revvie.xride-labs.in', async () => {
    vi.spyOn(resolveTenantModule, 'fetchTenantBySlug').mockResolvedValueOnce({
      organizationId: 'org-club-stage',
      slug: 'ktm-bangalore',
      name: 'KTM Bangalore',
      type: 'CLUB',
      status: 'ACTIVE',
      entityId: 'club-stage-1',
    })

    const req = new NextRequest('http://ktm-bangalore.revvie.xride-labs.in/dashboard', {
      headers: { host: 'ktm-bangalore.revvie.xride-labs.in' },
    })
    const res = await proxy(req)
    const rewriteHeader = res.headers.get('x-middleware-rewrite')
    expect(rewriteHeader).toContain('/clubs/club-stage-1')
  })
})

