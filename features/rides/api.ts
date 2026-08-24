import { ridesApi } from '@/core/store/api/services'
import type { Ride } from '@/entities/ride/model'

import { RIDE_ENDPOINTS } from './endpoints'
import type {
  CreateRideInput,
  MyRidesResponse,
  RideDetailResponse,
  RideListParams,
  RidesListResponse,
  UpdateRideInput,
} from './schemas'

export const ridesApiSlice = ridesApi.injectEndpoints({
  endpoints: (build) => ({
    listRides: build.query<RidesListResponse, Partial<RideListParams> | void>({
      query: (params) => ({
        url: RIDE_ENDPOINTS.list,
        params: { page: 1, limit: 20, ...params },
      }),
      providesTags: [{ type: 'RideList', id: 'ALL' }],
    }),

    getMyRides: build.query<MyRidesResponse, 'all' | void>({
      query: (status) => ({
        url: RIDE_ENDPOINTS.mine,
        params: status ? { status } : {},
      }),
      providesTags: [{ type: 'RideList', id: 'MINE' }],
    }),

    getRide: build.query<RideDetailResponse, string>({
      query: (rideId) => ({ url: RIDE_ENDPOINTS.detail(rideId) }),
      providesTags: (_result, _error, rideId) => [{ type: 'Ride', id: rideId }],
    }),

    createRide: build.mutation<{ ride: Ride }, CreateRideInput>({
      query: (body) => ({ url: RIDE_ENDPOINTS.list, method: 'POST', body }),
      invalidatesTags: [
        { type: 'RideList', id: 'ALL' },
        { type: 'RideList', id: 'MINE' },
      ],
    }),

    updateRide: build.mutation<{ ride: Ride }, { rideId: string; data: UpdateRideInput }>(
      {
        query: ({ rideId, data }) => ({
          url: RIDE_ENDPOINTS.detail(rideId),
          method: 'PATCH',
          body: data,
        }),
        invalidatesTags: (_result, _error, { rideId }) => [
          { type: 'Ride', id: rideId },
          { type: 'RideList', id: 'ALL' },
        ],
      },
    ),

    deleteRide: build.mutation<void, string>({
      query: (rideId) => ({ url: RIDE_ENDPOINTS.detail(rideId), method: 'DELETE' }),
      invalidatesTags: (_result, _error, rideId) => [
        { type: 'Ride', id: rideId },
        { type: 'RideList', id: 'ALL' },
        { type: 'RideList', id: 'MINE' },
      ],
    }),

    joinRide: build.mutation<unknown, string>({
      query: (rideId) => ({ url: RIDE_ENDPOINTS.join(rideId), method: 'POST' }),
      invalidatesTags: (_result, _error, rideId) => [{ type: 'Ride', id: rideId }],
    }),

    leaveRide: build.mutation<void, string>({
      query: (rideId) => ({ url: RIDE_ENDPOINTS.leave(rideId), method: 'DELETE' }),
      invalidatesTags: (_result, _error, rideId) => [
        { type: 'Ride', id: rideId },
        { type: 'RideList', id: 'MINE' },
      ],
    }),
  }),
})

export const {
  useListRidesQuery,
  useGetMyRidesQuery,
  useGetRideQuery,
  useCreateRideMutation,
  useUpdateRideMutation,
  useDeleteRideMutation,
  useJoinRideMutation,
  useLeaveRideMutation,
} = ridesApiSlice
