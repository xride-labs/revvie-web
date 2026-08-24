import { adminApi } from '@/core/store/api/services'
import type {
  AdminSettings,
  AdminStats,
  AdminUserDetails,
  AdminUserRecord,
  AdminWeeklyActivity,
} from '@/entities/admin/model'

import { ADMIN_ENDPOINTS } from './endpoints'
import type {
  AdminAdCampaignsResponse,
  AdminApprovalsResponse,
  AdminClubsResponse,
  AdminDiscountsResponse,
  AdminListingsResponse,
  AdminNotificationsResponse,
  AdminReportsResponse,
  AdminRidesResponse,
  AdminUsersResponse,
  BulkActionRequest,
  BulkActionResult,
  CreateAdminUserInput,
  PendingBusinessesResponse,
  UpdateAdminUserInput,
  UserFilters,
} from './schemas'

export const adminApiSlice = adminApi.injectEndpoints({
  endpoints: (build) => ({
    getStats: build.query<AdminStats, void>({
      query: () => ({ url: ADMIN_ENDPOINTS.stats }),
      providesTags: [{ type: 'AdminStats', id: 'DASHBOARD' }],
    }),

    getWeeklyActivity: build.query<AdminWeeklyActivity, number | void>({
      query: (days) => ({
        url: ADMIN_ENDPOINTS.weeklyActivity,
        params: { days: days ?? 7 },
      }),
      providesTags: [{ type: 'AdminStats', id: 'WEEKLY' }],
    }),

    getUsers: build.query<AdminUsersResponse, UserFilters | void>({
      query: (filters) => ({ url: ADMIN_ENDPOINTS.users, params: filters ?? {} }),
      providesTags: [{ type: 'AdminUser', id: 'LIST' }],
    }),

    getUserById: build.query<AdminUserDetails, string>({
      query: (userId) => ({ url: ADMIN_ENDPOINTS.user(userId) }),
      providesTags: (_r, _e, userId) => [{ type: 'AdminUser', id: userId }],
    }),

    createUser: build.mutation<AdminUserRecord, CreateAdminUserInput>({
      query: (body) => ({ url: ADMIN_ENDPOINTS.users, method: 'POST', body }),
      invalidatesTags: [{ type: 'AdminUser', id: 'LIST' }],
    }),

    updateUser: build.mutation<
      AdminUserRecord,
      { userId: string; data: UpdateAdminUserInput }
    >({
      query: ({ userId, data }) => ({
        url: ADMIN_ENDPOINTS.user(userId),
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (_r, _e, { userId }) => [
        { type: 'AdminUser', id: userId },
        { type: 'AdminUser', id: 'LIST' },
      ],
    }),

    updateUserRole: build.mutation<void, { userId: string; role: string }>({
      query: ({ userId, role }) => ({
        url: ADMIN_ENDPOINTS.userRole(userId),
        method: 'PATCH',
        body: { role },
      }),
      invalidatesTags: (_r, _e, { userId }) => [
        { type: 'AdminUser', id: userId },
        { type: 'AdminUser', id: 'LIST' },
      ],
    }),

    updateUserStatus: build.mutation<void, { userId: string; status: string }>({
      query: ({ userId, status }) => ({
        url: ADMIN_ENDPOINTS.userStatus(userId),
        method: 'PATCH',
        body: { status },
      }),
      invalidatesTags: (_r, _e, { userId }) => [
        { type: 'AdminUser', id: userId },
        { type: 'AdminUser', id: 'LIST' },
      ],
    }),

    deleteUser: build.mutation<void, string>({
      query: (userId) => ({ url: ADMIN_ENDPOINTS.user(userId), method: 'DELETE' }),
      invalidatesTags: [{ type: 'AdminUser', id: 'LIST' }],
    }),

    getRides: build.query<
      AdminRidesResponse,
      { page?: number; status?: string; search?: string } | void
    >({
      query: (filters) => ({ url: ADMIN_ENDPOINTS.rides, params: filters ?? {} }),
      providesTags: [{ type: 'AdminRide', id: 'LIST' }],
    }),

    updateRideStatus: build.mutation<void, { rideId: string; status: string }>({
      query: ({ rideId, status }) => ({
        url: ADMIN_ENDPOINTS.rideStatus(rideId),
        method: 'PATCH',
        body: { status },
      }),
      invalidatesTags: [{ type: 'AdminRide', id: 'LIST' }],
    }),

    deleteRide: build.mutation<void, string>({
      query: (rideId) => ({ url: ADMIN_ENDPOINTS.ride(rideId), method: 'DELETE' }),
      invalidatesTags: [{ type: 'AdminRide', id: 'LIST' }],
    }),

    getClubs: build.query<
      AdminClubsResponse,
      { page?: number; verified?: boolean; search?: string } | void
    >({
      query: (filters) => ({ url: ADMIN_ENDPOINTS.clubs, params: filters ?? {} }),
      providesTags: [{ type: 'AdminClub', id: 'LIST' }],
    }),

    verifyClub: build.mutation<void, string>({
      query: (clubId) => ({ url: ADMIN_ENDPOINTS.clubVerify(clubId), method: 'PATCH' }),
      invalidatesTags: [{ type: 'AdminClub', id: 'LIST' }, { type: 'AdminApproval', id: 'ALL' }],
    }),

    deleteClub: build.mutation<void, string>({
      query: (clubId) => ({ url: ADMIN_ENDPOINTS.club(clubId), method: 'DELETE' }),
      invalidatesTags: [{ type: 'AdminClub', id: 'LIST' }],
    }),

    getListings: build.query<
      AdminListingsResponse,
      { page?: number; status?: string; search?: string } | void
    >({
      query: (filters) => ({ url: ADMIN_ENDPOINTS.marketplace, params: filters ?? {} }),
      providesTags: [{ type: 'AdminListing', id: 'LIST' }],
    }),

    updateListingStatus: build.mutation<void, { listingId: string; status: string }>({
      query: ({ listingId, status }) => ({
        url: ADMIN_ENDPOINTS.listingStatus(listingId),
        method: 'PATCH',
        body: { status },
      }),
      invalidatesTags: [{ type: 'AdminListing', id: 'LIST' }],
    }),

    deleteListing: build.mutation<void, string>({
      query: (listingId) => ({ url: ADMIN_ENDPOINTS.listing(listingId), method: 'DELETE' }),
      invalidatesTags: [{ type: 'AdminListing', id: 'LIST' }],
    }),

    getReports: build.query<AdminReportsResponse, { page?: number; status?: string } | void>({
      query: (filters) => ({ url: ADMIN_ENDPOINTS.reports, params: filters ?? {} }),
      providesTags: [{ type: 'AdminReport', id: 'LIST' }],
    }),

    updateReport: build.mutation<
      void,
      { reportId: string; data: { status: string; resolution?: string } }
    >({
      query: ({ reportId, data }) => ({
        url: ADMIN_ENDPOINTS.report(reportId),
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: [{ type: 'AdminReport', id: 'LIST' }],
    }),

    getNotifications: build.query<
      AdminNotificationsResponse,
      { page?: number; limit?: number; userId?: string; unreadOnly?: boolean; type?: string; search?: string } | void
    >({
      query: (filters) => ({ url: ADMIN_ENDPOINTS.notifications, params: filters ?? {} }),
      providesTags: [{ type: 'AdminNotification', id: 'LIST' }],
    }),

    getSettings: build.query<AdminSettings, void>({
      query: () => ({ url: ADMIN_ENDPOINTS.settings }),
      providesTags: [{ type: 'AdminStats', id: 'SETTINGS' }],
    }),

    updateSettings: build.mutation<AdminSettings, Partial<AdminSettings>>({
      query: (body) => ({ url: ADMIN_ENDPOINTS.settings, method: 'PATCH', body }),
      invalidatesTags: [{ type: 'AdminStats', id: 'SETTINGS' }],
    }),

    getApprovals: build.query<AdminApprovalsResponse, void>({
      query: () => ({ url: ADMIN_ENDPOINTS.approvals }),
      providesTags: [{ type: 'AdminApproval', id: 'ALL' }],
    }),

    getBusinessSubmissions: build.query<PendingBusinessesResponse, void>({
      query: () => ({
        url: ADMIN_ENDPOINTS.businesses,
        params: { status: 'SUBMITTED', limit: 50 },
      }),
      providesTags: [{ type: 'AdminApproval', id: 'BUSINESSES' }],
    }),

    getAllBusinesses: build.query<
      PendingBusinessesResponse,
      { page?: number; limit?: number; status?: string; search?: string } | void
    >({
      query: (params) => ({ url: ADMIN_ENDPOINTS.businesses, params: params ?? {} }),
      providesTags: [{ type: 'AdminApproval', id: 'BUSINESSES' }],
    }),

    deleteBusiness: build.mutation<void, string>({
      query: (id) => ({ url: ADMIN_ENDPOINTS.business(id), method: 'DELETE' }),
      invalidatesTags: [{ type: 'AdminApproval', id: 'BUSINESSES' }],
    }),

    approveBusinessSubmission: build.mutation<void, string>({
      query: (businessId) => ({
        url: ADMIN_ENDPOINTS.business(businessId),
        method: 'PATCH',
        body: { verification: 'APPROVED' },
      }),
      invalidatesTags: [{ type: 'AdminApproval', id: 'BUSINESSES' }],
    }),

    rejectBusinessSubmission: build.mutation<void, { businessId: string; notes?: string }>({
      query: ({ businessId, notes }) => ({
        url: ADMIN_ENDPOINTS.business(businessId),
        method: 'PATCH',
        body: { verification: 'REJECTED', verificationNotes: notes ?? null },
      }),
      invalidatesTags: [{ type: 'AdminApproval', id: 'BUSINESSES' }],
    }),

    approveClubRequest: build.mutation<void, string>({
      query: (requestId) => ({
        url: ADMIN_ENDPOINTS.clubJoinRequestApprove(requestId),
        method: 'POST',
      }),
      invalidatesTags: [{ type: 'AdminApproval', id: 'ALL' }],
    }),

    rejectClubRequest: build.mutation<void, string>({
      query: (requestId) => ({
        url: ADMIN_ENDPOINTS.clubJoinRequestReject(requestId),
        method: 'POST',
      }),
      invalidatesTags: [{ type: 'AdminApproval', id: 'ALL' }],
    }),

    acceptRideParticipant: build.mutation<void, string>({
      query: (participantId) => ({
        url: ADMIN_ENDPOINTS.rideParticipantAccept(participantId),
        method: 'POST',
      }),
      invalidatesTags: [{ type: 'AdminApproval', id: 'ALL' }],
    }),

    declineRideParticipant: build.mutation<void, string>({
      query: (participantId) => ({
        url: ADMIN_ENDPOINTS.rideParticipantDecline(participantId),
        method: 'POST',
      }),
      invalidatesTags: [{ type: 'AdminApproval', id: 'ALL' }],
    }),

    getAdCampaigns: build.query<
      AdminAdCampaignsResponse,
      { status?: string; page?: number; limit?: number } | void
    >({
      query: (params) => ({ url: ADMIN_ENDPOINTS.adCampaigns, params: params ?? {} }),
      providesTags: [{ type: 'AdminApproval', id: 'AD_CAMPAIGNS' }],
    }),

    approveAdCampaign: build.mutation<void, { id: string; notes?: string }>({
      query: ({ id, notes }) => ({
        url: ADMIN_ENDPOINTS.adCampaignApprove(id),
        method: 'POST',
        body: { notes },
      }),
      invalidatesTags: [{ type: 'AdminApproval', id: 'AD_CAMPAIGNS' }],
    }),

    rejectAdCampaign: build.mutation<void, { id: string; notes?: string }>({
      query: ({ id, notes }) => ({
        url: ADMIN_ENDPOINTS.adCampaignReject(id),
        method: 'POST',
        body: { notes },
      }),
      invalidatesTags: [{ type: 'AdminApproval', id: 'AD_CAMPAIGNS' }],
    }),

    getAdminDiscounts: build.query<
      AdminDiscountsResponse,
      { page?: number; limit?: number } | void
    >({
      query: (params) => ({ url: ADMIN_ENDPOINTS.discounts, params: params ?? {} }),
      providesTags: [{ type: 'AdminApproval', id: 'DISCOUNTS' }],
    }),

    deleteAdminDiscount: build.mutation<void, string>({
      query: (id) => ({ url: ADMIN_ENDPOINTS.discount(id), method: 'DELETE' }),
      invalidatesTags: [{ type: 'AdminApproval', id: 'DISCOUNTS' }],
    }),

    bulkVerifyClubs: build.mutation<BulkActionResult, string[]>({
      query: (ids) => ({ url: ADMIN_ENDPOINTS.bulkVerifyClubs, method: 'POST', body: { ids } }),
      invalidatesTags: [{ type: 'AdminClub', id: 'LIST' }, { type: 'AdminApproval', id: 'ALL' }],
    }),

    bulkApproveClubRequests: build.mutation<BulkActionResult, string[]>({
      query: (ids) => ({
        url: ADMIN_ENDPOINTS.bulkApproveClubRequests,
        method: 'POST',
        body: { ids },
      }),
      invalidatesTags: [{ type: 'AdminApproval', id: 'ALL' }],
    }),

    bulkAcceptRideParticipants: build.mutation<BulkActionResult, string[]>({
      query: (ids) => ({
        url: ADMIN_ENDPOINTS.bulkAcceptRideParticipants,
        method: 'POST',
        body: { ids },
      }),
      invalidatesTags: [{ type: 'AdminApproval', id: 'ALL' }],
    }),

    bulkApproveBusinesses: build.mutation<BulkActionResult, string[]>({
      query: (ids) => ({
        url: ADMIN_ENDPOINTS.bulkApproveBusinesses,
        method: 'POST',
        body: { ids },
      }),
      invalidatesTags: [{ type: 'AdminApproval', id: 'BUSINESSES' }],
    }),

    bulkApproveAdCampaigns: build.mutation<BulkActionResult, string[]>({
      query: (ids) => ({
        url: ADMIN_ENDPOINTS.bulkApproveAdCampaigns,
        method: 'POST',
        body: { ids },
      }),
      invalidatesTags: [{ type: 'AdminApproval', id: 'AD_CAMPAIGNS' }],
    }),

    performBulkAction: build.mutation<BulkActionResult, BulkActionRequest>({
      query: (request) => ({ url: ADMIN_ENDPOINTS.bulkAction, method: 'POST', body: request }),
      invalidatesTags: [{ type: 'AdminApproval', id: 'ALL' }],
    }),

    performClubManagerBulkAction: build.mutation<BulkActionResult, BulkActionRequest>({
      query: (request) => ({
        url: ADMIN_ENDPOINTS.clubManagerBulkAction,
        method: 'POST',
        body: request,
      }),
    }),

    performBrandManagerBulkAction: build.mutation<BulkActionResult, BulkActionRequest>({
      query: (request) => ({
        url: ADMIN_ENDPOINTS.brandManagerBulkAction,
        method: 'POST',
        body: request,
      }),
    }),
  }),
})

export const {
  useGetStatsQuery,
  useGetWeeklyActivityQuery,
  useGetUsersQuery,
  useLazyGetUsersQuery,
  useGetUserByIdQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useUpdateUserRoleMutation,
  useUpdateUserStatusMutation,
  useDeleteUserMutation,
  useGetRidesQuery,
  useUpdateRideStatusMutation,
  useDeleteRideMutation,
  useGetClubsQuery,
  useVerifyClubMutation,
  useDeleteClubMutation,
  useGetListingsQuery,
  useUpdateListingStatusMutation,
  useDeleteListingMutation,
  useGetReportsQuery,
  useUpdateReportMutation,
  useGetNotificationsQuery,
  useGetSettingsQuery,
  useUpdateSettingsMutation,
  useGetApprovalsQuery,
  useGetBusinessSubmissionsQuery,
  useGetAllBusinessesQuery,
  useDeleteBusinessMutation,
  useApproveBusinessSubmissionMutation,
  useRejectBusinessSubmissionMutation,
  useApproveClubRequestMutation,
  useRejectClubRequestMutation,
  useAcceptRideParticipantMutation,
  useDeclineRideParticipantMutation,
  useGetAdCampaignsQuery,
  useApproveAdCampaignMutation,
  useRejectAdCampaignMutation,
  useGetAdminDiscountsQuery,
  useDeleteAdminDiscountMutation,
  useBulkVerifyClubsMutation,
  useBulkApproveClubRequestsMutation,
  useBulkAcceptRideParticipantsMutation,
  useBulkApproveBusinessesMutation,
  useBulkApproveAdCampaignsMutation,
  usePerformBulkActionMutation,
  usePerformClubManagerBulkActionMutation,
  usePerformBrandManagerBulkActionMutation,
} = adminApiSlice
