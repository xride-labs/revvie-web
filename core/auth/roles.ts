/**
 * Role names as the backend emits them (see backend User.roles).
 *
 * Kept in a shared module rather than inline string literals so a rename is a compile
 * error instead of a silently-failing check.
 */
export const ROLES = {
  ADMIN: 'ADMIN',
  CO_ADMIN: 'CO_ADMIN',
  MODERATOR: 'MODERATOR',
  CLUB_OWNER: 'CLUB_OWNER',
  CLUB_ADMIN: 'CLUB_ADMIN',
  BRAND_OWNER: 'BRAND_OWNER',
  USER: 'USER',
} as const

export type Role = (typeof ROLES)[keyof typeof ROLES]

/** Anyone who may open /admin at all. Finer checks live on the individual routes. */
export const ADMIN_ROLES: Role[] = [ROLES.ADMIN, ROLES.CO_ADMIN, ROLES.MODERATOR]

/** Routes reserved for full admins — mirrors AdminLayout's SUPER_ADMIN_ONLY_ROUTES. */
export const SUPER_ADMIN_ROLES: Role[] = [ROLES.ADMIN]

export function hasAnyRole(
  roles: readonly string[] | undefined,
  ...required: Role[]
): boolean {
  if (!roles?.length) return false
  return required.some((role) => roles.includes(role))
}
