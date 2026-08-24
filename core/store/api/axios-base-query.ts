import axios, { type AxiosError, type AxiosRequestConfig } from 'axios'
import type { BaseQueryFn } from '@reduxjs/toolkit/query'

import type { SerializedGatewayError } from '@/core/http/errors'

/**
 * RTK Query transport.
 *
 * Client code calls **our own origin** (`/api/gw/...`), never the Revvie API directly.
 * The session cookie rides along because the request is same-origin, and the BFF route
 * attaches the caller's IP and forwards upstream. That is what keeps the backend origin
 * out of the browser and removes CORS from the request path entirely.
 */

export interface AxiosBaseQueryArgs {
  url: string
  method?: AxiosRequestConfig['method']
  body?: unknown
  params?: Record<string, string | number | boolean | undefined>
  headers?: Record<string, string>
  signal?: AbortSignal
}

const client = axios.create({
  baseURL: '/api/gw',
  // Same-origin, so the cookie is sent by default; explicit for clarity.
  withCredentials: true,
  headers: { Accept: 'application/json' },
})

interface BackendEnvelope {
  success: boolean
  message?: string
  data?: unknown
  error?: { code?: string; details?: unknown }
}

export function axiosBaseQuery(): BaseQueryFn<
  AxiosBaseQueryArgs | string,
  unknown,
  SerializedGatewayError
> {
  return async (args, api) => {
    const config: AxiosBaseQueryArgs = typeof args === 'string' ? { url: args } : args

    try {
      const response = await client.request<BackendEnvelope>({
        url: `/${config.url.replace(/^\//, '')}`,
        method: config.method ?? 'GET',
        ...(config.body !== undefined ? { data: config.body } : {}),
        params: config.params,
        headers: config.headers,
        signal: config.signal ?? api.signal,
      })

      // Unwrap the backend's { success, message, data } envelope so endpoints deal in
      // domain shapes, not transport shapes.
      return { data: response.data?.data ?? response.data }
    } catch (caught) {
      const error = caught as AxiosError<BackendEnvelope>
      const payload = error.response?.data

      return {
        error: {
          status: error.response?.status ?? 0,
          code: payload?.error?.code ?? error.code ?? 'network_error',
          message: payload?.message ?? 'Could not reach the server. Please try again.',
        },
      }
    }
  }
}
