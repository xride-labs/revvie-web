export const ROLE_OPTIONS = ['ADMIN', 'CO_ADMIN', 'CLUB_OWNER', 'RIDER'] as const

export type RoleOption = (typeof ROLE_OPTIONS)[number]

export const PROTECTED_ROLE_OPTIONS: RoleOption[] = ['ADMIN', 'CO_ADMIN']
export const NON_PRIVILEGED_ROLE_OPTIONS: RoleOption[] = ['CLUB_OWNER', 'RIDER']

export function hasPrivilegedAdminRole(roles: readonly string[]): boolean {
  return roles.some((role) => PROTECTED_ROLE_OPTIONS.includes(role as RoleOption))
}

export function normalizeRolesForForm(roles: readonly string[]): RoleOption[] {
  const normalized = roles.filter((role): role is RoleOption =>
    ROLE_OPTIONS.includes(role as RoleOption),
  )
  return normalized.length ? normalized : ['RIDER']
}

export type UserFormData = {
  email: string
  password: string
  name: string
  username: string
  phone: string
  bio: string
  location: string
  roles: RoleOption[]
}

export const EMPTY_FORM: UserFormData = {
  email: '',
  password: '',
  name: '',
  username: '',
  phone: '',
  bio: '',
  location: '',
  roles: ['RIDER'],
}
