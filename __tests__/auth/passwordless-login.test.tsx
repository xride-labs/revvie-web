import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import LoginPage from '@/app/(auth)/login/page'
import { AdminLoginView } from '@/app/admin/_components/admin-login-view'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}))
vi.mock('@/features/user/api', () => ({
  useLazyGetMyProfileQuery: () => [vi.fn()],
}))
vi.mock('@/hooks/use-auth-error-toast', () => ({ useAuthErrorToast: () => undefined }))
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ success: vi.fn(), error: vi.fn(), loading: vi.fn(), dismiss: vi.fn() }),
}))
vi.mock('@/lib/auth-client', () => ({
  signIn: { social: vi.fn() },
  resolveAuthCallbackURL: (path: string) => path,
}))
vi.mock('@/lib/server/auth', () => ({
  sendEmailOtp: vi.fn(),
  signInWithEmailOtp: vi.fn(),
}))

describe('web sign-in', () => {
  it('does not render password mode, signup, or reset links', () => {
    const { container } = render(<LoginPage />)

    expect(screen.getByRole('button', { name: /send code/i })).toBeTruthy()
    expect(screen.getByRole('button', { name: /google/i })).toBeTruthy()
    expect(screen.queryByText(/password/i)).toBeNull()
    expect(screen.queryByText(/sign up/i)).toBeNull()
    expect(container.querySelector('input[type="password"]')).toBeNull()
    for (const path of ['/signup', '/brand-register', '/forgot-password', '/reset-password']) {
      expect(container.querySelector(`a[href="${path}"]`)).toBeNull()
    }
  })

  it('offers only Google Workspace or an email code to administrators', () => {
    const { container } = render(<AdminLoginView />)

    expect(screen.getByRole('button', { name: /google workspace/i })).toBeTruthy()
    expect(screen.getByRole('button', { name: /send administrative code/i })).toBeTruthy()
    expect(screen.queryByText(/password/i)).toBeNull()
    expect(container.querySelector('input[type="password"]')).toBeNull()
  })
})
