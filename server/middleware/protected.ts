import { AuthService } from '~~/server/services/auth.service';
import { getSessionUserId } from '~~/server/utils/session';
import { UnauthorizedError, handleApiError } from '~~/server/utils/errors';

/**
 * Protected route middleware
 * Validates session and attaches user to event context
 */
export default defineEventHandler(async (event) => {
  // Skip middleware for non-API routes or public routes
  if (!event.node.req.url?.startsWith('/api/')) {
    return;
  }

  // Skip for login endpoint
  if (event.node.req.url?.startsWith('/api/auth/login')) {
    return;
  }

  // Get session user ID from cookie
  const userId = getSessionUserId(event);

  if (!userId) {
    return handleApiError(new UnauthorizedError('Authentication required'));
  }

  // Validate session
  const authService = new AuthService();

  if (!authService.validateSession(userId)) {
    return handleApiError(new UnauthorizedError('Invalid session'));
  }

  // Get user and attach to context
  const user = authService.getUserById(userId);

  if (!user) {
    return handleApiError(new UnauthorizedError('User not found'));
  }

  // Attach user to event context for use in route handlers
  event.context.user = user;
});
