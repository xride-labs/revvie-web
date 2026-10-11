import { createAsyncThunk } from '@reduxjs/toolkit'
import { authApi, type AuthSession } from '@/lib/server/auth'

export const loginWithGoogle = createAsyncThunk(
  'auth/loginGoogle',
  async (callbackURL: string = '/home', { rejectWithValue }) => {
    try {
      await authApi.loginWithGoogle(callbackURL)
      return null
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Google login failed',
      )
    }
  },
)

export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await authApi.logout()
      return null
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Logout failed')
    }
  },
)

export const fetchSession = createAsyncThunk(
  'auth/fetchSession',
  async (_, { rejectWithValue }) => {
    try {
      const session = await authApi.getSession()
      return session
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Failed to fetch session',
      )
    }
  },
)

export const verifyEmailAction = createAsyncThunk(
  'auth/verifyEmail',
  async ({ email, token }: { email: string; token: string }, { rejectWithValue }) => {
    try {
      const response = await authApi.verifyEmail(email, token)
      return response
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Failed to verify email',
      )
    }
  },
)

export const sendOtpAction = createAsyncThunk(
  'auth/sendOtp',
  async (phone: string, { rejectWithValue }) => {
    try {
      const response = await authApi.sendOtp(phone)
      return response
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Failed to send OTP',
      )
    }
  },
)

export const verifyOtpAction = createAsyncThunk(
  'auth/verifyOtp',
  async ({ phone, otp }: { phone: string; otp: string }, { rejectWithValue }) => {
    try {
      const response = await authApi.verifyOtp(phone, otp)
      return response
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Failed to verify OTP',
      )
    }
  },
)

export type { AuthSession }
