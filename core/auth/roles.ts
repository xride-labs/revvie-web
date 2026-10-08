/**
 * Role names as the backend emits them (see backend User.roles).
 *
 * Kept in a shared module rather than inline string literals so a rename is a compile
 * error instead of a silently-failing check.
 */
export const ROLES = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  ADMIN: 'ADMIN',
  CO_ADMIN: 'CO_ADMIN',
  MODERATOR: 'MODERATOR',
  CLUB_OWNER: 'CLUB_OWNER',
  CLUB_ADMIN: 'CLUB_ADMIN',
  CLUB_MODERATOR: 'CLUB_MODERATOR',
  BRAND_OWNER: 'BRAND_OWNER',
  BRAND_ADMIN: 'BRAND_ADMIN',
  BRAND_MODERATOR: 'BRAND_MODERATOR',
  USER: 'USER',
} as const

export type Role = (typeof ROLES)[keyof typeof ROLES]

/** Anyone who may open /admin at all. Finer checks live on the individual routes. */
export const ADMIN_ROLES: Role[] = [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.CO_ADMIN, ROLES.MODERATOR]

/** Routes reserved for full admins — mirrors AdminLayout's SUPER_ADMIN_ONLY_ROUTES. */
export const SUPER_ADMIN_ROLES: Role[] = [ROLES.SUPER_ADMIN, ROLES.ADMIN]

/**
 * Session roles accepted at the club-portal login tab. Stays session-based: no
 * permission context exists pre-login, and the portal gate itself (useCan) takes
 * over once a club is active.
 */
export const CLUB_PORTAL_ROLES: Role[] = [
  ROLES.CLUB_OWNER,
  ROLES.CLUB_ADMIN,
  ROLES.CLUB_MODERATOR,
  ROLES.SUPER_ADMIN,
  ROLES.ADMIN,
  ROLES.CO_ADMIN,
  ROLES.MODERATOR,
]

/** Session roles accepted at the brand-portal login tab. Same pre-login rationale. */
export const BRAND_PORTAL_ROLES: Role[] = [
  ROLES.BRAND_OWNER,
  ROLES.BRAND_ADMIN,
  ROLES.BRAND_MODERATOR,
  ROLES.SUPER_ADMIN,
  ROLES.ADMIN,
  ROLES.CO_ADMIN,
]

export function hasAnyRole(
  roles: readonly string[] | undefined,
  ...required: Role[]
): boolean {
  if (!roles?.length) return false
  return required.some((role) => roles.includes(role))
}
