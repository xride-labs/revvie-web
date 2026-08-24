import 'server-only'

import { authorize } from '@/core/auth/session'
import { gateway } from '@/core/http/gateway'

import { USER_ENDPOINTS } from './endpoints'
import { meResponseSchema, publicProfileResponseSchema } from './schemas'

export async function getMyProfile() {
  const { cookie } = await authorize()

  return gateway.get({
    path: USER_ENDPOINTS.me,
    cookie,
    schema: meResponseSchema,
  })
}

/** `userId` must be the user's id — see the note in endpoints.ts. */
export async function getPublicProfile(userId: string) {
  const { cookie } = await authorize()

  return gateway.get({
    path: USER_ENDPOINTS.publicProfile(userId),
    cookie,
    schema: publicProfileResponseSchema,
  })
}
