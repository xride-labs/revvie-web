import { getClub, getClubMembers, getClubRides, getClubAnalytics } from '@/features/clubs/server'
import { ClubAnalyticsView } from './_components/analytics-view'

interface PageProps {
  params: Promise<{ id: string }>
}

/**
 * Server Component: all four datasets are fetched here, in parallel, before any HTML
 * ships — no client-side loading skeleton for the initial paint. Recharts needs a
 * client boundary for the actual chart rendering, so this stays a thin data-fetching
 * wrapper around `ClubAnalyticsView`.
 */
export default async function ClubAnalyticsPage({ params }: PageProps) {
  const { id: clubId } = await params

  const [clubRes, membersRes, ridesRes, analytics] = await Promise.all([
    getClub(clubId),
    getClubMembers(clubId),
    getClubRides(clubId),
    getClubAnalytics(clubId).catch(() => null),
  ])

  return (
    <ClubAnalyticsView
      club={clubRes.club}
      members={membersRes.members}
      rides={ridesRes.items}
      analytics={analytics}
    />
  )
}
