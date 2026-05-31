import type { Metadata } from 'next'
import { ShareRedirect } from '@/components/share/share-redirect'

interface PageProps {
  params: Promise<{ id: string }>
}

interface RidePreview {
  id: string
  title: string
  startLocation: string
  scheduledAt: string | null
  bannerImage: string | null
  participantCount: number
  status: string
}

async function fetchRidePreview(id: string): Promise<RidePreview | null> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL
  if (!apiUrl) return null
  try {
    const res = await fetch(`${apiUrl}/public/rides/${id}`, { next: { revalidate: 60 } })
    if (!res.ok) return null
    const json = await res.json()
    return json.data ?? null
  } catch {
    return null
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  const ride = await fetchRidePreview(id)
  const title = ride ? ride.title : 'A ride on Revvie'
  const description = ride
    ? `Starting from ${ride.startLocation} · ${ride.participantCount} rider${ride.participantCount !== 1 ? 's' : ''} joined. Open Revvie to join.`
    : 'Someone shared a ride with you. Open the Revvie app to see details and join.'
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      url: `https://revvie.xride-labs.in/r/${id}`,
      ...(ride?.bannerImage ? { images: [{ url: ride.bannerImage }] } : {}),
    },
    twitter: { card: 'summary_large_image', title, description },
  }
}

export default async function RideSharePage({ params }: PageProps) {
  const { id } = await params
  const ride = await fetchRidePreview(id)
  const title = ride ? ride.title : 'A ride on Revvie'
  const description = ride
    ? `Starting from ${ride.startLocation} · ${ride.participantCount} rider${ride.participantCount !== 1 ? 's' : ''} joined.`
    : 'Someone shared a ride with you. Open the Revvie app to see details and join.'
  return (
    <ShareRedirect
      kind="ride"
      id={id}
      title={title}
      description={description}
      imageUrl={ride?.bannerImage}
      meta={
        ride
          ? [
              { label: 'Start', value: ride.startLocation },
              { label: 'Riders', value: String(ride.participantCount) },
              ...(ride.scheduledAt
                ? [{ label: 'When', value: new Date(ride.scheduledAt).toLocaleDateString() }]
                : []),
            ]
          : undefined
      }
    />
  )
}
