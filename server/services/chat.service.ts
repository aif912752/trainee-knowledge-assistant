import { MessageRepository } from '~~/server/repositories/message.repository';
import { TokenRepository } from '~~/server/repositories/token.repository';
import { DocumentRepository } from '~~/server/repositories/document.repository';
import {
  buildChatPrompt,
  buildDocumentContext,
} from '~~/server/utils/chat';
import { ChatProviderService } from '~~/server/services/chat-provider.service';
import type { ChatProviderConfig } from '~~/server/services/chat-provider.service';
import type { ChatInput } from '~~/shared/validations/chat.validation';
import { type AiTokenUsage, estimateAiUsage } from '~~/shared/tokens';
import { ChatStreamParser } from '~~/shared/chat-stream';

export class ChatService {
  private messageRepository: MessageRepository;
  private tokenRepository: TokenRepository;
  private documentRepository: DocumentRepository;
  private aiProvider: ChatProviderService;

  constructor(
    messageRepo: MessageRepository,
    tokenRepo: TokenRepository,
    documentRepo: DocumentRepository,
    config: ChatProviderConfig
  ) {
    this.messageRepository = messageRepo;
    this.tokenRepository = tokenRepo;
    this.documentRepository = documentRepo;
    this.aiProvider = new ChatProviderService({
      zaiApiKey: config.zaiApiKey,
      zaiApiBase: config.zaiApiBase,
      primaryModel: config.primaryModel,
      openrouterApiKey: config.openrouterApiKey,
      openrouterApiBase: config.openrouterApiBase,
      fallbackModel: config.fallbackModel,
    });
  }

  /**
   * Send message to AI and get response
   */
  async sendMessage(userId: number, input: ChatInput, sessionId: string) {
    const { prompt, validatedDocumentId } = this.preparePrompt(userId, input);

    // Save user message to database
    this.messageRepository.create({
      user_id: userId,
      document_id: validatedDocumentId,
      role: 'user',
      content: input.message,
      tokens: 0
    });

    try {
      console.log('🤖 Sending request to Primary AI...');
      const primary = await this.aiProvider.callPrimary(prompt);
      return this.processAiResponse(primary.content, primary.usage, userId, validatedDocumentId, sessionId, primary.model);
    } catch (error: unknown) {
      const err = error as { message?: string };
      console.error('⚠️ Primary AI failed, attempting fallback...', err.message);

      try {
        const fallback = await this.aiProvider.callFallback(prompt);
        return this.processAiResponse(fallback.content, fallback.usage, userId, validatedDocumentId, sessionId, fallback.model);
      } catch (fallbackError: unknown) {
        const fbErr = fallbackError as { message?: string };
        console.error('❌ Fallback AI also failed:', fbErr.message);
        throw fallbackError;
      }
    }
  }

  /**
   * Send message to AI with streaming response
   */
  async sendMessageStream(userId: number, input: ChatInput, sessionId: string) {
    const { prompt, validatedDocumentId } = this.preparePrompt(userId, input);

    // Save user message to database
    this.messageRepository.create({
      user_id: userId,
      document_id: validatedDocumentId,
      role: 'user',
      content: input.message,
      tokens: 0
    });

    try {
      console.log('🤖 Starting stream from Primary AI...');
      let response = await this.aiProvider.streamPrimary(prompt);

      // Robust peek logic: read first few chunks to detect 200 OK errors (e.g. quota limits)
      const reader = response.body?.getReader();
      if (reader) {
        const decoder = new TextDecoder();
        const parser = new ChatStreamParser();
        let isError = false;
        let errorMessage = '';
        const bufferedValues: Uint8Array[] = [];

        try {
          // Read up to 3 chunks to ensure we get the full error JSON if it's fragmented
          for (let i = 0; i < 3; i++) {
            const { done, value } = await reader.read();
            if (value) {
              bufferedValues.push(value);
              const chunk = decoder.decode(value, { stream: true });
              const parsed = parser.parse(chunk);
              if (parsed.error) {
                isError = true;
                errorMessage = parsed.error.message;
                break;
              }
              // If we see valid model or content, it's a success stream
              if (parsed.content || parsed.model) {
                break;
              }
            }
            if (done) break;
          }

          if (!isError) {
            const flushed = parser.flush();
            if (flushed.error) {
              isError = true;
              errorMessage = flushed.error.message;
            }
          }
        } catch (e) {
          console.error('Error while peeking stream:', e);
        }

        if (isError) {
          console.warn(`⚠️ Primary AI returned error in stream, attempting fallback: ${errorMessage}`);
          reader.cancel().catch(() => {});
          response = await this.aiProvider.streamFallback(prompt);
        } else {
          // Reconstruct stream for the client since we already consumed some chunks
          const reconstructedStream = new ReadableStream({
            start(controller) {
              for (const val of bufferedValues) {
                controller.enqueue(val);
              }
            },
            async pull(controller) {
              try {
                const { done, value } = await reader.read();
                if (done) {
                  controller.close();
                  reader.releaseLock();
                } else {
                  controller.enqueue(value);
                }
              } catch (e) {
                controller.error(e);
                reader.releaseLock();
              }
            },
            cancel(reason) {
              reader.cancel(reason).catch(() => {});
            }
          });

          // Create a new response with the reconstructed stream
          response = new Response(reconstructedStream, {
            status: response.status,
            statusText: response.statusText,
            headers: response.headers
          });
        }
      }

      return { stream: response, prompt };
    } catch (error: unknown) {

      const err = error as { message?: string };
      console.error('⚠️ Primary AI stream failed, attempting fallback...', err.message);
      const stream = await this.aiProvider.streamFallback(prompt);
      return { stream, prompt };
    }
  }

