export type TenantType = 'PLATFORM' | 'BRAND' | 'CLUB' | 'BUSINESS' | 'CONSUMER'

export type HostCategory = 'CONSUMER' | 'PLATFORM' | 'TENANT' | 'RESERVED'

export interface TenantContext {
  type: TenantType
  organizationId?: string
  slug?: string
  name?: string
  status?: 'ACTIVE' | 'SUSPENDED' | 'PENDING_REVIEW' | 'ARCHIVED'
  isPlatform: boolean
  isConsumer: boolean
  clubId?: string
  businessId?: string
}

export interface HostResolution {
  category: HostCategory
  subdomain: string | null
  normalizedHost: string
}
