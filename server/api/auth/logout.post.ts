import { clearUserSession } from '~~/server/utils/session';
import { handleApiError } from '~~/server/utils/errors';
import { successResponse } from '~~/server/utils/response';

export default defineEventHandler(async (event) => {
  try {
    // Clear the session cookie
    clearUserSession(event);

    return successResponse(event, null, 'ออกจากระบบสำเร็จ');
  } catch (error) {
    return handleApiError(event, error);
  }
});
