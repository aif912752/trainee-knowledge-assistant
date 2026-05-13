import { validateBody } from '~~/shared/validations/helpers';
import { chatSchema } from '~~/shared/validations';
import { UnauthorizedError, handleApiError } from '~~/server/utils/errors';
import { successResponse } from '~~/server/utils/response';
import { estimateTokenUsage } from '~~/server/utils/chat';
import type { ChatInput } from '~~/shared/validations/chat.validation';

/**
 * Chat API endpoint
 * POST /api/chat
 * Uses singleton ChatService from event.context (initialized by plugin)
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
    const sessionId = getHeader(event, 'x-chat-session-id') || `session_${Date.now()}`;

    // 4. Get singleton ChatService from plugin
    const chatService = event.context.chatService;

    // If stream is requested
    if (body.stream) {
      setResponseHeaders(event, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      });

      const { stream: response, prompt } = await chatService.sendMessageStream(user.id, input, sessionId);

      if (!response.body) {
        throw new Error('No response body from AI provider');
      }

      // We want to both forward the stream to the client AND collect it to save to DB
      const reader = response.body.getReader();
      const encoder = new TextEncoder();
      const decoder = new TextDecoder();

      let fullContent = '';
      let usedModel = '';

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

              // Support both z.ai (Claude/Anthropic) and OpenAI (GLM/OpenRouter) formats
              const lines = chunk.split('\n');
              for (const line of lines) {
                const trimmedLine = line.trim();
                if (!trimmedLine) continue;

                if (trimmedLine.startsWith('data: ')) {
                  const dataStr = trimmedLine.slice(6).trim();
                  if (dataStr === '[DONE]') continue;
                  
                  try {
                    const data = JSON.parse(dataStr);
                    // Extract model info if present in first chunks
                    if (data.model && !usedModel) {
                      usedModel = data.model;
                    }
                    
                    // 1. OpenAI format (OpenRouter, z.ai GLM)
                    if (data.choices?.[0]?.delta?.content) {
                      fullContent += data.choices[0].delta.content;
                    }
                    // 2. Anthropic format (z.ai Claude)
                    else if (data.type === 'content_block_delta' && data.delta?.text) {
                      fullContent += data.delta.text;
                    }
                  } catch (e) {
                    // Ignore JSON parse errors for incomplete chunks
                  }
                }
              }
            }
            controller.close();

            // 5. Save to database in background
            // Token estimation is now handled inside saveStreamedResponse using the full prompt
            event.waitUntil(chatService.saveStreamedResponse(
              user.id,
              input.documentId,
              sessionId,
              fullContent,
              usedModel || 'ai-model',
              prompt
            ));

          } catch (err) {
            controller.error(err);
          }
        }
      });

      return sendStream(event, stream);
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
