import { toast } from 'vue-sonner'
import { getErrorMessage } from '../utils/error-handler'

interface FetchOptions extends Omit<Parameters<typeof $fetch>[1], 'headers' | 'method' | 'body'> {
  headers?: Record<string, string>;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS' | 'TRACE' | 'CONNECT' | 'get' | 'post' | 'put' | 'delete' | 'patch' | 'head' | 'options' | 'trace';
  body?: any;
  query?: Record<string, string | number | boolean | undefined>;
}

export async function apiFetch<T>(url: string, options: FetchOptions = {}): Promise<T> {
  const headers: Record<string, string> = {
    ...options.headers,
  }

  try {
    const response = await $fetch(url, {
      ...options,
      headers,
    })
    return response as T
  } catch (error: unknown) {
    const err = error as { statusCode?: number; friendlyMessage?: string; message?: string; data?: unknown };
    const message = getErrorMessage(error)

    console.error(`[API Error] ${url}:`, error)

    if (err.statusCode === 401 && !url.includes('/api/auth/login')) {
      toast.error('เซสชันหมดอายุ', { description: 'กรุณาเข้าสู่ระบบใหม่' })
      await navigateTo('/login')
    }

    err.friendlyMessage = message
    throw error
  }
}

export const api = {
  get: <T>(url: string, options: FetchOptions = {}) => apiFetch<T>(url, { ...options, method: 'GET' }),
  post: <T>(url: string, body?: any, options: FetchOptions = {}) => apiFetch<T>(url, { ...options, method: 'POST', body }),
  put: <T>(url: string, body?: any, options: FetchOptions = {}) => apiFetch<T>(url, { ...options, method: 'PUT', body }),
  delete: <T>(url: string, options: FetchOptions = {}) => apiFetch<T>(url, { ...options, method: 'DELETE' }),
}
