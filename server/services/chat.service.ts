import { MessageRepository } from '~~/server/repositories/message.repository';
import { TokenRepository } from '~~/server/repositories/token.repository';
import { DocumentRepository } from '~~/server/repositories/document.repository';
import { getDatabase } from '~~/server/db';
import {
  buildChatPrompt,
  buildDocumentContext,
  type TokenUsageSummary,
} from '~~/server/utils/chat';
import { ChatProviderService } from '~~/server/services/chat-provider.service';
import type { ChatInput } from '~~/shared/validations/chat.validation';

export class ChatService {
  private messageRepository: MessageRepository;
  private tokenRepository: TokenRepository;
  private documentRepository: DocumentRepository;
  private aiProvider: ChatProviderService;

  constructor() {
    const db = getDatabase();
    this.messageRepository = new MessageRepository(db);
    this.tokenRepository = new TokenRepository(db);
    this.documentRepository = new DocumentRepository(db);
    const config = useRuntimeConfig();
    this.aiProvider = new ChatProviderService({
      zaiApiKey: config.zaiApiKey,
      zaiApiBase: config.zaiApiBase,
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

    // 3. Save user message to database
    this.messageRepository.create({
      user_id: userId,
      document_id: validatedDocumentId,
      role: 'user',
      content: input.message,
      tokens: 0 // We'll count tokens from AI response
    });

    try {
      console.log('🤖 Sending request to Primary AI (z.ai)...');
      const primary = await this.aiProvider.callPrimary(prompt);
      return this.processAiResponse(primary.content, primary.usage, userId, validatedDocumentId, sessionId);
    } catch (error: any) {
      console.error('⚠️ Primary AI (z.ai) failed, attempting fallback to OpenRouter...', error.message);
      
      try {
        const fallback = await this.aiProvider.callFallback(prompt);
        return this.processAiResponse(fallback.content, fallback.usage, userId, validatedDocumentId, sessionId);
      } catch (fallbackError: any) {
        console.error('❌ Fallback AI (OpenRouter) also failed:', fallbackError.message);
        throw fallbackError;
      }
    }
  }

  /**
   * Send message to AI with streaming response
   */
  async sendMessageStream(userId: number, input: ChatInput, sessionId: string) {
    const { prompt, validatedDocumentId } = this.preparePrompt(userId, input);

    // 3. Save user message to database
    this.messageRepository.create({
      user_id: userId,
      document_id: validatedDocumentId,
      role: 'user',
      content: input.message,
      tokens: 0
    });

    try {
      console.log('🤖 Starting stream from Primary AI (z.ai)...');
      return await this.aiProvider.streamPrimary(prompt);
    } catch (error: any) {
      console.error('⚠️ Primary AI stream failed, attempting fallback...', error.message);
      return await this.aiProvider.streamFallback(prompt);
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
  private processAiResponse(content: string, usage: TokenUsageSummary, userId: number, documentId: number | undefined, sessionId: string) {
    // 5. Save assistant message
    const assistantMessage = this.messageRepository.create({
      user_id: userId,
      document_id: documentId,
      role: 'assistant',
      content: content,
      tokens: usage.output
    });

    // 6. Record token usage
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
  async saveStreamedResponse(userId: number, documentId: number | undefined, sessionId: string, content: string, usage: TokenUsageSummary) {
    return this.processAiResponse(content, usage, userId, documentId, sessionId);
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
