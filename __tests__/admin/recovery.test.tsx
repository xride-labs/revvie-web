import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import RecoveryAdminPage from '@/app/admin/recovery/page'
import { adminRecoveryDetailSchema } from '@/entities/admin/model'

const auth = vi.hoisted(() => ({ roles: ['ADMIN'] as string[] }))

const pending = {
  id: 'rec_1',
  status: 'PENDING_REVIEW',
  destinationChannel: 'EMAIL',
  destinationValue: 'new@example.com',
  explanation: 'Lost my phone and old inbox',
  reviewerNote: null,
  retireFactors: [],
  approvedAt: null,
  releaseAt: null,
  completedAt: null,
  cancelledAt: null,
  rejectedAt: null,
  expiresAt: '2026-11-01T00:00:00.000Z',
  lastError: null,
  createdAt: '2026-10-11T00:00:00.000Z',
  user: { id: 'u1', name: 'Rider One', username: 'rider1' },
  reviewer: null,
}

vi.mock('@/lib/use-auth', async () => {
  const actual = await vi.importActual<typeof import('@/lib/use-auth')>('@/lib/use-auth')
  return { ...actual, useAuth: () => ({ user: { roles: auth.roles } }) }
})
vi.mock('@/features/admin/api', () => {
  const mutation = () => [vi.fn(), { isLoading: false }]
  return {
    useGetRecoveriesQuery: () => ({
      data: [pending],
      isLoading: false,
      isFetching: false,
      error: undefined,
      refetch: vi.fn(),
    }),
    useGetRecoveryQuery: () => ({ data: undefined, isFetching: false }),
    useApproveRecoveryMutation: mutation,
    useRejectRecoveryMutation: mutation,
    useRequestRecoveryInfoMutation: mutation,
  }
})
vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }))

describe('admin recovery queue', () => {
  beforeEach(() => {
    auth.roles = ['ADMIN']
  })

  it('renders recovery approval for an authorized reviewer', async () => {
    render(<RecoveryAdminPage />)

    expect(await screen.findByRole('button', { name: /approve/i })).toBeTruthy()
    expect(screen.getByRole('button', { name: /reject/i })).toBeTruthy()
    expect(screen.getByText('new@example.com')).toBeTruthy()
    expect(screen.getByText(/pending review/i)).toBeTruthy()
  })

  it('hides approve and reject from co-admins but keeps request-info', async () => {
    auth.roles = ['CO_ADMIN']
    render(<RecoveryAdminPage />)

    expect(await screen.findByRole('button', { name: /request info/i })).toBeTruthy()
    expect(screen.queryByRole('button', { name: /approve/i })).toBeNull()
    expect(screen.queryByRole('button', { name: /reject/i })).toBeNull()
  })

  it('drops OTPs, receipt tokens, and previous factors from parsed responses', () => {
    const parsed = adminRecoveryDetailSchema.parse({
      ...pending,
      otp: '123456',
      receiptToken: 'secret-receipt',
      previousEmail: 'old@example.com',
      events: [{ id: 'e1', type: 'REQUESTED', actorUserId: null, createdAt: pending.createdAt }],
    })

    expect(JSON.stringify(parsed)).not.toMatch(/123456|secret-receipt|old@example.com/)
    expect(parsed.events).toHaveLength(1)
  })
})
