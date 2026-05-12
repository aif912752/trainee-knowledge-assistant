import { getSessionUserId } from '~/server/utils/session';
import { AuthService } from '~/server/services/auth.service';
import { UnauthorizedError, handleApiError } from '~/server/utils/errors';

export default defineEventHandler(async (event) => {
  try {
    // Get user ID from session cookie
    const userId = getSessionUserId(event);

    if (!userId) {
      return {
        authenticated: false,
        user: null
      };
    }

    // Validate session
    const authService = new AuthService();
    const isValid = authService.validateSession(userId);

    if (!isValid) {
      return {
        authenticated: false,
        user: null
      };
    }

    // Get user details
    const user = authService.getUserById(userId);

    if (!user) {
      return {
        authenticated: false,
        user: null
      };
    }

    return {
      authenticated: true,
      user
    };

  } catch (error) {
    return handleApiError(error);
  }
});
