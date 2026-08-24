'use client'

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { useGetMyClubsQuery } from '@/features/clubs/api'
import type { Club } from '@/entities/club/model'

interface ClubContextValue {
  club: Club | null
  clubs: Club[]
  loading: boolean
  reload: () => Promise<void>
  selectClub: (id: string) => void
}

const ClubContext = createContext<ClubContextValue | null>(null)

export function ClubProvider({ children }: { children: ReactNode }) {
  const { data, isLoading: loading, refetch } = useGetMyClubsQuery()
  const clubs = data?.items ?? []
  const [activeClubId, setActiveClubId] = useState<string | null>(null)

  useEffect(() => {
    if (clubs.length === 0) {
      setActiveClubId(null)
      return
    }
    setActiveClubId((prev) =>
      prev && clubs.some((c) => c.id === prev) ? prev : clubs[0].id,
    )
  }, [clubs])

  const activeClub = clubs.find((c) => c.id === activeClubId) ?? null

  const selectClub = (id: string) => {
    if (clubs.some((c) => c.id === id)) setActiveClubId(id)
  }

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
