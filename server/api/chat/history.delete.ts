import { ChatService } from '~~/server/services/chat.service';
import { UnauthorizedError, handleApiError } from '~~/server/utils/errors';

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

    return {
      success: true,
      message: 'ล้างประวัติการสนทนาเรียบร้อยแล้ว'
    };

  } catch (error) {
    const { data, status } = handleApiError(error);
    setResponseStatus(event, status);
    return data;
  }
});
