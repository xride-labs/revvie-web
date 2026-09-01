import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios'
import type { ApiErrorCode } from '@/types'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

/**
 * Backend API response format
 */
export interface ApiResponse<T> {
  success: boolean
  message: string
  data?: T
  error?: {
    code: ApiErrorCode | string
    details?: unknown
  }
}

/**
 * Paginated response format
 */
export interface PaginatedResponse<T> {
  items: T[]
  hasMore: boolean
  total?: number
  page?: number
  pages?: number
}

/**
 * API Error class with additional context
 */
export class ApiError extends Error {
  code: ApiErrorCode | string
  status: number
  details?: unknown

  constructor(message: string, code: ApiErrorCode | string, status: number, details?: unknown) {
    super(message)
    this.name = 'ApiError'
    this.code = code
    this.status = status
    this.details = details
  }
}

/**
 * Create error handler for axios interceptors
 */
function createErrorHandler(
  onUnauthorized?: (error: AxiosError<ApiResponse<unknown>>) => void | Promise<void>,
) {
  return async (error: unknown) => {
    if (!axios.isAxiosError<ApiResponse<unknown>>(error)) {
      throw new ApiError('An unexpected error occurred', 'UNKNOWN_ERROR', 500)
    }

    // Handle 401 Unauthorized
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined' && onUnauthorized) {
        await onUnauthorized(error)
      }
    }

    // Handle network errors
    if (!error.response) {
      throw new ApiError(
        'Network error. Please check your connection.',
        'NETWORK_ERROR',
        0,
      )
    }

    // Extract error details from response
    const responseData = error.response.data
    const message =
      responseData?.message ||
      responseData?.error?.code ||
      error.message ||
      'An unexpected error occurred'
    const code = responseData?.error?.code || 'UNKNOWN_ERROR'
    const details = responseData?.error?.details

    throw new ApiError(message, code, error.response.status, details)
  }
}

/**
 * Create a typed API client wrapper
 */
export function createApiClient(axiosInstance: AxiosInstance) {
  return {
    get: async <T>(url: string, config = {}): Promise<T> => {
      const response = await axiosInstance.get<ApiResponse<T>>(url, config)
      return response.data.data as T
    },

    post: async <T>(url: string, data = {}, config = {}): Promise<T> => {
      const response = await axiosInstance.post<ApiResponse<T>>(url, data, config)
      return response.data.data as T
    },

    put: async <T>(url: string, data = {}, config = {}): Promise<T> => {
      const response = await axiosInstance.put<ApiResponse<T>>(url, data, config)
      return response.data.data as T
    },

    patch: async <T>(url: string, data = {}, config = {}): Promise<T> => {
      const response = await axiosInstance.patch<ApiResponse<T>>(url, data, config)
      return response.data.data as T
    },

    delete: async <T>(url: string, config = {}): Promise<T> => {
      const response = await axiosInstance.delete<ApiResponse<T>>(url, config)
      return response.data.data as T
    },

    /**
     * Raw request that returns the full response (for cases where you need headers, etc.)
     */
    raw: axiosInstance,
  }
}

export { API_URL, createErrorHandler }
export type { AxiosInstance, InternalAxiosRequestConfig }
