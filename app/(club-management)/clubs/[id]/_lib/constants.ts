export const roleColors = {
  FOUNDER: 'bg-amber-100 text-amber-700',
  ADMIN: 'bg-red-100 text-red-700',
  OFFICER: 'bg-blue-100 text-blue-700',
  MEMBER: 'bg-gray-100 text-gray-700',
}

/** Guarded: `name.split(' ')` threw whenever the name was missing. */
export function initials(name: string | null | undefined): string {
  if (!name) return '?'
  return (
    name
      .split(' ')
      .map((part) => part[0])
      .filter(Boolean)
      .slice(0, 2)
      .join('')
      .toUpperCase() || '?'
  )
}

export function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}
