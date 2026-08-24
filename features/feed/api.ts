import { feedApi } from '@/core/store/api/services'
import type { Post } from '@/entities/post/model'

import { FEED_ENDPOINTS } from './endpoints'
import type { CreatePostInput, FeedParams, FeedResponse } from './schemas'

export const feedApiSlice = feedApi.injectEndpoints({
  endpoints: (build) => ({
    getFeed: build.query<FeedResponse, Partial<FeedParams> | void>({
      query: (params) => {
        // clubId is accepted by the type for forward-compat but the backend ignores it.
        const { clubId: _clubId, ...query } = params ?? {}
        return { url: FEED_ENDPOINTS.list, params: { page: 1, limit: 20, ...query } }
      },
      providesTags: [{ type: 'Feed', id: 'GLOBAL' }],
    }),

    createPost: build.mutation<Post, CreatePostInput>({
      query: (body) => ({ url: FEED_ENDPOINTS.list, method: 'POST', body }),
      invalidatesTags: [{ type: 'Feed', id: 'GLOBAL' }],
    }),

    deletePost: build.mutation<void, string>({
      query: (postId) => ({ url: FEED_ENDPOINTS.post(postId), method: 'DELETE' }),
      invalidatesTags: [{ type: 'Feed', id: 'GLOBAL' }],
    }),

    likePost: build.mutation<void, string>({
      query: (postId) => ({ url: FEED_ENDPOINTS.like(postId), method: 'POST' }),
      invalidatesTags: (_result, _error, postId) => [{ type: 'Post', id: postId }],
    }),

    unlikePost: build.mutation<void, string>({
      query: (postId) => ({ url: FEED_ENDPOINTS.like(postId), method: 'DELETE' }),
      invalidatesTags: (_result, _error, postId) => [{ type: 'Post', id: postId }],
    }),
  }),
})

export const {
  useGetFeedQuery,
  useCreatePostMutation,
  useDeletePostMutation,
  useLikePostMutation,
  useUnlikePostMutation,
} = feedApiSlice
