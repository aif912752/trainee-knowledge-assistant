import type { H3Event } from 'h3';
import type { UserWithoutPassword } from '~~/types/user';
import type { SessionRepository } from '~~/server/repositories/session.repository';
import type { UserRepository } from '~~/server/repositories/user.repository';

const SESSION_COOKIE_NAME = 'session_token';
const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days in seconds

/**
 * Create user session with secure random token
 */
export function createUserSession(event: H3Event, user: UserWithoutPassword) {
  const sessionRepo = event.context.repositories.session;

  // Create session with random token
  const session = sessionRepo.create(user.id, SESSION_MAX_AGE);

  // Store token in httpOnly cookie
  setCookie(event, SESSION_COOKIE_NAME, session.token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_MAX_AGE,
    path: '/'
  });
}

/**
 * Get current session user from token
 * Returns user object or null if invalid/expired
 */
export function getSessionUser(event: H3Event): UserWithoutPassword | null {
  const token = getCookie(event, SESSION_COOKIE_NAME);

  if (!token) {
    return null;
  }

  const sessionRepo = event.context.repositories.session;
  const userRepo = event.context.repositories.user;

  const userId = sessionRepo.getUserIdByToken(token);

  if (!userId) {
    return null;
  }

  // Fetch user from repository
  const user = userRepo.findById(userId);

  // Return user without password
  if (user) {
    const { password_hash, ...userWithoutPassword } = user;
    return userWithoutPassword as UserWithoutPassword;
  }

  return null;
}

/**
 * Get user ID from session token
 */
export function getSessionUserId(event: H3Event): number | null {
  const user = getSessionUser(event);
  return user ? user.id : null;
}

/**
 * Clear user session (logout)
 */
export function clearUserSession(event: H3Event) {
  const token = getCookie(event, SESSION_COOKIE_NAME);

  if (token) {
    const sessionRepo = event.context.repositories.session;
    sessionRepo.deleteByToken(token);
  }

  deleteCookie(event, SESSION_COOKIE_NAME, {
    path: '/'
  });
}
