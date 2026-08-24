import { businessApi } from '@/core/store/api/services'
import type {
  AdCampaign,
  BrandProduct,
  BrandTeamMember,
  BusinessProfile,
  Discount,
  ServiceListing,
} from '@/entities/business/model'

import { BUSINESS_ENDPOINTS } from './endpoints'
import type {
  BillingStatus,
  BusinessAnalytics,
  CreateBrandProductInput,
  CreateBusinessInput,
  CreateCampaignInput,
  CreateDiscountInput,
  CreateServiceInput,
  InviteTeamMemberInput,
  MyBusinessesResponse,
  UpdateBrandProductInput,
  UpdateBusinessInput,
  UpdateCampaignInput,
  UpdateDiscountInput,
  UpdateServiceInput,
  UpdateTeamMemberRoleInput,
} from './schemas'

export const businessApiSlice = businessApi.injectEndpoints({
  endpoints: (build) => ({
    getMyBusinesses: build.query<MyBusinessesResponse, void>({
      query: () => ({ url: BUSINESS_ENDPOINTS.mine }),
      providesTags: [{ type: 'BusinessList', id: 'MINE' }],
    }),

    getBusiness: build.query<BusinessProfile, string>({
      query: (id) => ({ url: BUSINESS_ENDPOINTS.detail(id) }),
      providesTags: (_r, _e, id) => [{ type: 'Business', id }],
    }),

    createBusiness: build.mutation<BusinessProfile, CreateBusinessInput>({
      query: (body) => ({ url: BUSINESS_ENDPOINTS.list, method: 'POST', body }),
      invalidatesTags: [{ type: 'BusinessList', id: 'MINE' }],
    }),

    updateBusiness: build.mutation<
      BusinessProfile,
      { id: string; data: UpdateBusinessInput }
    >({
      query: ({ id, data }) => ({
        url: BUSINESS_ENDPOINTS.detail(id),
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (_r, _e, { id }) => [
        { type: 'Business', id },
        { type: 'BusinessList', id: 'MINE' },
      ],
    }),

    submitBusiness: build.mutation<BusinessProfile, string>({
      query: (id) => ({ url: BUSINESS_ENDPOINTS.submit(id), method: 'POST' }),
      invalidatesTags: (_r, _e, id) => [
        { type: 'Business', id },
        { type: 'BusinessList', id: 'MINE' },
      ],
    }),

    getCampaigns: build.query<AdCampaign[], string>({
      query: (businessId) => ({ url: BUSINESS_ENDPOINTS.campaigns(businessId) }),
      providesTags: (_r, _e, businessId) => [{ type: 'Campaign', id: businessId }],
    }),

    createCampaign: build.mutation<
      AdCampaign,
      { businessId: string; data: CreateCampaignInput }
    >({
      query: ({ businessId, data }) => ({
        url: BUSINESS_ENDPOINTS.campaigns(businessId),
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (_r, _e, { businessId }) => [{ type: 'Campaign', id: businessId }],
    }),

    updateCampaign: build.mutation<
      AdCampaign,
      { businessId: string; campaignId: string; data: UpdateCampaignInput }
    >({
      query: ({ businessId, campaignId, data }) => ({
        url: BUSINESS_ENDPOINTS.campaign(businessId, campaignId),
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (_r, _e, { businessId }) => [{ type: 'Campaign', id: businessId }],
    }),

    deleteCampaign: build.mutation<void, { businessId: string; campaignId: string }>({
      query: ({ businessId, campaignId }) => ({
        url: BUSINESS_ENDPOINTS.campaign(businessId, campaignId),
        method: 'DELETE',
      }),
      invalidatesTags: (_r, _e, { businessId }) => [{ type: 'Campaign', id: businessId }],
    }),

    getDiscounts: build.query<Discount[], string>({
      query: (businessId) => ({ url: BUSINESS_ENDPOINTS.discounts(businessId) }),
      providesTags: (_r, _e, businessId) => [{ type: 'Discount', id: businessId }],
    }),

    createDiscount: build.mutation<
      Discount,
      { businessId: string; data: CreateDiscountInput }
    >({
      query: ({ businessId, data }) => ({
        url: BUSINESS_ENDPOINTS.discounts(businessId),
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (_r, _e, { businessId }) => [{ type: 'Discount', id: businessId }],
    }),

    updateDiscount: build.mutation<
      Discount,
      { businessId: string; discountId: string; data: UpdateDiscountInput }
    >({
      query: ({ businessId, discountId, data }) => ({
        url: BUSINESS_ENDPOINTS.discount(businessId, discountId),
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (_r, _e, { businessId }) => [{ type: 'Discount', id: businessId }],
    }),

    deleteDiscount: build.mutation<void, { businessId: string; discountId: string }>({
      query: ({ businessId, discountId }) => ({
        url: BUSINESS_ENDPOINTS.discount(businessId, discountId),
        method: 'DELETE',
      }),
      invalidatesTags: (_r, _e, { businessId }) => [{ type: 'Discount', id: businessId }],
    }),

    getTeamMembers: build.query<BrandTeamMember[], string>({
      query: (businessId) => ({ url: BUSINESS_ENDPOINTS.members(businessId) }),
      providesTags: (_r, _e, businessId) => [{ type: 'Member', id: businessId }],
    }),

    inviteTeamMember: build.mutation<
      BrandTeamMember,
      { businessId: string; data: InviteTeamMemberInput }
    >({
      query: ({ businessId, data }) => ({
        url: BUSINESS_ENDPOINTS.members(businessId),
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (_r, _e, { businessId }) => [{ type: 'Member', id: businessId }],
    }),

    updateTeamMemberRole: build.mutation<
      BrandTeamMember,
      { businessId: string; userId: string; data: UpdateTeamMemberRoleInput }
    >({
      query: ({ businessId, userId, data }) => ({
        url: BUSINESS_ENDPOINTS.memberRole(businessId, userId),
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (_r, _e, { businessId }) => [{ type: 'Member', id: businessId }],
    }),

    removeTeamMember: build.mutation<void, { businessId: string; userId: string }>({
      query: ({ businessId, userId }) => ({
        url: BUSINESS_ENDPOINTS.member(businessId, userId),
        method: 'DELETE',
      }),
      invalidatesTags: (_r, _e, { businessId }) => [{ type: 'Member', id: businessId }],
    }),

    getServices: build.query<ServiceListing[], string>({
      query: (businessId) => ({ url: BUSINESS_ENDPOINTS.services(businessId) }),
      providesTags: (_r, _e, businessId) => [{ type: 'Service', id: businessId }],
    }),

    createService: build.mutation<
      ServiceListing,
      { businessId: string; data: CreateServiceInput }
    >({
      query: ({ businessId, data }) => ({
        url: BUSINESS_ENDPOINTS.services(businessId),
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (_r, _e, { businessId }) => [{ type: 'Service', id: businessId }],
    }),

    updateService: build.mutation<
      ServiceListing,
      { businessId: string; serviceId: string; data: UpdateServiceInput }
    >({
      query: ({ businessId, serviceId, data }) => ({
        url: BUSINESS_ENDPOINTS.service(businessId, serviceId),
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (_r, _e, { businessId }) => [{ type: 'Service', id: businessId }],
    }),

    deleteService: build.mutation<void, { businessId: string; serviceId: string }>({
      query: ({ businessId, serviceId }) => ({
        url: BUSINESS_ENDPOINTS.service(businessId, serviceId),
        method: 'DELETE',
      }),
      invalidatesTags: (_r, _e, { businessId }) => [{ type: 'Service', id: businessId }],
    }),

    getBrandProducts: build.query<BrandProduct[], string>({
      query: (businessId) => ({ url: BUSINESS_ENDPOINTS.products(businessId) }),
      providesTags: (_r, _e, businessId) => [{ type: 'Product', id: businessId }],
    }),

    createBrandProduct: build.mutation<
      BrandProduct,
      { businessId: string; data: CreateBrandProductInput }
    >({
      query: ({ businessId, data }) => ({
        url: BUSINESS_ENDPOINTS.products(businessId),
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (_r, _e, { businessId }) => [{ type: 'Product', id: businessId }],
    }),

    updateBrandProduct: build.mutation<
      BrandProduct,
      { businessId: string; productId: string; data: UpdateBrandProductInput }
    >({
      query: ({ businessId, productId, data }) => ({
        url: BUSINESS_ENDPOINTS.product(businessId, productId),
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (_r, _e, { businessId }) => [{ type: 'Product', id: businessId }],
    }),

    deleteBrandProduct: build.mutation<void, { businessId: string; productId: string }>({
      query: ({ businessId, productId }) => ({
        url: BUSINESS_ENDPOINTS.product(businessId, productId),
        method: 'DELETE',
      }),
      invalidatesTags: (_r, _e, { businessId }) => [{ type: 'Product', id: businessId }],
    }),

    getBusinessAnalytics: build.query<BusinessAnalytics, string>({
      query: (businessId) => ({ url: BUSINESS_ENDPOINTS.analytics(businessId) }),
      providesTags: (_r, _e, businessId) => [{ type: 'Business', id: businessId }],
    }),

    getBillingStatus: build.query<BillingStatus, string>({
      query: (businessId) => ({ url: BUSINESS_ENDPOINTS.billingStatus(businessId) }),
      providesTags: (_r, _e, businessId) => [{ type: 'Billing', id: businessId }],
    }),

    createBillingCheckout: build.mutation<
      { checkoutUrl: string },
      { businessId: string }
    >({
      query: ({ businessId }) => ({
        url: BUSINESS_ENDPOINTS.billingCheckout,
        method: 'POST',
        body: { businessId },
      }),
    }),
  }),
})

export const {
  useGetMyBusinessesQuery,
  useGetBusinessQuery,
  useCreateBusinessMutation,
  useUpdateBusinessMutation,
  useSubmitBusinessMutation,
  useGetCampaignsQuery,
  useCreateCampaignMutation,
  useUpdateCampaignMutation,
  useDeleteCampaignMutation,
  useGetDiscountsQuery,
  useCreateDiscountMutation,
  useUpdateDiscountMutation,
  useDeleteDiscountMutation,
  useGetTeamMembersQuery,
  useInviteTeamMemberMutation,
  useUpdateTeamMemberRoleMutation,
  useRemoveTeamMemberMutation,
  useGetServicesQuery,
  useCreateServiceMutation,
  useUpdateServiceMutation,
  useDeleteServiceMutation,
  useGetBrandProductsQuery,
  useCreateBrandProductMutation,
  useUpdateBrandProductMutation,
  useDeleteBrandProductMutation,
  useGetBusinessAnalyticsQuery,
  useGetBillingStatusQuery,
  useCreateBillingCheckoutMutation,
} = businessApiSlice
