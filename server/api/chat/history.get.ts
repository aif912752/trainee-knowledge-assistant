import { ChatService } from '~~/server/services/chat.service';
import { UnauthorizedError, handleApiError } from '~~/server/utils/errors';
import { successResponse } from '~~/server/utils/response';

/**
 * Get chat history API endpoint
 * GET /api/chat/history
 */
export default defineEventHandler(async (event) => {
  try {
    const user = event.context.user;
    if (!user) {
      throw new UnauthorizedError('กรุณาเข้าสู่ระบบ');
    }

    const query = getQuery(event);
    const documentId = query.documentId ? parseInt(query.documentId as string, 10) : undefined;

    const chatService = new ChatService();
    const messages = chatService.getChatHistory(user.id, documentId);

    return successResponse(event, { messages });

  } catch (error) {
    return handleApiError(event, error);
  }
});
