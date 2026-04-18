import { useCallback } from 'react'
import { useAuth } from '../context/AuthContext'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'

interface FetchOptions extends Omit<RequestInit, 'body'> {
  body?: unknown
}

interface ApiError {
  status: number
  message: string
  detail?: unknown
}

/**
 * Hook to make authenticated API calls.
 * Automatically adds base URL, Content-Type, and X-User-Role header.
 */
export function useApi() {
  const { user } = useAuth()

  const fetchApi = useCallback(
    async <T = unknown>(endpoint: string, options: FetchOptions = {}): Promise<T> => {
      const { body, headers: customHeaders, ...restOptions } = options

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(customHeaders as Record<string, string>),
      }

      // Add role header for SENTINEL RBAC
      if (user) {
        headers['X-User-Role'] = user.role
        headers['X-User-Name'] = user.userName
      }

      const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`

      const response = await fetch(url, {
        ...restOptions,
        headers,
        body: body ? JSON.stringify(body) : undefined,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        const error: ApiError = {
          status: response.status,
          message: errorData.message || errorData.detail || response.statusText,
          detail: errorData,
        }
        throw error
      }

      // Handle empty responses
      const text = await response.text()
      if (!text) return undefined as T

      return JSON.parse(text) as T
    },
    [user]
  )

  return { fetchApi }
}
