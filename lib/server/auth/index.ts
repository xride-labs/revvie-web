import { authClient, resolveAuthCallbackURL } from '@/lib/auth-client'
import { apiAuthenticated } from '../base'

// ============ Types ============
export interface AuthUser {
  id: string
  email: string
  name: string
  image?: string | null
  emailVerified?: boolean
  createdAt?: Date
  updatedAt?: Date
}

export interface AuthSession {
  user: AuthUser
  session?: {
    id: string
    token?: string | null
    expiresAt?: Date
  }
  token?: string | null
}

export interface RegisterData {
  email: string
  password: string
  name: string
}

export interface LoginData {
  email: string
  password: string
}

// ============ Auth API ============

/**
 * Register a new user via Better Auth
 */
export async function register(data: RegisterData): Promise<AuthSession | null> {
  const result = await authClient.signUp.email({
    email: data.email,
    password: data.password,
    name: data.name,
  })

  if (result.error) {
    throw new Error(result.error.message || 'Registration failed')
  }

  return result.data as AuthSession | null
}

/**
 * Login with email and password via Better Auth
 */
export async function login(data: LoginData): Promise<AuthSession | null> {
  const result = await authClient.signIn.email({
    email: data.email,
    password: data.password,
  })

  if (result.error) {
    throw new Error(result.error.message || 'Login failed')
  }

  return result.data as AuthSession | null
}

/**
 * Login with Google OAuth
 */
export async function loginWithGoogle(callbackURL = '/home'): Promise<void> {
  await authClient.signIn.social({
    provider: 'google',
    callbackURL: resolveAuthCallbackURL(callbackURL),
  })
}

/**
 * Logout the current user
 */
export async function logout(): Promise<void> {
  await authClient.signOut()
}

/**
 * Get the current session
 */
export async function getSession(): Promise<AuthSession | null> {
  const result = await authClient.getSession()
  return result.data as AuthSession | null
}

/**
 * Request password reset email
 */
export async function forgotPassword(email: string): Promise<{ message: string }> {
  return apiAuthenticated.post<{ message: string }>('/auth/request-password-reset', {
    email,
    redirectTo: resolveAuthCallbackURL('/reset-password'),
  })
}

/**
 * Reset password with token
 */
export async function resetPassword(data: {
  token: string
  password: string
}): Promise<{ message: string }> {
  return apiAuthenticated.post<{ message: string }>('/auth/reset-password', data)
}

/**
 * Verify email with token
 */
export async function verifyEmail(
  email: string,
  token: string,
): Promise<{ message: string }> {
  return apiAuthenticated.post<{ message: string }>('/account/verify-email', {
    email,
    token,
  })
}

/**
 * Send OTP to phone number
 */
export async function sendOtp(phone: string): Promise<{ expiresAt: string }> {
  return apiAuthenticated.post<{ expiresAt: string }>('/auth/send-otp', {
    phone,
  })
}

/**
 * Verify OTP
 */
export async function verifyOtp(
  phone: string,
  otp: string,
): Promise<{ verified: boolean }> {
  return apiAuthenticated.post<{ verified: boolean }>('/auth/verify-otp', {
    phone,
    otp,
  })
}

function getAuthBase(): string {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
  return apiUrl.replace(/\/+$/, '').replace(/\/api\/?$/, '') + '/api/auth'
}

/**
 * Send a sign-in OTP to an email address via Better Auth emailOTP plugin
 */
export async function sendEmailOtp(email: string): Promise<void> {
  const res = await fetch(`${getAuthBase()}/email-otp/send-verification-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ email }),
  })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.message || 'Failed to send code')
  }
}

/**
 * Sign in with an email OTP code via Better Auth emailOTP plugin
 */
export async function signInWithEmailOtp(email: string, otp: string): Promise<void> {
  const res = await fetch(`${getAuthBase()}/sign-in/email-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ email, otp }),
  })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.message || 'Invalid or expired code')
  }
}

// Export all as authApi object for convenience
export const authApi = {
  register,
  login,
  loginWithGoogle,
  logout,
  getSession,
  forgotPassword,
  resetPassword,
  verifyEmail,
  sendOtp,
  verifyOtp,
  sendEmailOtp,
  signInWithEmailOtp,
}
