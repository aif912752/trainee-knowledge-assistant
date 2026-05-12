import { MessageRepository } from '~~/server/repositories/message.repository';
import { TokenRepository } from '~~/server/repositories/token.repository';
import { DocumentRepository } from '~~/server/repositories/document.repository';
import { getDatabase } from '~~/server/db';
import {
  buildChatPrompt,
  buildDocumentContext,
  CHAT_SYSTEM_PROMPT,
  normalizeOpenRouterUsage,
  normalizeZaiUsage,
  type TokenUsageSummary,
} from '~~/server/utils/chat';
import type { ChatInput } from '~~/shared/validations/chat.validation';

export class ChatService {
  private messageRepository: MessageRepository;
  private tokenRepository: TokenRepository;
  private documentRepository: DocumentRepository;

  constructor() {
    const db = getDatabase();
    this.messageRepository = new MessageRepository(db);
    this.tokenRepository = new TokenRepository(db);
    this.documentRepository = new DocumentRepository(db);
  }

  /**
   * Send message to AI and get response
   */
  async sendMessage(userId: number, input: ChatInput, sessionId: string) {
    const config = useRuntimeConfig();
    const { message, documentId } = input;

    // 1. Get document context if provided
    let documentContext = '';
    let validatedDocumentId: number | undefined = undefined;
    
    if (documentId) {
      const doc = this.documentRepository.findByIdAndUserId(documentId, userId);
      if (doc) {
        validatedDocumentId = documentId;
        documentContext = buildDocumentContext(doc);
      } else {
        console.warn(`⚠️ Document ${documentId} not found for user ${userId}, proceeding without context`);
      }
    }

    // 2. Prepare messages for AI
    const fullPrompt = buildChatPrompt(message, documentContext);

    // 3. Save user message to database
    const userMessage = this.messageRepository.create({
      user_id: userId,
      document_id: validatedDocumentId,
      role: 'user',
      content: message,
      tokens: 0 // We'll count tokens from AI response
    });

    try {
      console.log('🤖 Sending request to Primary AI (z.ai)...');
      return await this.callZaiApi(config, fullPrompt, userId, validatedDocumentId, sessionId);
    } catch (error: any) {
      console.error('⚠️ Primary AI (z.ai) failed, attempting fallback to OpenRouter...', error.message);
      
      try {
        return await this.callOpenRouterApi(config, fullPrompt, userId, validatedDocumentId, sessionId);
      } catch (fallbackError: any) {
        console.error('❌ Fallback AI (OpenRouter) also failed:', fallbackError.message);
        throw fallbackError;
      }
    }
  }

  /**
   * Call Primary AI (z.ai/Claude)
   */
  private async callZaiApi(config: any, fullPrompt: string, userId: number, documentId: number | undefined, sessionId: string) {
    const response = await $fetch<any>(config.zaiApiBase, {
      method: 'POST',
      headers: {
        'x-api-key': config.zaiApiKey,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json'
      },
      body: {
        model: 'claude-3-haiku-20240307',
        max_tokens: 1024,
        system: CHAT_SYSTEM_PROMPT,
        messages: [{ role: 'user', content: fullPrompt }]
      },
      timeout: 30000
    });

    const assistantContent = response.content[0].text;
    const usage = normalizeZaiUsage(response.usage);

    return this.processAiResponse(assistantContent, usage, userId, documentId, sessionId);
  }

  /**
   * Call Fallback AI (OpenRouter/Gemini)
   */
  private async callOpenRouterApi(config: any, fullPrompt: string, userId: number, documentId: number | undefined, sessionId: string) {
    if (!config.openrouterApiKey) {
      throw new Error('OpenRouter API key is not configured');
    }

    const response = await $fetch<any>(config.openrouterApiBase, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.openrouterApiKey}`,
        'Content-Type': 'application/json'
      },
      body: {
        model: config.fallbackModel,
        messages: [
          { role: 'system', content: CHAT_SYSTEM_PROMPT },
          { role: 'user', content: fullPrompt }
        ]
      },
      timeout: 30000
    });

    const assistantContent = response.choices[0].message.content;
    const usage = normalizeOpenRouterUsage(response.usage);

    return this.processAiResponse(assistantContent, usage, userId, documentId, sessionId);
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
