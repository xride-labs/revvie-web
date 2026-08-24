'use client'

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { useGetMyBusinessesQuery } from '@/features/business/api'
import type { BusinessProfile } from '@/entities/business/model'

interface BusinessContextValue {
  business: BusinessProfile | null
  businesses: BusinessProfile[]
  loading: boolean
  reload: () => Promise<void>
  selectBusiness: (id: string) => void
}

const BusinessContext = createContext<BusinessContextValue | null>(null)

export function BusinessProvider({ children }: { children: ReactNode }) {
  const { data, isLoading: loading, refetch } = useGetMyBusinessesQuery()
  const businesses = data ?? []
  const [activeBusinessId, setActiveBusinessId] = useState<string | null>(null)

  useEffect(() => {
    if (businesses.length === 0) {
      setActiveBusinessId(null)
      return
    }
    setActiveBusinessId((prev) =>
      prev && businesses.some((b) => b.id === prev) ? prev : businesses[0].id,
    )
  }, [businesses])

  const activeBusiness = businesses.find((b) => b.id === activeBusinessId) ?? null

  const selectBusiness = (id: string) => {
    if (businesses.some((b) => b.id === id)) setActiveBusinessId(id)
  }

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
