'use client'

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { useGetBusinessQuery, useGetMyBusinessesQuery } from '@/features/business/api'
import type { BusinessProfile } from '@/entities/business/model'
import { useTenantContext } from './tenant-context'

interface BusinessContextValue {
  business: BusinessProfile | null
  businesses: BusinessProfile[]
  loading: boolean
  reload: () => Promise<void>
  selectBusiness: (id: string) => void
  /** Legacy upper-cased viewer role (e.g. "OWNER"); null when none. */
  role: string | null
  /** Effective permission codes for the active business; [] when nothing is selected. */
  permissions: string[]
}

const BusinessContext = createContext<BusinessContextValue | null>(null)

export function BusinessProvider({ children }: { children: ReactNode }) {
  const tenant = useTenantContext()
  const { data, isLoading: loading, refetch } = useGetMyBusinessesQuery()
  const businesses = data ?? []
  const [activeBusinessId, setActiveBusinessId] = useState<string | null>(null)

  useEffect(() => {
    if (
      (tenant.type === 'BRAND' || tenant.type === 'BUSINESS') &&
      tenant.businessId
    ) {
      setActiveBusinessId(tenant.businessId)
      return
    }
    if (businesses.length === 0) {
      setActiveBusinessId(null)
      return
    }
    setActiveBusinessId((prev) =>
      prev && businesses.some((b) => b.id === prev) ? prev : businesses[0].id,
    )
  }, [businesses, tenant.type, tenant.businessId])

  const activeBusiness = businesses.find((b) => b.id === activeBusinessId) ?? null

  const selectBusiness = (id: string) => {
    if (
      (tenant.type === 'BRAND' || tenant.type === 'BUSINESS') &&
      tenant.businessId &&
      id !== tenant.businessId
    ) {
      const target = businesses.find((b) => b.id === id)
      if (target?.slug && typeof window !== 'undefined') {
        const parts = window.location.host.split('.')
        const root = parts.length > 2 ? parts.slice(1).join('.') : window.location.host
        window.location.href = `${window.location.protocol}//${target.slug}.${root}/dashboard`
        return
      }
    }
    if (businesses.some((b) => b.id === id)) setActiveBusinessId(id)
  }

  // The list payload (`GET /business/me`) carries no viewer fields; effective
  // permission codes live on the details payload (`viewerPermissions`), so
  // select them from there.
  const { data: businessDetails } = useGetBusinessQuery(activeBusinessId ?? '', {
    skip: !activeBusinessId,
  })
  const role = businessDetails?.viewerRole ?? null
  const permissions = businessDetails?.viewerPermissions ?? []

  return (
    <BusinessContext.Provider
      value={{
        business: activeBusiness,
        businesses,
        loading,
        reload: async () => {
          await refetch()
        },
        selectBusiness,
        role,
        permissions,
      }}
    >
      {children}
    </BusinessContext.Provider>
  )
}

export function useBusinessContext() {
  const ctx = useContext(BusinessContext)
  if (!ctx) throw new Error('useBusinessContext must be used within BusinessProvider')
  return ctx
}
