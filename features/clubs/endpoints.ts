/**
 * Every backend path this feature touches, in one place.
 *
 * Server code (`server.ts`) and client code (`api.ts`) both read from here, so a backend
 * route rename is a single edit rather than a grep across the app. Paths are relative to
 * the API root — the gateway prepends the origin, the BFF prepends `/api/gw`.
 */
export const CLUB_ENDPOINTS = {
  myClubs: '/clubs/my',
  discover: '/clubs/discover',
  list: '/clubs',
  detail: (clubId: string) => `/clubs/${clubId}`,
  join: (clubId: string) => `/clubs/${clubId}/join`,
  leave: (clubId: string) => `/clubs/${clubId}/leave`,
  members: (clubId: string) => `/clubs/${clubId}/members`,
  member: (clubId: string, userId: string) => `/clubs/${clubId}/members/${userId}`,
  requests: (clubId: string) => `/clubs/${clubId}/requests`,
  approveRequest: (clubId: string, userId: string) =>
    `/clubs/${clubId}/requests/${userId}/approve`,
  rejectRequest: (clubId: string, userId: string) =>
    `/clubs/${clubId}/requests/${userId}/reject`,
  rides: (clubId: string) => `/clubs/${clubId}/rides`,
  analytics: (clubId: string) => `/clubs/${clubId}/analytics`,
} as const
