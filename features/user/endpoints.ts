/**
 * NOTE: there is no username-lookup route. `backend/src/routes/user/*.ts` exposes
 * `GET /users/:id` and `GET /users/:id/public` — both take a user **id** (validated by
 * `idParamSchema`, a cuid check) — and `GET /users?search=` does a fuzzy `contains` match
 * on name/email/username, not an exact lookup. The old client's `getPublicProfile(username)`
 * called `GET /users/${username}`, which 400s for anything that isn't a valid id (verified:
 * `/users/admin` → `{"errors":{"id":["Invalid ID format"]}}`). Any route in this app that
 * navigates to a profile by username (e.g. `/profile/[username]`) is calling a route that
 * cannot resolve. Fixing this needs either a backend username-lookup endpoint or every
 * profile link rewritten to carry the user id instead — flagged, not silently patched here.
 */
export const USER_ENDPOINTS = {
  me: '/account/me',
  publicProfile: (userId: string) => `/users/${userId}/public`,
  bikes: '/users/me/bikes',
  bike: (bikeId: string) => `/users/me/bikes/${bikeId}`,
  follow: (userId: string) => `/users/${userId}/follow`,
} as const
