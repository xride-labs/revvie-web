export interface ClubSettings {
  id: string
  name: string
  description: string
  location: string
  image?: string | null
  coverImage?: string | null
  gallery?: string[]
  isPublic: boolean
  requiresLicense?: boolean
  requireApproval: boolean
  allowMemberInvites: boolean
  showMemberList: boolean
}

export const roleOptions = ['MEMBER', 'OFFICER', 'ADMIN']

export const roleColors = {
  FOUNDER: 'bg-primary/10 text-primary',
  ADMIN: 'bg-red-100 text-red-700',
  OFFICER: 'bg-blue-100 text-blue-700',
  MEMBER: 'bg-gray-100 text-gray-700',
}

export function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}
