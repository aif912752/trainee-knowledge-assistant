import { UnauthorizedError, handleApiError } from '~~/server/utils/errors';
import { successResponse } from '~~/server/utils/response';

/**
 * Get token usage summary API endpoint
 * GET /api/chat/usage
 * Uses singleton ChatService from event.context
 */
export default defineEventHandler(async (event) => {
  try {
    const user = event.context.user;
    if (!user) {
      throw new UnauthorizedError('กรุณาเข้าสู่ระบบ');
    }

    const chatService = event.context.chatService;
    const usage = chatService.getTokenUsage(user.id);

    return successResponse(event, { usage });

  } catch (error) {
    return handleApiError(event, error);
  }
});
