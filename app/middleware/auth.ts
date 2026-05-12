/**
 * Authentication middleware
 * Protects routes that require authentication
 */
export default defineNuxtRouteMiddleware(async (to, from) => {
  // Skip middleware for login page
  if (to.path === '/login') {
    return
  }

  // Check authentication via API
  const { data } = await useFetch('/api/auth/me')

  if (!data.value?.success || !data.value.data.authenticated) {
    // Redirect to login if not authenticated
    return navigateTo('/login')
  }
})
