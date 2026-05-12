import type { UserWithoutPassword } from '~/types/user';

const SESSION_COOKIE_NAME = 'session_id';
const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days in seconds

/**
 * Create session cookie for authenticated user
 */
export function createSession(event: any, user: UserWithoutPassword) {
  // Store user ID in session cookie
  setCookie(event, SESSION_COOKIE_NAME, user.id.toString(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_MAX_AGE,
    path: '/'
  });
}

/**
 * Get current session user ID from cookie
 */
export function getSessionUserId(event: any): number | null {
  const sessionId = getCookie(event, SESSION_COOKIE_NAME);

  if (!sessionId) {
    return null;
  }

  const userId = parseInt(sessionId, 10);

  if (isNaN(userId)) {
    return null;
  }

  return userId;
}

/**
 * Clear session cookie (logout)
 */
export function clearSession(event: any) {
  deleteCookie(event, SESSION_COOKIE_NAME, {
    path: '/'
  });
}
