import { getSessionUser } from '~~/server/utils/session';
import { UnauthorizedError, handleApiError } from '~~/server/utils/errors';

/**
 * Protected route middleware
 * Validates session and attaches user to event context
 */
export default defineEventHandler(async (event) => {
  // Get the request path
  const url = (event as any).path || event.node.req.url?.split('?')[0] || '';

  // Skip middleware for non-API routes
  if (!url.startsWith('/api/')) {
    return;
  }

  // Skip for public endpoints
  const publicPaths = ['/api/auth/login', '/api/auth/me'];
  if (publicPaths.some(path => url === path || url.startsWith(path + '/'))) {
    return;
  }

  // Get session user from token (validates database and expiration)
  const user = getSessionUser(event);

  if (!user) {
    return handleApiError(event, new UnauthorizedError('กรุณาเข้าสู่ระบบ'));
  }

  // Attach user to event context for use in route handlers
  event.context.user = user;
});
