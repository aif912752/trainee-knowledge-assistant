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

    // If stream is requested
    if (body.stream) {
      const response = await chatService.sendMessageStream(user.id, input, sessionId);
      
      if (!response.body) {
        throw new Error('No response body from AI provider');
      }

      // We want to both forward the stream to the client AND collect it to save to DB
      const reader = response.body.getReader();
      const encoder = new TextEncoder();
      const decoder = new TextDecoder();
      
      let fullContent = '';
      
      const stream = new ReadableStream({
        async start(controller) {
          try {
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;
              
              // Forward the raw chunk to the client
              controller.enqueue(value);
              
              // Also decode it for our fullContent collection
              const chunk = decoder.decode(value, { stream: true });
              
              // Minimal SSE parsing to collect content for DB
              // Note: This is simplified. Different providers have different formats.
              const lines = chunk.split('\n');
              for (const line of lines) {
                if (line.startsWith('data: ')) {
                  const dataStr = line.slice(6).trim();
                  if (dataStr === '[DONE]') continue;
                  try {
                    const data = JSON.parse(dataStr);
                    // z.ai/Claude format
                    if (data.type === 'content_block_delta') {
                      fullContent += data.delta?.text || '';
                    }
                    // OpenRouter/Standard format
                    else if (data.choices?.[0]?.delta?.content) {
                      fullContent += data.choices[0].delta.content;
                    }
                  } catch (e) {
                    // Ignore JSON parse errors for incomplete chunks
                  }
                }
              }
            }
            controller.close();
            
            // 5. Save to database in background
            // We don't have usage info here easily without better parsing,
            // so we'll use a rough estimate or just save what we have.
            event.waitUntil(chatService.saveStreamedResponse(
              user.id, 
              input.documentId, 
              sessionId, 
              fullContent, 
              { input: 0, output: 0, total: 0 } // Estimate or parse later
            ));

          } catch (err) {
            controller.error(err);
          }
        }
      });

      return stream;
    }

    // Standard non-streaming response
    const result = await chatService.sendMessage(user.id, input, sessionId);

    return successResponse(event, {
      message: result.message,
      usage: result.usage
    });

  } catch (error) {
    return handleApiError(event, error);
  }
});
