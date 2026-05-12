import { MessageRepository } from '~~/server/repositories/message.repository';
import { TokenRepository } from '~~/server/repositories/token.repository';
import { DocumentRepository } from '~~/server/repositories/document.repository';
import { getDatabase } from '~~/server/db';
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
    let context = '';
    if (documentId) {
      const doc = this.documentRepository.findByIdAndUserId(documentId, userId);
      if (doc && doc.content) {
        context = `เนื้อหาจากไฟล์เอกสาร (${doc.original_name}):\n\n${doc.content}\n\n---จบเนื้อหาจากไฟล์---\n\n`;
      }
    }

    // 2. Prepare messages for AI
    // We'll include a simple system prompt and the current message
    const systemPrompt = "คุณคือผู้ช่วยอัจฉริยะ (Knowledge Assistant) ที่ช่วยตอบคำถามจากข้อมูลที่ได้รับ โปรดตอบคำถามให้ชัดเจน สุภาพ และเป็นกันเอง";
    
    // For now, we only send the current message + context
    const fullPrompt = context ? `${context}คำถาม: ${message}` : message;

    // 3. Save user message to database
    const userMessage = this.messageRepository.create({
      user_id: userId,
      document_id: documentId,
      role: 'user',
      content: message,
      tokens: 0 // We'll count tokens from AI response
    });

    try {
      console.log('🤖 Sending request to Primary AI (z.ai)...');
      return await this.callZaiApi(config, systemPrompt, fullPrompt, userId, documentId, sessionId);
    } catch (error: any) {
      console.error('⚠️ Primary AI (z.ai) failed, attempting fallback to OpenRouter...', error.message);
      
      try {
        return await this.callOpenRouterApi(config, systemPrompt, fullPrompt, userId, documentId, sessionId);
      } catch (fallbackError: any) {
        console.error('❌ Fallback AI (OpenRouter) also failed:', fallbackError.message);
        throw fallbackError;
      }
    }
  }

  /**
   * Call Primary AI (z.ai/Claude)
   */
  private async callZaiApi(config: any, systemPrompt: string, fullPrompt: string, userId: number, documentId: number | undefined, sessionId: string) {
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
        system: systemPrompt,
        messages: [{ role: 'user', content: fullPrompt }]
      },
      timeout: 30000
    });

    const assistantContent = response.content[0].text;
    const inputTokens = response.usage.input_tokens;
    const outputTokens = response.usage.output_tokens;
    const totalTokens = inputTokens + outputTokens;

    return this.processAiResponse(assistantContent, inputTokens, outputTokens, totalTokens, userId, documentId, sessionId);
  }

  /**
   * Call Fallback AI (OpenRouter/Gemini)
   */
  private async callOpenRouterApi(config: any, systemPrompt: string, fullPrompt: string, userId: number, documentId: number | undefined, sessionId: string) {
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
          { role: 'system', content: systemPrompt },
          { role: 'user', content: fullPrompt }
        ]
      },
      timeout: 30000
    });

    const assistantContent = response.choices[0].message.content;
    const inputTokens = response.usage?.prompt_tokens || 0;
    const outputTokens = response.usage?.completion_tokens || 0;
    const totalTokens = response.usage?.total_tokens || 0;

    return this.processAiResponse(assistantContent, inputTokens, outputTokens, totalTokens, userId, documentId, sessionId);
  }

  /**
   * Process and save AI response
   */
  private processAiResponse(content: string, inputTokens: number, outputTokens: number, totalTokens: number, userId: number, documentId: number | undefined, sessionId: string) {
    // 5. Save assistant message
    const assistantMessage = this.messageRepository.create({
      user_id: userId,
      document_id: documentId,
      role: 'assistant',
      content: content,
      tokens: outputTokens
    });

    // 6. Record token usage
    this.tokenRepository.create({
      user_id: userId,
      session_id: sessionId,
      tokens: totalTokens
    });

    return {
      message: assistantMessage,
      usage: {
        input: inputTokens,
        output: outputTokens,
        total: totalTokens
      }
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
