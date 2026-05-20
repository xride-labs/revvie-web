'use client'

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react'
import { businessApi, type BusinessProfile } from '@/lib/server/business'

interface BusinessContextValue {
  business: BusinessProfile | null
  businesses: BusinessProfile[]
  loading: boolean
  reload: () => Promise<void>
  selectBusiness: (id: string) => void
}

const BusinessContext = createContext<BusinessContextValue | null>(null)

export function BusinessProvider({ children }: { children: ReactNode }) {
  const [businesses, setBusinesses] = useState<BusinessProfile[]>([])
  const [activeBusiness, setActiveBusiness] = useState<BusinessProfile | null>(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    try {
      const items = await businessApi.getMyBusinesses()
      setBusinesses(items)
      if (items.length > 0) {
        setActiveBusiness((prev) => {
          if (prev) {
            const refreshed = items.find((b) => b.id === prev.id)
            return refreshed ?? items[0]
          }
          return items[0]
        })
      } else {
        setActiveBusiness(null)
      }
    } catch {
      // not authenticated yet — caller handles redirect
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const selectBusiness = (id: string) => {
    const found = businesses.find((b) => b.id === id)
    if (found) setActiveBusiness(found)
  }

  return (
    <BusinessContext.Provider
      value={{ business: activeBusiness, businesses, loading, reload: load, selectBusiness }}
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
