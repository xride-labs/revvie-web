import 'server-only'
import { z } from 'zod'

import { authorize } from '@/core/auth/session'
import { gateway } from '@/core/http/gateway'

import { BUSINESS_ENDPOINTS } from './endpoints'
import {
  adCampaignSchema,
  billingStatusSchema,
  businessAnalyticsSchema,
  businessProfileSchema,
  discountSchema,
  myBusinessesResponseSchema,
} from './schemas'

export async function getMyBusinesses() {
  const { cookie } = await authorize()

  return gateway.get({
    path: BUSINESS_ENDPOINTS.mine,
    cookie,
    schema: myBusinessesResponseSchema,
  })
}

export async function getBusiness(businessId: string) {
  const { cookie } = await authorize()

  return gateway.get({
    path: BUSINESS_ENDPOINTS.detail(businessId),
    cookie,
    schema: businessProfileSchema,
  })
}

export async function getCampaigns(businessId: string) {
  const { cookie } = await authorize()

  return gateway.get({
    path: BUSINESS_ENDPOINTS.campaigns(businessId),
    cookie,
    schema: z.array(adCampaignSchema),
  })
}

export async function getDiscounts(businessId: string) {
  const { cookie } = await authorize()

  return gateway.get({
    path: BUSINESS_ENDPOINTS.discounts(businessId),
    cookie,
    schema: z.array(discountSchema),
  })
}

export async function getBusinessAnalytics(businessId: string) {
  const { cookie } = await authorize()

  return gateway.get({
    path: BUSINESS_ENDPOINTS.analytics(businessId),
    cookie,
    schema: businessAnalyticsSchema,
  })
}

export async function getBillingStatus(businessId: string) {
  const { cookie } = await authorize()

  return gateway.get({
    path: BUSINESS_ENDPOINTS.billingStatus(businessId),
    cookie,
    schema: billingStatusSchema,
  })
}
