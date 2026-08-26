import 'server-only'

import { authorize } from '@/core/auth/session'
import { gateway } from '@/core/http/gateway'
import { EVENT_ENDPOINTS } from './endpoints'

export async function getEvents(params?: Record<string, any>) {
  const { cookie } = await authorize()

  return gateway.get({
    path: EVENT_ENDPOINTS.list,
    query: params,
    cookie,
  })
}

export async function getEvent(eventId: string) {
  const { cookie } = await authorize()

  return gateway.get({
    path: EVENT_ENDPOINTS.detail(eventId),
    cookie,
  })
}
