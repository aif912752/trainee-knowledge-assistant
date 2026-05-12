import { clearUserSession } from '~~/server/utils/session';
import { handleApiError } from '~~/server/utils/errors';

export default defineEventHandler(async (event) => {
  try {
    // Clear the session cookie
    clearUserSession(event);

    return {
      success: true,
      message: 'ออกจากระบบสำเร็จ'
    };
  } catch (error) {
    const { data, status } = handleApiError(error);
    setResponseStatus(event, status);
    return data;
  }
});