  /**
   * Prepare prompt and context
   */
  private preparePrompt(userId: number, input: ChatInput) {
    const { message, documentId } = input;
    let documentContext = '';
    let validatedDocumentId: number | undefined = undefined;

    if (documentId) {
      const doc = this.documentRepository.findByIdAndUserId(documentId, userId);
      if (doc) {
        validatedDocumentId = documentId;
        documentContext = buildDocumentContext(doc);
      }
    }

    return {
      prompt: buildChatPrompt(message, documentContext),
      validatedDocumentId
    };
  }

  /**
   * Process and save AI response
   */
  private processAiResponse(content: string, usage: AiTokenUsage, userId: number, documentId: number | undefined, sessionId: string, model: string) {
    // Determine the display model name from environment variable
    const displayModel = process.env.PRIMARY_MODEL_DISPLAY_NAME || process.env.PRIMARY_MODEL || model;

    // 1. Find the last user message to update its token count
    // This is optional but good for detailed tracking
    try {
      const lastUserMsg = this.messageRepository.findLastByUserIdAndRole(userId, 'user');
      if (lastUserMsg && lastUserMsg.tokens === 0) {
        // We'll add update tokens method to repository if needed, 
        // or just use raw SQL here via repository
        this.messageRepository.updateTokens(lastUserMsg.id, usage.input);
      }
    } catch (e) {
      console.warn('⚠️ Could not update user message tokens:', e);
    }

    // 2. Save assistant message
    const assistantMessage = this.messageRepository.create({
      user_id: userId,
      document_id: documentId,
      role: 'assistant',
      content: content,
      tokens: usage.output,
      model: displayModel
    });

    // 3. Record token usage in global counter
    this.tokenRepository.create({
      user_id: userId,
      session_id: sessionId,
      tokens: usage.total
    });

    return {
      message: assistantMessage,
      usage
    };
  }

  /**
   * Save streamed response (called after stream ends)
   */
  async saveStreamedResponse(userId: number, documentId: number | undefined, sessionId: string, content: string, model: string, prompt: string) {
    // Calculate estimation internally
    const usage = estimateAiUsage(prompt, content);
    return this.processAiResponse(content, usage, userId, documentId, sessionId, model);
  }

  /**
   * Get chat history for user
   */
  getChatHistory(userId: number, documentId?: number) {
    if (documentId) {
      return this.messageRepository.findByUserIdAndDocumentId(userId, documentId);
    }
    return this.messageRepository.findByUserId(userId);
  }

  /**
   * Get token usage summary for user
   */
  getTokenUsage(userId: number) {
    return {
      total: this.tokenRepository.getTotalByUserId(userId),
      sessions: this.tokenRepository.getSessionSummariesByUserId(userId)
    };
  }

  /**
   * Clear chat history
   */
  clearHistory(userId: number) {
    return this.messageRepository.deleteByUserId(userId);
  }
}
