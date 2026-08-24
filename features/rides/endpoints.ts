/**
 * Every backend path this feature touches.
 *
 * IMPORTANT: `RIDE_ENDPOINTS.list` is `/rides`, `.mine` is `/rides/mine`. The previous
 * client (`lib/server/rides/index.ts`) called `/rides/upcoming`, `/rides/my` and
 * `/rides/past` — none of which exist on the backend (verified: `grep router.get
 * backend/src/routes/ride/ride.routes.ts` lists only `/mine`, `/`, `/:id`, ...). Every
 * call through the old client returned a 400 "Validation failed for params" and the rides
 * list page has been rendering empty/error state since it was written.
 */
export const RIDE_ENDPOINTS = {
  list: '/rides',
  mine: '/rides/mine',
  detail: (rideId: string) => `/rides/${rideId}`,
  join: (rideId: string) => `/rides/${rideId}/join`,
  leave: (rideId: string) => `/rides/${rideId}/leave`,
} as const
