import { getMyRides, listRides } from '@/features/rides/server'
import { RidesTabs } from './_components/rides-tabs'

export default async function RidesPage() {
  const [upcoming, mine] = await Promise.all([
    listRides({ status: 'PLANNED', limit: 20 }),
    getMyRides('all'),
  ])

  return <RidesTabs upcomingRides={upcoming.items} mineRides={mine.items} />
}
