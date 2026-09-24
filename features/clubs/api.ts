import { clubsApi } from '@/core/store/api/services'
import type { Club, ClubDetails, ClubMember } from '@/entities/club/model'

import { CLUB_ENDPOINTS } from './endpoints'
import type {
  ClubAnalytics,
  ClubJoinFlow,
  ClubPermission,
  ClubRequestsResponse,
  ClubRidesResponse,
  ClubRole,
  CreateClubInput,
  CreateClubRoleInput,
  ModerateMemberInput,
  MyClubsResponse,
  UpdateClubInput,
  UpdateClubJoinFlowInput,
  UpdateClubRoleInput,
  UpdateMemberRoleInput,
  UpdateMemberRoleResponse,
} from './schemas'

/**
 * Client-side clubs endpoints.
 *
 * Injected rather than declared on the store so adding a feature never edits
 * `core/store`. Tag invalidation replaces the manual "refetch after mutate" that the
 * thunk layer had to do by hand in every component.
 */
export const clubsApiSlice = clubsApi.injectEndpoints({
  endpoints: (build) => ({
    getMyClubs: build.query<MyClubsResponse, void>({
      query: () => ({ url: CLUB_ENDPOINTS.myClubs }),
      providesTags: [{ type: 'ClubList', id: 'MINE' }],
    }),

    discoverClubs: build.query<{ clubs: Club[]; hasMore: boolean }, number | void>({
      query: (page) => ({ url: CLUB_ENDPOINTS.discover, params: { page: page ?? 1 } }),
      providesTags: [{ type: 'ClubList', id: 'DISCOVER' }],
    }),

    getClub: build.query<{ club: ClubDetails }, string>({
      query: (clubId) => ({ url: CLUB_ENDPOINTS.detail(clubId) }),
      providesTags: (_result, _error, clubId) => [{ type: 'Club', id: clubId }],
    }),

    getClubMembers: build.query<
      { members: ClubMember[]; hasMore: boolean },
      { clubId: string; page?: number }
    >({
      query: ({ clubId, page = 1 }) => ({
        url: CLUB_ENDPOINTS.members(clubId),
        params: { page },
      }),
      providesTags: (_result, _error, { clubId }) => [{ type: 'ClubMember', id: clubId }],
    }),

    getClubRides: build.query<
      ClubRidesResponse,
      { clubId: string; page?: number; status?: string; search?: string }
    >({
      query: ({ clubId, ...params }) => ({
        url: CLUB_ENDPOINTS.rides(clubId),
        params,
      }),
      providesTags: (_result, _error, { clubId }) => [{ type: 'Club', id: clubId }],
    }),

    getClubAnalytics: build.query<ClubAnalytics, string>({
      query: (clubId) => ({ url: CLUB_ENDPOINTS.analytics(clubId) }),
      providesTags: (_result, _error, clubId) => [{ type: 'Club', id: clubId }],
    }),

    getPendingRequests: build.query<ClubRequestsResponse, string>({
      query: (clubId) => ({ url: CLUB_ENDPOINTS.requests(clubId) }),
      providesTags: (_result, _error, clubId) => [{ type: 'ClubMember', id: clubId }],
    }),

    updateMemberRole: build.mutation<
      UpdateMemberRoleResponse,
      { clubId: string; userId: string; data: UpdateMemberRoleInput }
    >({
      query: ({ clubId, userId, data }) => ({
        url: CLUB_ENDPOINTS.member(clubId, userId),
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (_result, _error, { clubId }) => [
        { type: 'ClubMember', id: clubId },
        { type: 'Club', id: clubId },
      ],
    }),

    removeMember: build.mutation<void, { clubId: string; userId: string }>({
      query: ({ clubId, userId }) => ({
        url: CLUB_ENDPOINTS.member(clubId, userId),
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, { clubId }) => [
        { type: 'ClubMember', id: clubId },
        { type: 'Club', id: clubId },
      ],
    }),

    createClub: build.mutation<{ club: Club }, CreateClubInput>({
      query: (body) => ({ url: CLUB_ENDPOINTS.list, method: 'POST', body }),
      invalidatesTags: [
        { type: 'ClubList', id: 'MINE' },
        { type: 'ClubList', id: 'DISCOVER' },
      ],
    }),

    updateClub: build.mutation<{ club: Club }, { clubId: string; data: UpdateClubInput }>(
      {
        query: ({ clubId, data }) => ({
          url: CLUB_ENDPOINTS.detail(clubId),
          method: 'PATCH',
          body: data,
        }),
        invalidatesTags: (_result, _error, { clubId }) => [
          { type: 'Club', id: clubId },
          { type: 'ClubList', id: 'MINE' },
        ],
      },
    ),

    deleteClub: build.mutation<void, string>({
      query: (clubId) => ({ url: CLUB_ENDPOINTS.detail(clubId), method: 'DELETE' }),
      invalidatesTags: (_result, _error, clubId) => [
        { type: 'Club', id: clubId },
        { type: 'ClubList', id: 'MINE' },
        { type: 'ClubList', id: 'DISCOVER' },
      ],
    }),

    joinClub: build.mutation<unknown, string>({
      query: (clubId) => ({ url: CLUB_ENDPOINTS.join(clubId), method: 'POST' }),
      invalidatesTags: (_result, _error, clubId) => [
        { type: 'Club', id: clubId },
        { type: 'ClubList', id: 'MINE' },
      ],
    }),

    leaveClub: build.mutation<void, string>({
      query: (clubId) => ({ url: CLUB_ENDPOINTS.leave(clubId), method: 'DELETE' }),
      invalidatesTags: (_result, _error, clubId) => [
        { type: 'Club', id: clubId },
        { type: 'ClubList', id: 'MINE' },
      ],
    }),

    approveRequest: build.mutation<void, { clubId: string; userId: string }>({
      query: ({ clubId, userId }) => ({
        url: CLUB_ENDPOINTS.approveRequest(clubId, userId),
        method: 'POST',
      }),
      invalidatesTags: (_result, _error, { clubId }) => [
        { type: 'ClubMember', id: clubId },
        { type: 'Club', id: clubId },
      ],
    }),

    rejectRequest: build.mutation<void, { clubId: string; userId: string }>({
      query: ({ clubId, userId }) => ({
        url: CLUB_ENDPOINTS.rejectRequest(clubId, userId),
        method: 'POST',
      }),
      invalidatesTags: (_result, _error, { clubId }) => [
        { type: 'ClubMember', id: clubId },
      ],
    }),

    getClubJoinFlow: build.query<{ joinFlow: ClubJoinFlow }, string>({
      query: (clubId) => ({ url: CLUB_ENDPOINTS.joinFlow(clubId) }),
      providesTags: (_result, _error, clubId) => [{ type: 'Club', id: clubId }],
    }),

    updateClubJoinFlow: build.mutation<
      { joinFlow: ClubJoinFlow },
      { clubId: string; data: UpdateClubJoinFlowInput }
    >({
      query: ({ clubId, data }) => ({
        url: CLUB_ENDPOINTS.joinFlow(clubId),
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (_result, _error, { clubId }) => [
        { type: 'Club', id: clubId },
      ],
    }),

    getClubRoles: build.query<{ roles: ClubRole[] }, string>({
      query: (clubId) => ({ url: CLUB_ENDPOINTS.roles(clubId) }),
      providesTags: (_result, _error, clubId) => [{ type: 'Club', id: clubId }],
    }),

    getClubPermissions: build.query<{ permissions: ClubPermission[] }, string>({
      query: (clubId) => ({ url: CLUB_ENDPOINTS.permissions(clubId) }),
    }),

    createClubRole: build.mutation<
      { role: ClubRole },
      { clubId: string; data: CreateClubRoleInput }
    >({
      query: ({ clubId, data }) => ({
        url: CLUB_ENDPOINTS.roles(clubId),
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (_result, _error, { clubId }) => [
        { type: 'Club', id: clubId },
      ],
    }),

    updateClubRole: build.mutation<
      { role: ClubRole },
      { clubId: string; roleId: string; data: UpdateClubRoleInput }
    >({
      query: ({ clubId, roleId, data }) => ({
        url: CLUB_ENDPOINTS.role(clubId, roleId),
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (_result, _error, { clubId }) => [
        { type: 'Club', id: clubId },
      ],
    }),

    deleteClubRole: build.mutation<void, { clubId: string; roleId: string }>({
      query: ({ clubId, roleId }) => ({
        url: CLUB_ENDPOINTS.role(clubId, roleId),
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, { clubId }) => [
        { type: 'Club', id: clubId },
      ],
    }),

    assignClubMemberRole: build.mutation<
      { member: unknown },
      { clubId: string; userId: string; roleId: string | null }
    >({
      query: ({ clubId, userId, roleId }) => ({
        url: CLUB_ENDPOINTS.assignMemberRole(clubId, userId),
        method: 'POST',
        body: { roleId },
      }),
      invalidatesTags: (_result, _error, { clubId }) => [
        { type: 'ClubMember', id: clubId },
        { type: 'Club', id: clubId },
      ],
    }),

    moderateClubMember: build.mutation<
      unknown,
      { clubId: string; userId: string; data: ModerateMemberInput }
    >({
      query: ({ clubId, userId, data }) => ({
        url: CLUB_ENDPOINTS.moderateMember(clubId, userId),
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (_result, _error, { clubId }) => [
        { type: 'ClubMember', id: clubId },
        { type: 'Club', id: clubId },
      ],
    }),
  }),
})

export const {
  useGetMyClubsQuery,
  useDiscoverClubsQuery,
  useGetClubQuery,
  useGetClubMembersQuery,
  useGetClubRidesQuery,
  useGetClubAnalyticsQuery,
  useGetPendingRequestsQuery,
  useUpdateMemberRoleMutation,
  useRemoveMemberMutation,
  useCreateClubMutation,
  useUpdateClubMutation,
  useDeleteClubMutation,
  useJoinClubMutation,
  useLeaveClubMutation,
  useApproveRequestMutation,
  useRejectRequestMutation,
  useGetClubJoinFlowQuery,
  useUpdateClubJoinFlowMutation,
  useGetClubRolesQuery,
  useGetClubPermissionsQuery,
  useCreateClubRoleMutation,
  useUpdateClubRoleMutation,
  useDeleteClubRoleMutation,
  useAssignClubMemberRoleMutation,
  useModerateClubMemberMutation,
} = clubsApiSlice
