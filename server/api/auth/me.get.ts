import { getSessionUser } from '~~/server/utils/session';
import { handleApiError } from '~~/server/utils/errors';
import { successResponse } from '~~/server/utils/response';

export default defineEventHandler(async (event) => {
  try {
    // Get user from session token (validates database and expiration)
    const user = getSessionUser(event);

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
