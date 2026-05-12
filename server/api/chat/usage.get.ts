import { ChatService } from '~~/server/services/chat.service';
import { UnauthorizedError, handleApiError } from '~~/server/utils/errors';

/**
 * Get token usage summary API endpoint
 * GET /api/chat/usage
 */
export default defineEventHandler(async (event) => {
  try {
    const user = event.context.user;
    if (!user) {
      throw new UnauthorizedError('กรุณาเข้าสู่ระบบ');
    }

    const chatService = new ChatService();
    const usage = chatService.getTokenUsage(user.id);

    return {
      success: true,
      usage
    };

  } catch (error) {
    const { data, status } = handleApiError(error);
    setResponseStatus(event, status);
    return data;
  }
});
