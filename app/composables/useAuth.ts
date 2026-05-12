import { toast } from 'vue-sonner'
import { apiFetch } from './useApi'
import type { LoginInput, LoginResult } from '~~/types/auth'
import type { UserWithoutPassword } from '~~/types/user'

/**
 * Authentication composable
 * Handles login, logout, and session management
 */
export function useAuth() {
  const isLoading = ref(false)
  const error = ref<string>('')

  /**
   * Login with username and password
   */
  async function login(credentials: LoginInput): Promise<LoginResult> {
    isLoading.value = true
    error.value = ''

    try {
      const response = await apiFetch<LoginResult>('/api/auth/login', {
        method: 'POST',
        body: credentials,
      })

      if (response.success) {
        toast.success('เข้าสู่ระบบสำเร็จ', {
          description: 'ยินดีต้อนรับกลับเข้าสู่ระบบ',
        })
      }

      return response
    } catch (err: any) {
      error.value = err.friendlyMessage || err.data?.error || 'เข้าสู่ระบบไม่สำเร็จ'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Logout and redirect to login page
   */
  async function logout() {
    try {
      await apiFetch('/api/auth/logout', { method: 'POST' })
    } catch (err) {
      console.error('Logout error:', err)
    } finally {
      window.location.href = '/login'
    }
  }

  /**
   * Check if user is authenticated
   */
  async function checkAuth(): Promise<boolean> {
    try {
      const response = await apiFetch<{ authenticated: boolean; user?: UserWithoutPassword }>('/api/auth/me')
      return response.authenticated
    } catch (err) {
      return false
    }
  }

  return {
    isLoading: readonly(isLoading),
    error: readonly(error),
    login,
    logout,
    checkAuth,
  }
}
