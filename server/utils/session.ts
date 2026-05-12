import type { H3Event } from 'h3';
import type { UserWithoutPassword } from '~~/types/user';

const SESSION_COOKIE_NAME = 'session_id';
const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days in seconds

/**
 * Create user session cookie for authenticated user
 */
export function createUserSession(event: H3Event, user: UserWithoutPassword) {
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
export function getSessionUserId(event: H3Event): number | null {
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
 * Clear user session cookie (logout)
 */
export function clearUserSession(event: H3Event) {
  deleteCookie(event, SESSION_COOKIE_NAME, {
    path: '/'
  });
}
