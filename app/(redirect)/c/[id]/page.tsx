import type { Metadata } from 'next'
import { ShareRedirect } from '@/components/share/share-redirect'

interface PageProps {
  params: Promise<{ id: string }>
}

interface ClubPreview {
  id: string
  name: string
  description: string | null
  image: string | null
  location: string | null
  memberCount: number
  isPublic: boolean
}

async function fetchClubPreview(id: string): Promise<ClubPreview | null> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL
  if (!apiUrl) return null
  try {
    const res = await fetch(`${apiUrl}/public/clubs/${id}`, { next: { revalidate: 60 } })
    if (!res.ok) return null
    const json = await res.json()
    return json.data ?? null
  } catch {
    return null
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  const club = await fetchClubPreview(id)
  const title = club ? `Join ${club.name} on Revvie` : 'Join a club on Revvie'
  const description = club
    ? `${club.memberCount} member${club.memberCount !== 1 ? 's' : ''}${club.location ? ` · ${club.location}` : ''}${club.description ? ` — ${club.description}` : ''}`
    : "Someone shared a club with you. Open the Revvie app to see members, rides, and request to join."
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      url: `https://revvie.xride-labs.in/c/${id}`,
      ...(club?.image ? { images: [{ url: club.image }] } : {}),
    },
    twitter: { card: 'summary_large_image', title, description },
  }
}

export default async function ClubSharePage({ params }: PageProps) {
  const { id } = await params
  const club = await fetchClubPreview(id)
  const title = club ? `You're invited to ${club.name}` : "You're invited to a club"
  const description = club
    ? `${club.memberCount} member${club.memberCount !== 1 ? 's' : ''}${club.location ? ` · Based in ${club.location}` : ''}. Open Revvie to see members, upcoming rides, and request to join.`
    : 'Open Revvie to see members, upcoming rides, and request to join the club.'
  return (
    <ShareRedirect
      kind="club"
      id={id}
      title={title}
      description={description}
      imageUrl={club?.image}
      meta={
        club
          ? [
              { label: 'Members', value: String(club.memberCount) },
              ...(club.location ? [{ label: 'Location', value: club.location }] : []),
            ]
          : undefined
      }
    />
  )
}
