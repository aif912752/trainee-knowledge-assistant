import type { H3Event } from 'h3';
import type { UserWithoutPassword } from '~~/types/user';
import { getDatabase } from '~~/server/db';
import { SessionRepository } from '~~/server/repositories/session.repository';

const SESSION_COOKIE_NAME = 'session_token';
const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days in seconds

/**
 * Create user session with secure random token
 */
export function createUserSession(event: H3Event, user: UserWithoutPassword) {
  const db = getDatabase();
  const sessionRepo = new SessionRepository(db);

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

  const db = getDatabase();
  const sessionRepo = new SessionRepository(db);

  const userId = sessionRepo.getUserIdByToken(token);

  if (!userId) {
    return null;
  }

  // Fetch user from database
  const userStmt = db.prepare('SELECT id, username, created_at FROM users WHERE id = ?');
  const user = userStmt.get(userId) as UserWithoutPassword | undefined;

  return user || null;
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
    const db = getDatabase();
    const sessionRepo = new SessionRepository(db);
    sessionRepo.deleteByToken(token);
  }

  deleteCookie(event, SESSION_COOKIE_NAME, {
    path: '/'
  });
}
