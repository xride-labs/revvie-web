import { userApi } from '@/core/store/api/services'
import type { Bike, UserProfile } from '@/entities/user/model'

import { USER_ENDPOINTS } from './endpoints'
import type { CreateBikeInput, UpdateBikeInput, UpdateProfileInput } from './schemas'

export const userApiSlice = userApi.injectEndpoints({
  endpoints: (build) => ({
    getMyProfile: build.query<{ user: UserProfile }, void>({
      query: () => ({ url: USER_ENDPOINTS.me }),
      providesTags: [{ type: 'Profile', id: 'ME' }],
    }),

    getPublicProfile: build.query<{ user: UserProfile }, string>({
      query: (userId) => ({ url: USER_ENDPOINTS.publicProfile(userId) }),
      providesTags: (_result, _error, userId) => [{ type: 'Profile', id: userId }],
    }),

    updateProfile: build.mutation<{ user: UserProfile }, UpdateProfileInput>({
      query: (body) => ({ url: USER_ENDPOINTS.me, method: 'PATCH', body }),
      invalidatesTags: [{ type: 'Profile', id: 'ME' }],
    }),

    addBike: build.mutation<{ bike: Bike }, CreateBikeInput>({
      query: (body) => ({ url: USER_ENDPOINTS.bikes, method: 'POST', body }),
      invalidatesTags: [
        { type: 'Bike', id: 'LIST' },
        { type: 'Profile', id: 'ME' },
      ],
    }),

    updateBike: build.mutation<{ bike: Bike }, { bikeId: string; data: UpdateBikeInput }>(
      {
        query: ({ bikeId, data }) => ({
          url: USER_ENDPOINTS.bike(bikeId),
          method: 'PATCH',
          body: data,
        }),
        invalidatesTags: [
          { type: 'Bike', id: 'LIST' },
          { type: 'Profile', id: 'ME' },
        ],
      },
    ),

    deleteBike: build.mutation<void, string>({
      query: (bikeId) => ({ url: USER_ENDPOINTS.bike(bikeId), method: 'DELETE' }),
      invalidatesTags: [
        { type: 'Bike', id: 'LIST' },
        { type: 'Profile', id: 'ME' },
      ],
    }),

    followUser: build.mutation<void, string>({
      query: (userId) => ({ url: USER_ENDPOINTS.follow(userId), method: 'POST' }),
      invalidatesTags: (_result, _error, userId) => [{ type: 'Profile', id: userId }],
    }),

    unfollowUser: build.mutation<void, string>({
      query: (userId) => ({ url: USER_ENDPOINTS.follow(userId), method: 'DELETE' }),
      invalidatesTags: (_result, _error, userId) => [{ type: 'Profile', id: userId }],
    }),
  }),
})

export const {
  useGetMyProfileQuery,
  useLazyGetMyProfileQuery,
  useGetPublicProfileQuery,
  useUpdateProfileMutation,
  useAddBikeMutation,
  useUpdateBikeMutation,
  useDeleteBikeMutation,
  useFollowUserMutation,
  useUnfollowUserMutation,
} = userApiSlice
