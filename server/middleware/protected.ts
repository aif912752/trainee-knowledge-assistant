import { AuthService } from '~~/server/services/auth.service';
import { getSessionUserId } from '~~/server/utils/session';
import { UnauthorizedError, handleApiError } from '~~/server/utils/errors';

/**
 * Protected route middleware
 * Validates session and attaches user to event context
 */
export default defineEventHandler(async (event) => {
  // Get the request path - use event.path or parse from node.req.url
  const url = (event as any).path || event.node.req.url?.split('?')[0] || '';

  // Skip middleware for non-API routes or public routes
  if (!url.startsWith('/api/')) {
    return;
  }

  // Skip for login and me endpoints (public auth endpoints)
  const publicPaths = ['/api/auth/login', '/api/auth/me'];
  if (publicPaths.some(path => url === path || url.startsWith(path + '/'))) {
    return;
  }

  // Get session user ID from cookie
  const userId = getSessionUserId(event);

  if (!userId) {
    return handleApiError(event, new UnauthorizedError('กรุณาเข้าสู่ระบบ'));
  }

  // Validate session
  const authService = new AuthService();

  if (!authService.validateSession(userId)) {
    return handleApiError(event, new UnauthorizedError('เซสชันไม่ถูกต้อง'));
  }

  // Get user and attach to context
  const user = authService.getUserById(userId);

  if (!user) {
    return handleApiError(event, new UnauthorizedError('ไม่พบผู้ใช้งาน'));
  }

  // Attach user to event context for use in route handlers
  event.context.user = user;
});
