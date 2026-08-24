/**
 * Every backend path this feature touches.
 *
 * NOTE: there is no save/unsave/saved-listings route anywhere on the backend (checked
 * `backend/src/routes/marketplace/marketplace.routes.ts` and grepped the whole routes
 * tree for `save`). The old client called `POST/DELETE /marketplace/:id/save` and
 * `getSavedListings()`; every one of those calls has always 404'd. "Save for later" is
 * not implemented server-side — do not wire a client mutation to it without a backend
 * route to match.
 */
export const MARKETPLACE_ENDPOINTS = {
  list: '/marketplace',
  myListings: '/marketplace/my-listings',
  detail: (listingId: string) => `/marketplace/${listingId}`,
  interests: (listingId: string) => `/marketplace/${listingId}/interests`,
  offers: (listingId: string) => `/marketplace/${listingId}/offers`,
} as const
