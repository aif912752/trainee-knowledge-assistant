import { ChatService } from '~~/server/services/chat.service';
import { UnauthorizedError, handleApiError } from '~~/server/utils/errors';
import { successResponse } from '~~/server/utils/response';

/**
 * Clear chat history API endpoint
 * DELETE /api/chat/history
 */
export default defineEventHandler(async (event) => {
  try {
    const user = event.context.user;
    if (!user) {
      throw new UnauthorizedError('กรุณาเข้าสู่ระบบ');
    }

    const chatService = new ChatService();
    chatService.clearHistory(user.id);

    return successResponse(event, null, 'ล้างประวัติการสนทนาเรียบร้อยแล้ว');

  } catch (error) {
    return handleApiError(event, error);
  }
});
