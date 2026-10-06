import 'server-only'

import { cache } from 'react'
import { headers } from 'next/headers'
import type { TenantContext, TenantType } from './types'

export class TenantNotFoundError extends Error {
  constructor(message = 'Tenant context required') {
    super(message)
    this.name = 'TenantNotFoundError'
  }
}

export class TenantSuspendedError extends Error {
  constructor(status: string) {
    super(`Tenant is ${status.toLowerCase()}`)
    this.name = 'TenantSuspendedError'
  }
}

/**
 * Reads tenant context injected by web/proxy.ts into request headers.
 */
export const getTenantContext = cache(async (): Promise<TenantContext> => {
  const headerStore = await headers()

  const type = (headerStore.get('x-tenant-type') as TenantType) || 'CONSUMER'
  const organizationId = headerStore.get('x-tenant-id') || undefined
  const slug = headerStore.get('x-tenant-slug') || undefined
  const name = headerStore.get('x-tenant-name') || undefined
  const status = (headerStore.get('x-tenant-status') as any) || undefined
  const entityId = headerStore.get('x-tenant-entity-id') || undefined

  const isPlatform = type === 'PLATFORM'
  const isConsumer = type === 'CONSUMER'

  const clubId = type === 'CLUB' ? entityId : undefined
  const businessId = type === 'BRAND' || type === 'BUSINESS' ? entityId : undefined

  return {
    type,
    organizationId,
    slug,
    name,
    status,
    isPlatform,
    isConsumer,
    clubId,
    businessId,
  }
})

/**
 * Requires a valid active tenant context (throws if root consumer or inactive).
 */
export async function requireTenant(): Promise<TenantContext> {
  const tenant = await getTenantContext()

  if (tenant.isConsumer || !tenant.organizationId) {
    throw new TenantNotFoundError()
  }

  if (tenant.status === 'SUSPENDED' || tenant.status === 'ARCHIVED') {
    throw new TenantSuspendedError(tenant.status)
  }

  return tenant
}
