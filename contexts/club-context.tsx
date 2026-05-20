'use client'

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react'
import { clubsApi } from '@/lib/server/clubs'
import type { Club } from '@/store/slices/clubsSlice'

interface ClubContextValue {
  club: Club | null
  clubs: Club[]
  loading: boolean
  reload: () => Promise<void>
  selectClub: (id: string) => void
}

const ClubContext = createContext<ClubContextValue | null>(null)

export function ClubProvider({ children }: { children: ReactNode }) {
  const [clubs, setClubs] = useState<Club[]>([])
  const [activeClub, setActiveClub] = useState<Club | null>(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    try {
      const { clubs: myClubs } = await clubsApi.getMyClubs()
      setClubs(myClubs ?? [])
      if (myClubs && myClubs.length > 0) {
        setActiveClub((prev) => {
          if (prev) {
            const refreshed = myClubs.find((c) => c.id === prev.id)
            return refreshed ?? myClubs[0]
          }
          return myClubs[0]
        })
      } else {
        setActiveClub(null)
      }
    } catch {
      // not authenticated or no clubs yet
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const selectClub = (id: string) => {
    const found = clubs.find((c) => c.id === id)
    if (found) setActiveClub(found)
  }

  return (
    <ClubContext.Provider value={{ club: activeClub, clubs, loading, reload: load, selectClub }}>
      {children}
    </ClubContext.Provider>
  )
}

export function useClubContext() {
  const ctx = useContext(ClubContext)
  if (!ctx) throw new Error('useClubContext must be used within ClubProvider')
  return ctx
}
