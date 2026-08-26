import { eventsApi } from '@/core/store/api/services'
import { EVENT_ENDPOINTS } from './endpoints'
import type {
  BookTicketInput,
  CreateEventInput,
  EventItem,
  EventMetrics,
  EventsResponse,
  EventTicket,
  ValidateTicketResult,
} from './schemas'

export const eventsApiSlice = eventsApi.injectEndpoints({
  endpoints: (build) => ({
    getEvents: build.query<
      EventsResponse,
      {
        clubId?: string
        category?: string
        visibility?: string
        search?: string
        filter?: string
        timeframe?: string
        page?: number
      } | void
    >({
      query: (params) => ({
        url: EVENT_ENDPOINTS.list,
        params: params || {},
      }),
      providesTags: [{ type: 'EventList', id: 'LIST' }],
    }),

    getEvent: build.query<EventItem, string>({
      query: (id) => ({ url: EVENT_ENDPOINTS.detail(id) }),
      providesTags: (_result, _error, id) => [{ type: 'Event', id }],
    }),

    createEvent: build.mutation<EventItem, CreateEventInput>({
      query: (data) => ({
        url: EVENT_ENDPOINTS.create,
        method: 'POST',
        data,
      }),
      invalidatesTags: [
        { type: 'EventList', id: 'LIST' },
        { type: 'Event', id: 'MINE' },
      ],
    }),

    updateEvent: build.mutation<EventItem, { id: string; data: Partial<CreateEventInput> }>({
      query: ({ id, data }) => ({
        url: EVENT_ENDPOINTS.update(id),
        method: 'PUT',
        data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Event', id },
        { type: 'EventList', id: 'LIST' },
      ],
    }),

    deleteEvent: build.mutation<void, string>({
      query: (id) => ({
        url: EVENT_ENDPOINTS.delete(id),
        method: 'DELETE',
      }),
      invalidatesTags: [
        { type: 'EventList', id: 'LIST' },
      ],
    }),

    attendEvent: build.mutation<void, string>({
      query: (id) => ({
        url: EVENT_ENDPOINTS.attend(id),
        method: 'POST',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'Event', id },
        { type: 'EventList', id: 'LIST' },
      ],
    }),

    leaveEvent: build.mutation<void, string>({
      query: (id) => ({
        url: EVENT_ENDPOINTS.leave(id),
        method: 'POST',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'Event', id },
        { type: 'EventList', id: 'LIST' },
      ],
    }),

    bookTicket: build.mutation<
      { order: any; tickets: EventTicket[] },
      { eventId: string; data: BookTicketInput }
    >({
      query: ({ eventId, data }) => ({
        url: EVENT_ENDPOINTS.book(eventId),
        method: 'POST',
        data,
      }),
      invalidatesTags: (_result, _error, { eventId }) => [
        { type: 'Event', id: eventId },
        { type: 'EventTicket', id: 'MY_TICKETS' },
        { type: 'EventMetrics', id: eventId },
      ],
    }),

    validateTicket: build.mutation<
      ValidateTicketResult,
      { eventId: string; ticketCode: string }
    >({
      query: ({ eventId, ticketCode }) => ({
        url: EVENT_ENDPOINTS.validateTicket(eventId),
        method: 'POST',
        data: { ticketCode },
      }),
      invalidatesTags: (_result, _error, { eventId }) => [
        { type: 'EventMetrics', id: eventId },
      ],
    }),

    getMyTickets: build.query<EventTicket[], void>({
      query: () => ({ url: EVENT_ENDPOINTS.myTickets }),
      providesTags: [{ type: 'EventTicket', id: 'MY_TICKETS' }],
    }),

    getEventMetrics: build.query<EventMetrics, string>({
      query: (id) => ({ url: EVENT_ENDPOINTS.metrics(id) }),
      providesTags: (_result, _error, id) => [{ type: 'EventMetrics', id }],
    }),
  }),
})

export const {
  useGetEventsQuery,
  useGetEventQuery,
  useCreateEventMutation,
  useUpdateEventMutation,
  useDeleteEventMutation,
  useAttendEventMutation,
  useLeaveEventMutation,
  useBookTicketMutation,
  useValidateTicketMutation,
  useGetMyTicketsQuery,
  useGetEventMetricsQuery,
} = eventsApiSlice
