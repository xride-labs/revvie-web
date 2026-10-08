'use client'

import { useBusinessContext } from '@/contexts/business-context'
import { useClubContext } from '@/contexts/club-context'

/**
 * True when the active club/business permission set contains any of `codes`.
 *
 * Reads permissions from both scope contexts (club first, then business). A
 * context with no active selection contributes `[]`, as does a layout that
 * mounts only the other provider (club and brand layouts each mount just
 * their own). Platform `system:admin` passes every gate, mirroring the
 * backend bypass in `RolesService`.
 *
 * The try/catch below is load-bearing, not defensive: each context hook throws
 * when its provider is absent, and exactly one of the two is always absent
 * (club/brand layouts each mount just their own provider). Hook order stays
 * stable because provider presence never changes for a mounted tree — the
 * inner `useContext` still runs before the throw — so the `rules-of-hooks`
 * errors here are false positives.
 */
export function useCan(...codes: string[]): boolean {
  let clubPermissions: string[] = []
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks -- justified in docblock above
    clubPermissions = useClubContext().permissions ?? []
  } catch {
    clubPermissions = []
  }

  let businessPermissions: string[] = []
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks -- justified in docblock above
    businessPermissions = useBusinessContext().permissions ?? []
  } catch {
    businessPermissions = []
  }

  const permissions = [...clubPermissions, ...businessPermissions]
  return codes.some((code) => permissions.includes(code) || permissions.includes('system:admin'))
}

/**
 * Permission codes that grant club-management access (portal gate + manage pages).
 * Mirrors the backend CLUB resolver tiers: founder/admin/custom manage roles hold
 * these; the owner bypass and platform-admin bypass are in the resolver.
 */
export const CLUB_MANAGE_PERMISSION_CODES = [
  'club:manage_settings',
  'club:manage_members',
  'club:manage_roles',
] as const

/** Legacy club membership slugs that imply management access (pre-custom-roles). */
const CLUB_MANAGER_LEGACY_ROLES = ['FOUNDER', 'ADMIN', 'OFFICER']

/**
 * Pure predicate behind every club-manage gate. Takes the page's own club payload
 * (not the active-club context — deep links can render a club that isn't the
 * active one), so all three duplicated sites evaluate identically.
 */
export function canManageClub(
  isOwner: boolean,
  viewerRole: string | null | undefined,
  viewerPermissions: readonly string[] | null | undefined,
): boolean {
  if (isOwner) return true
  if (viewerRole && CLUB_MANAGER_LEGACY_ROLES.includes(viewerRole)) return true
  return (viewerPermissions ?? []).some((p) =>
    (CLUB_MANAGE_PERMISSION_CODES as readonly string[]).includes(p),
  )
}

/**
 * Context-based hook for the active club: true when the active club's permission
 * set contains any club-manage code (or `system:admin`).
 */
export function useClubManage(): boolean {
  return useCan(...CLUB_MANAGE_PERMISSION_CODES)
}
