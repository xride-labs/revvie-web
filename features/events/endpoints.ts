export const EVENT_ENDPOINTS = {
  list: '/events',
  detail: (id: string) => `/events/${id}`,
  create: '/events',
  update: (id: string) => `/events/${id}`,
  delete: (id: string) => `/events/${id}`,
  attend: (id: string) => `/events/${id}/attend`,
  leave: (id: string) => `/events/${id}/leave`,
  book: (id: string) => `/events/${id}/book`,
  validateTicket: (id: string) => `/events/${id}/validate-ticket`,
  myTickets: '/events/my-tickets',
  metrics: (id: string) => `/events/${id}/metrics`,
} as const
