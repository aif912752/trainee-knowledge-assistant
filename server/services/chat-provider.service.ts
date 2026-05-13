import { BaseApiService } from './base-api.service';
import { CHAT_SYSTEM_PROMPT, normalizeOpenRouterUsage, normalizeZaiUsage, type TokenUsageSummary } from '~~/server/utils/chat';

export interface ChatProviderConfig {
  zaiApiKey: string;
  zaiApiBase: string;
  openrouterApiKey?: string;
  openrouterApiBase?: string;
  fallbackModel?: string;
}

export interface ChatProviderResult {
  content: string;
  usage: TokenUsageSummary;
}

/**
 * Service for interacting with external AI providers
 */
export class ChatProviderService extends BaseApiService {
  constructor(private config: ChatProviderConfig) {
    super();
  }

  /**
   * Call Primary AI (z.ai/Claude)
   */
  async callPrimary(fullPrompt: string): Promise<ChatProviderResult> {
    const response = await this.post<any>(this.config.zaiApiBase, {
      model: 'claude-3-haiku-20240307',
      max_tokens: 1024,
      system: CHAT_SYSTEM_PROMPT,
      messages: [{ role: 'user', content: fullPrompt }],
    }, {
      'x-api-key': this.config.zaiApiKey,
      'anthropic-version': '2023-06-01',
    });

    return {
      content: response.content[0].text,
      usage: normalizeZaiUsage(response.usage),
    };
  }

  /**
   * Stream Primary AI (z.ai/Claude)
   */
  async streamPrimary(fullPrompt: string): Promise<Response> {
    return this.postStream(this.config.zaiApiBase, {
      model: 'claude-3-haiku-20240307',
      max_tokens: 1024,
      system: CHAT_SYSTEM_PROMPT,
      messages: [{ role: 'user', content: fullPrompt }],
      stream: true,
    }, {
      'x-api-key': this.config.zaiApiKey,
      'anthropic-version': '2023-06-01',
    });
  }

  /**
   * Call Fallback AI (OpenRouter/Gemini)
   */
  async callFallback(fullPrompt: string): Promise<ChatProviderResult> {
    if (!this.config.openrouterApiKey) {
      throw new Error('OpenRouter API key is not configured');
    }

    const response = await this.post<any>(this.config.openrouterApiBase!, {
      model: this.config.fallbackModel,
      messages: [
        { role: 'system', content: CHAT_SYSTEM_PROMPT },
        { role: 'user', content: fullPrompt },
      ],
    }, {
      Authorization: `Bearer ${this.config.openrouterApiKey}`,
    });

    return {
      content: response.choices[0].message.content,
      usage: normalizeOpenRouterUsage(response.usage),
    };
  }

  /**
   * Stream Fallback AI (OpenRouter/Gemini)
   */
  async streamFallback(fullPrompt: string): Promise<Response> {
    if (!this.config.openrouterApiKey) {
      throw new Error('OpenRouter API key is not configured');
    }

    return this.postStream(this.config.openrouterApiBase!, {
      model: this.config.fallbackModel,
      messages: [
        { role: 'system', content: CHAT_SYSTEM_PROMPT },
        { role: 'user', content: fullPrompt },
      ],
      stream: true,
    }, {
      Authorization: `Bearer ${this.config.openrouterApiKey}`,
    });
  }
}
