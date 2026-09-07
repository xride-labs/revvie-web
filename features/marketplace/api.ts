import { marketplaceApi } from '@/core/store/api/services'
import type { Listing, ListingDetails } from '@/entities/listing/model'

import { MARKETPLACE_ENDPOINTS } from './endpoints'
import type {
  CreateListingInput,
  ListingsResponse,
  MarketplaceListParams,
  MyListingsResponse,
  PublicListingDetail,
  PublicListingQueryParams,
  PublicListingsResponse,
  UpdateListingInput,
} from './schemas'

export interface ContactSellerInput {
  listingId: string
  name: string
  email: string
  phone?: string
  message: string
}

export const marketplaceApiSlice = marketplaceApi.injectEndpoints({
  endpoints: (build) => ({
    listListings: build.query<ListingsResponse, Partial<MarketplaceListParams> | void>({
      query: (params) => ({
        url: MARKETPLACE_ENDPOINTS.list,
        params: { page: 1, limit: 20, ...params },
      }),
      providesTags: [{ type: 'ListingList', id: 'ALL' }],
    }),

    /**
     * Unauthenticated — backs both the landing page teaser (called with
     * `{ limit: 8 }`) and the public `/marketplace` browse page's live
     * search/filter interactions. See `endpoints.ts`.
     */
    listPublicListings: build.query<
      PublicListingsResponse,
      Partial<PublicListingQueryParams> | void
    >({
      query: (params) => ({ url: MARKETPLACE_ENDPOINTS.publicList, params: params ?? {} }),
      providesTags: [{ type: 'ListingList', id: 'PUBLIC' }],
    }),

    /** Unauthenticated — the public `/marketplace/:id` page's primary data source. */
    getPublicListing: build.query<PublicListingDetail, string>({
      query: (listingId) => ({ url: MARKETPLACE_ENDPOINTS.publicDetail(listingId) }),
      providesTags: (_result, _error, listingId) => [{ type: 'Listing', id: listingId }],
    }),

    /** Unauthenticated "contact seller" — emails the seller, no account needed. */
    contactSeller: build.mutation<{ message: string }, ContactSellerInput>({
      query: ({ listingId, ...body }) => ({
        url: MARKETPLACE_ENDPOINTS.contact(listingId),
        method: 'POST',
        body,
      }),
    }),

    getMyListings: build.query<
      MyListingsResponse,
      { page?: number; status?: string; category?: string; search?: string } | void
    >({
      query: (params) => ({ url: MARKETPLACE_ENDPOINTS.myListings, params: params ?? {} }),
      providesTags: [{ type: 'ListingList', id: 'MINE' }],
    }),

    getListing: build.query<{ listing: ListingDetails }, string>({
      query: (listingId) => ({ url: MARKETPLACE_ENDPOINTS.detail(listingId) }),
      providesTags: (_result, _error, listingId) => [{ type: 'Listing', id: listingId }],
    }),

    createListing: build.mutation<{ listing: Listing }, CreateListingInput>({
      query: (body) => ({ url: MARKETPLACE_ENDPOINTS.list, method: 'POST', body }),
      invalidatesTags: [
        { type: 'ListingList', id: 'ALL' },
        { type: 'ListingList', id: 'MINE' },
      ],
    }),

    updateListing: build.mutation<
      { listing: Listing },
      { listingId: string; data: UpdateListingInput }
    >({
      query: ({ listingId, data }) => ({
        url: MARKETPLACE_ENDPOINTS.detail(listingId),
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (_result, _error, { listingId }) => [
        { type: 'Listing', id: listingId },
        { type: 'ListingList', id: 'ALL' },
        { type: 'ListingList', id: 'MINE' },
      ],
    }),

    deleteListing: build.mutation<void, string>({
      query: (listingId) => ({
        url: MARKETPLACE_ENDPOINTS.detail(listingId),
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, listingId) => [
        { type: 'Listing', id: listingId },
        { type: 'ListingList', id: 'ALL' },
        { type: 'ListingList', id: 'MINE' },
      ],
    }),

    registerInterest: build.mutation<void, string>({
      query: (listingId) => ({
        url: MARKETPLACE_ENDPOINTS.interests(listingId),
        method: 'POST',
      }),
      invalidatesTags: (_result, _error, listingId) => [
        { type: 'Listing', id: listingId },
      ],
    }),
  }),
})

export const {
  useListListingsQuery,
  useListPublicListingsQuery,
  useGetPublicListingQuery,
  useContactSellerMutation,
  useGetMyListingsQuery,
  useGetListingQuery,
  useCreateListingMutation,
  useUpdateListingMutation,
  useDeleteListingMutation,
  useRegisterInterestMutation,
} = marketplaceApiSlice
