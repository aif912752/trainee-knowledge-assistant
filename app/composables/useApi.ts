import { toast } from 'vue-sonner'
import { getErrorMessage } from '../utils/error-handler'

/**
 * Unified API fetch function
 * Wraps Nuxt's $fetch with integrated error handling
 *
 * @example
 * const response = await apiFetch<LoginResult>('/api/auth/login', {
 *   method: 'POST',
 *   body: { username, password }
 * })
 */
export async function apiFetch<T>(url: string, options: any = {}): Promise<T> {
  try {
    const response = await $fetch(url, {
      ...options,
    })
    return response as T
  } catch (error: any) {
    // Extract user-friendly message
    const message = getErrorMessage(error)

    // Log for debugging
    console.error(`[API Error] ${url}:`, error)

    // Globally handle specific status codes (e.g., redirect to login on 401)
    if (error.statusCode === 401 && !url.includes('/api/auth/login')) {
      toast.error('เซสชันหมดอายุ', { description: 'กรุณาเข้าสู่ระบบใหม่' })
      await navigateTo('/login')
    }

    // Re-throw so the caller can handle local state (like isLoading),
    // but the error object now has a processed message
    throw {
      ...error,
      friendlyMessage: message
    }
  }
}

/**
 * API client object with HTTP methods
 * Auto-imported by Nuxt
 */
export const api = {
  get: <T>(url: string, options: any = {}) => apiFetch<T>(url, { ...options, method: 'GET' }),
  post: <T>(url: string, body?: any, options: any = {}) => apiFetch<T>(url, { ...options, method: 'POST', body }),
  put: <T>(url: string, body?: any, options: any = {}) => apiFetch<T>(url, { ...options, method: 'PUT', body }),
  delete: <T>(url: string, options: any = {}) => apiFetch<T>(url, { ...options, method: 'DELETE' }),
}
