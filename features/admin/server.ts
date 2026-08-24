import 'server-only'

import { authorize } from '@/core/auth/session'
import { gateway } from '@/core/http/gateway'
import { ADMIN_ROLES } from '@/core/auth/roles'
import { adminStatsSchema, adminSettingsSchema, adminWeeklyActivitySchema } from '@/entities/admin/model'

import { ADMIN_ENDPOINTS } from './endpoints'
import {
  adminApprovalsResponseSchema,
  adminClubsResponseSchema,
  adminReportsResponseSchema,
  adminRidesResponseSchema,
  adminUsersResponseSchema,
  type UserFilters,
} from './schemas'

/**
 * Every function here requires an admin-tier role — `authorize(...ADMIN_ROLES)` throws
 * `ForbiddenError` otherwise, which the nearest `error.tsx` catches. This is the real
 * gate; `app/admin/layout.tsx`'s redirect is the UX layer on top of it.
 */

export async function getStats() {
  const { cookie } = await authorize(...ADMIN_ROLES)
  return gateway.get({ path: ADMIN_ENDPOINTS.stats, cookie, schema: adminStatsSchema })
}

export async function getWeeklyActivity(days = 7) {
  const { cookie } = await authorize(...ADMIN_ROLES)
  return gateway.get({
    path: ADMIN_ENDPOINTS.weeklyActivity,
    query: { days },
    cookie,
    schema: adminWeeklyActivitySchema,
  })
}

export async function getReports(params: { page?: number; status?: string } = {}) {
  const { cookie } = await authorize(...ADMIN_ROLES)
  return gateway.get({
    path: ADMIN_ENDPOINTS.reports,
    query: params,
    cookie,
    schema: adminReportsResponseSchema,
  })
}

export async function getUsers(filters: UserFilters = {}) {
  const { cookie } = await authorize(...ADMIN_ROLES)
  return gateway.get({
    path: ADMIN_ENDPOINTS.users,
    query: filters,
    cookie,
    schema: adminUsersResponseSchema,
  })
}

export async function getClubs(params: { page?: number; verified?: boolean; search?: string } = {}) {
  const { cookie } = await authorize(...ADMIN_ROLES)
  return gateway.get({
    path: ADMIN_ENDPOINTS.clubs,
    query: params,
    cookie,
    schema: adminClubsResponseSchema,
  })
}

export async function getRides(params: { page?: number; status?: string; search?: string } = {}) {
  const { cookie } = await authorize(...ADMIN_ROLES)
  return gateway.get({
    path: ADMIN_ENDPOINTS.rides,
    query: params,
    cookie,
    schema: adminRidesResponseSchema,
  })
}

export async function getApprovals() {
  const { cookie } = await authorize(...ADMIN_ROLES)
  return gateway.get({
    path: ADMIN_ENDPOINTS.approvals,
    cookie,
    schema: adminApprovalsResponseSchema,
  })
}

export async function getSettings() {
  const { cookie } = await authorize(...ADMIN_ROLES)
  return gateway.get({
    path: ADMIN_ENDPOINTS.settings,
    cookie,
    schema: adminSettingsSchema,
  })
}
