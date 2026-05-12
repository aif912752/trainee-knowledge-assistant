import { ChatService } from '~~/server/services/chat.service';
import { validateBody } from '~~/shared/validations/helpers';
import { chatSchema } from '~~/shared/validations';
import { UnauthorizedError, handleApiError } from '~~/server/utils/errors';
import { successResponse } from '~~/server/utils/response';
import type { ChatInput } from '~~/shared/validations/chat.validation';

/**
 * Chat API endpoint
 * POST /api/chat
 */
export default defineEventHandler(async (event) => {
  try {
    // 1. Get user from session
    const user = event.context.user;
    if (!user) {
      throw new UnauthorizedError('กรุณาเข้าสู่ระบบ');
    }

    // 2. Validate request body
    const body = await readBody(event);
    const input = validateBody<ChatInput>(chatSchema, body);

    // 3. Get session ID from headers or cookie
    // If not provided, we use a default one for the session
    const sessionId = getHeader(event, 'x-chat-session-id') || `session_${Date.now()}`;

    // 4. Send message using ChatService
    const chatService = new ChatService();
    const result = await chatService.sendMessage(user.id, input, sessionId);

    return successResponse(event, {
      message: result.message,
      usage: result.usage
    });

  } catch (error) {
    return handleApiError(event, error);
  }
});
