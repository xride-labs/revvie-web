'use client'

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { TenantContext, TenantType } from '@/core/tenant/types'
import { resolveHostname } from '@/core/tenant/resolve-hostname'

export interface TenantContextValue extends TenantContext {
  isLoading: boolean
}

const defaultConsumerTenant: TenantContext = {
  type: 'CONSUMER',
  isConsumer: true,
  isPlatform: false,
}

const TenantReactContext = createContext<TenantContextValue>({
  ...defaultConsumerTenant,
  isLoading: false,
})

export function TenantProvider({
  children,
  initialTenant,
}: {
  children: ReactNode
  initialTenant?: TenantContext
}) {
  const [tenant, setTenant] = useState<TenantContext>(
    initialTenant ?? defaultConsumerTenant,
  )
  const [isLoading, setIsLoading] = useState(!initialTenant)

  useEffect(() => {
    if (initialTenant) {
      setTenant(initialTenant)
      setIsLoading(false)
      return
    }

    if (typeof window === 'undefined') return

    const host = window.location.host
    const resolved = resolveHostname(host)

    if (resolved.category === 'CONSUMER') {
      setTenant(defaultConsumerTenant)
      setIsLoading(false)
    } else if (resolved.category === 'PLATFORM') {
      setTenant({
        type: 'PLATFORM',
        name: 'Revvie Platform',
        isPlatform: true,
        isConsumer: false,
      })
      setIsLoading(false)
    } else if (resolved.category === 'TENANT' && resolved.subdomain) {
      fetch(`/api/tenant/resolve?slug=${encodeURIComponent(resolved.subdomain)}`)
        .then((res) => (res.ok ? res.json() : null))
        .then((body) => {
          if (body?.data) {
            const data = body.data
            setTenant({
              type: data.type,
              organizationId: data.organizationId,
              slug: data.slug,
              name: data.name,
              status: data.status,
              isPlatform: false,
              isConsumer: false,
              clubId: data.type === 'CLUB' ? data.entityId : undefined,
              businessId:
                data.type === 'BRAND' || data.type === 'BUSINESS'
                  ? data.entityId
                  : undefined,
            })
          }
        })
        .catch((err) => {
          console.error('[TenantProvider] Error resolving tenant:', err)
        })
        .finally(() => {
          setIsLoading(false)
        })
    } else {
      setIsLoading(false)
    }
  }, [initialTenant])

  return (
    <TenantReactContext.Provider value={{ ...tenant, isLoading }}>
      {children}
    </TenantReactContext.Provider>
  )
}

export function useTenantContext(): TenantContextValue {
  const ctx = useContext(TenantReactContext)
  return ctx
}
