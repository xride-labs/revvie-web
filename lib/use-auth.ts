'use client'

import { useSession as useBetterAuthSession } from '@/lib/auth-client'
import { useGetMyProfileQuery } from '@/features/user/api'

export interface UserWithRoles {
  id: string
  email: string | null
  name: string | null
  image: string | null
  phone: string | null
  phoneVerified: string | null
  emailVerified: string | null
  bio: string | null
  location: string | null
  roles: string[]
  createdAt: string
  updatedAt: string
}

export interface AuthState {
  user: UserWithRoles | null
  hasSession: boolean
  isAuthenticated: boolean
  isPending: boolean
  error: string | null
}

/**
 * Custom hook that combines Better Auth session with user roles from backend
 * Use this instead of useSession when you need role information
 */
export function useAuth(): AuthState {
  const { data: session, isPending: sessionPending } = useBetterAuthSession()
  const sessionUserId = session?.user?.id ?? null
  const hasSession = !!sessionUserId
  const {
    data,
    isLoading: profileLoading,
    isError,
    error: profileError,
  } = useGetMyProfileQuery(undefined, { skip: sessionPending || !hasSession })
  const profile = data?.user ?? null

  const user = profile
    ? {
        id: profile.id,
        email: profile.email ?? null,
        name: profile.name ?? null,
        image: profile.avatar ?? null,
        phone: null,
        phoneVerified: null,
        emailVerified: null,
        bio: profile.bio ?? null,
        location: profile.location ?? null,
        roles: profile.roles ?? ['USER'],
        createdAt: profile.createdAt?.toString() || '',
        updatedAt: '',
      }
    : null

  return {
    user,
    hasSession,
    isAuthenticated: !!user,
    isPending: sessionPending || (hasSession && profileLoading),
    error: isError
      ? profileError instanceof Error
        ? profileError.message
        : 'Failed to fetch user'
      : null,
  }
}

/**
 * Check if user has any of the specified roles
 */
export function hasAnyRole(
  user: UserWithRoles | null | undefined,
  ...roles: string[]
): boolean {
  if (!user || !user.roles) return false
  return roles.some((role) => user.roles.includes(role))
}

/**
 * Check if user has all of the specified roles
 */
export function hasAllRoles(
  user: UserWithRoles | null | undefined,
  ...roles: string[]
): boolean {
  if (!user || !user.roles) return false
  return roles.every((role) => user.roles.includes(role))
}
