import type { ClubDetails } from '@/entities/club/model'
import type { Ride } from '@/entities/ride/model'

/**
 * The club as this page holds it: the canonical entity plus the rides fetched from a
 * separate endpoint. The local `interface Club` that used to live here declared
 * `gallery: GalleryItem[]` and an `owner.username` the API has never returned. `ClubRide`
 * declared `participantCount` too — the real field is `_count.participants` — so it
 * rendered "undefined riders" on every ride card; fixed to use the real `Ride` shape.
 */
export type ClubWithRides = ClubDetails & { rides: Ride[] }

export interface GalleryItem {
  id: string
  url: string | null
}
