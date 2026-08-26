import { createApi } from '@reduxjs/toolkit/query/react'

import { axiosBaseQuery } from './axios-base-query'

/**
 * One `createApi` per backend domain.
 *
 * Endpoints are injected from `features/<domain>/api.ts` with `injectEndpoints`, so this
 * module stays a thin registry and adding a feature never edits the store. Tag types are
 * declared up front because `injectEndpoints` cannot add new ones.
 */

export const clubsApi = createApi({
  reducerPath: 'clubsApi',
  baseQuery: axiosBaseQuery(),
  tagTypes: ['Club', 'ClubList', 'ClubMember'],
  endpoints: () => ({}),
})

export const ridesApi = createApi({
  reducerPath: 'ridesApi',
  baseQuery: axiosBaseQuery(),
  tagTypes: ['Ride', 'RideList', 'RideParticipant'],
  endpoints: () => ({}),
})

export const marketplaceApi = createApi({
  reducerPath: 'marketplaceApi',
  baseQuery: axiosBaseQuery(),
  tagTypes: ['Listing', 'ListingList', 'SavedListing'],
  endpoints: () => ({}),
})

export const feedApi = createApi({
  reducerPath: 'feedApi',
  baseQuery: axiosBaseQuery(),
  tagTypes: ['Post', 'Feed'],
  endpoints: () => ({}),
})

export const userApi = createApi({
  reducerPath: 'userApi',
  baseQuery: axiosBaseQuery(),
  tagTypes: ['Profile', 'Bike', 'Follower'],
  endpoints: () => ({}),
})

export const businessApi = createApi({
  reducerPath: 'businessApi',
  baseQuery: axiosBaseQuery(),
  tagTypes: [
    'Business',
    'BusinessList',
    'Campaign',
    'Discount',
    'Product',
    'Member',
    'Service',
    'Billing',
  ],
  endpoints: () => ({}),
})

export const mediaApi = createApi({
  reducerPath: 'mediaApi',
  baseQuery: axiosBaseQuery(),
  tagTypes: [],
  endpoints: () => ({}),
})

export const adminApi = createApi({
  reducerPath: 'adminApi',
  baseQuery: axiosBaseQuery(),
  tagTypes: [
    'AdminStats',
    'AdminUser',
    'AdminClub',
    'AdminRide',
    'AdminListing',
    'AdminReport',
    'AdminNotification',
    'AdminApproval',
  ],
  endpoints: () => ({}),
})

export const eventsApi = createApi({
  reducerPath: 'eventsApi',
  baseQuery: axiosBaseQuery(),
  tagTypes: ['Event', 'EventList', 'EventTicket', 'EventOrder', 'EventMetrics'],
  endpoints: () => ({}),
})

export const ALL_APIS = [
  clubsApi,
  ridesApi,
  marketplaceApi,
  feedApi,
  userApi,
  businessApi,
  mediaApi,
  adminApi,
  eventsApi,
] as const
