import { getSessionUserId } from '~~/server/utils/session';
import { AuthService } from '~~/server/services/auth.service';
import { handleApiError } from '~~/server/utils/errors';
import { successResponse } from '~~/server/utils/response';

export default defineEventHandler(async (event) => {
  try {
    // Get user ID from session cookie
    const userId = getSessionUserId(event);

    if (!userId) {
      return successResponse(event, {
        authenticated: false,
        user: null
      });
    }

    // Validate session
    const authService = new AuthService();
    const isValid = authService.validateSession(userId);

    if (!isValid) {
      return successResponse(event, {
        authenticated: false,
        user: null
      });
    }

    // Get user details
    const user = authService.getUserById(userId);

    if (!user) {
      return successResponse(event, {
        authenticated: false,
        user: null
      });
    }

    return successResponse(event, {
      authenticated: true,
      user
    });

  } catch (error) {
    return handleApiError(event, error);
  }
});
