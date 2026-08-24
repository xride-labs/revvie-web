import { discoverClubs, getMyClubs } from '@/features/clubs/server'
import { ClubsTabs } from './_components/clubs-tabs'

/**
 * Server Component: both lists are fetched here, once, before any HTML ships — no
 * client-side loading state for the initial paint. The old version dispatched two thunks
 * from a `useEffect` and rendered a skeleton until they resolved.
 */
export default async function ClubsPage() {
  const [mine, discovered] = await Promise.all([getMyClubs(), discoverClubs(1)])

  return <ClubsTabs myClubs={mine.items} discoveredClubs={discovered.clubs} />
}
