'use client'

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { useGetClubQuery, useGetMyClubsQuery } from '@/features/clubs/api'
import type { Club } from '@/entities/club/model'
import { useTenantContext } from './tenant-context'

interface ClubContextValue {
  club: Club | null
  clubs: Club[]
  loading: boolean
  reload: () => Promise<void>
  selectClub: (id: string) => void
  /** Legacy upper-cased viewer role (e.g. "FOUNDER"); falls back to the list `role`. */
  role: string | null
  /** Effective permission codes for the active club; [] when nothing is selected. */
  permissions: string[]
}

const ClubContext = createContext<ClubContextValue | null>(null)

export function ClubProvider({ children }: { children: ReactNode }) {
  const tenant = useTenantContext()
  const { data, isLoading: loading, refetch } = useGetMyClubsQuery()
  const clubs = data?.items ?? []
  const [activeClubId, setActiveClubId] = useState<string | null>(null)

  useEffect(() => {
    if (tenant.type === 'CLUB' && tenant.clubId) {
      setActiveClubId(tenant.clubId)
      return
    }
    if (clubs.length === 0) {
      setActiveClubId(null)
      return
    }
    setActiveClubId((prev) =>
      prev && clubs.some((c) => c.id === prev) ? prev : clubs[0].id,
    )
  }, [clubs, tenant.type, tenant.clubId])

  const activeClub = clubs.find((c) => c.id === activeClubId) ?? null

  const selectClub = (id: string) => {
    if (tenant.type === 'CLUB' && tenant.clubId && id !== tenant.clubId) {
      const targetClub = clubs.find((c) => c.id === id)
      if (targetClub?.slug && typeof window !== 'undefined') {
        const parts = window.location.host.split('.')
        const root = parts.length > 2 ? parts.slice(1).join('.') : window.location.host
        window.location.href = `${window.location.protocol}//${targetClub.slug}.${root}/dashboard`
        return
      }
    }
    if (clubs.some((c) => c.id === id)) setActiveClubId(id)
  }

  // The list payload only carries `role`; effective permission codes live on
  // the details payload (`viewerPermissions`), so select them from there.
  const { data: clubDetails } = useGetClubQuery(activeClubId ?? '', {
    skip: !activeClubId,
  })
  const role = clubDetails?.club.viewerRole ?? activeClub?.role ?? null
  const permissions = clubDetails?.club.viewerPermissions ?? []

  return (
    <ClubContext.Provider
      value={{
        club: activeClub,
        clubs,
        loading,
        reload: async () => {
          await refetch()
        },
        selectClub,
        role,
        permissions,
      }}
    >
      {children}
    </ClubContext.Provider>
  )
}

export function useClubContext() {
  const ctx = useContext(ClubContext)
  if (!ctx) throw new Error('useClubContext must be used within ClubProvider')
  return ctx
}
