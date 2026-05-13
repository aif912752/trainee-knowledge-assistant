import { UnauthorizedError, handleApiError } from '~~/server/utils/errors';
import { successResponse } from '~~/server/utils/response';

/**
 * Get chat history API endpoint
 * GET /api/chat/history
 * Uses singleton ChatService from event.context
 */
export default defineEventHandler(async (event) => {
  try {
    const user = event.context.user;
    if (!user) {
      throw new UnauthorizedError('กรุณาเข้าสู่ระบบ');
    }

    const query = getQuery(event);
    const documentId = query.documentId ? parseInt(query.documentId as string, 10) : undefined;

    const chatService = event.context.chatService;
    const messages = chatService.getChatHistory(user.id, documentId);

    return successResponse(event, { messages });

  } catch (error) {
    return handleApiError(event, error);
  }
});
