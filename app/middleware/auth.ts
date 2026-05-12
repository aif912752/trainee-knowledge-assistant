/**
 * Authentication middleware
 * Protects routes that require authentication
 */
export default defineNuxtRouteMiddleware((to, from) => {
  // Only run on client side
  if (import.meta.client) {
    // Skip middleware for login page
    if (to.path === '/login') {
      return
    }

    // Check if user has session cookie
    const hasSession = document.cookie.includes('session_id=')

    if (!hasSession) {
      // Redirect to login if not authenticated
      return navigateTo('/login')
    }
  }
})
