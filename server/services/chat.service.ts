import { MessageRepository } from '~~/server/repositories/message.repository';
import { TokenRepository } from '~~/server/repositories/token.repository';
import { DocumentRepository } from '~~/server/repositories/document.repository';
import {
  buildChatPrompt,
  buildDocumentContext,
  estimateTokenUsage,
  type TokenUsageSummary,
} from '~~/server/utils/chat';
import { ChatProviderService } from '~~/server/services/chat-provider.service';
import type { ChatInput } from '~~/shared/validations/chat.validation';

export class ChatService {
  private messageRepository: MessageRepository;
  private tokenRepository: TokenRepository;
  private documentRepository: DocumentRepository;
  private aiProvider: ChatProviderService;

  constructor(
    messageRepo: MessageRepository,
    tokenRepo: TokenRepository,
    documentRepo: DocumentRepository,
    config: any
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
    } catch (error: any) {
      console.error('⚠️ Primary AI failed, attempting fallback...', error.message);

      try {
        const fallback = await this.aiProvider.callFallback(prompt);
        return this.processAiResponse(fallback.content, fallback.usage, userId, validatedDocumentId, sessionId, fallback.model);
      } catch (fallbackError: any) {
        console.error('❌ Fallback AI also failed:', fallbackError.message);
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
      const stream = await this.aiProvider.streamPrimary(prompt);
      return { stream, prompt };
    } catch (error: any) {
      console.error('⚠️ Primary AI stream failed, attempting fallback...', error.message);
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
  private processAiResponse(content: string, usage: TokenUsageSummary, userId: number, documentId: number | undefined, sessionId: string, model: string) {
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
      model: model
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
    const usage = estimateTokenUsage(prompt, content);
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
