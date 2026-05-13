import { BaseApiService } from './base-api.service';
import { CHAT_SYSTEM_PROMPT, normalizeOpenRouterUsage, normalizeZaiUsage, type TokenUsageSummary } from '~~/server/utils/chat';

export interface ChatProviderConfig {
  zaiApiKey: string;
  zaiApiBase: string;
  primaryModel: string;
  openrouterApiKey?: string;
  openrouterApiBase?: string;
  fallbackModel?: string;
}

export interface ChatProviderResult {
  content: string;
  usage: TokenUsageSummary;
  model: string;
}

/**
 * Service for interacting with external AI providers
 */
export class ChatProviderService extends BaseApiService {
  constructor(private config: ChatProviderConfig) {
    super();
  }

  /**
   * Call Primary AI (z.ai - Adaptive Format)
   */
  async callPrimary(fullPrompt: string): Promise<ChatProviderResult> {
    const baseUrl = this.config.zaiApiBase.replace(/\/$/, '');
    const isAnthropic = baseUrl.includes('/anthropic');
    const isCodingPlan = baseUrl.includes('/coding');
    const primaryModel = this.config.primaryModel;
    
    if (isAnthropic) {
      // 1. Anthropic/Claude Format
      const url = baseUrl.endsWith('/v1/messages') ? baseUrl : `${baseUrl}/v1/messages`;
      console.log(`[ChatProvider] Calling Primary AI (Anthropic Mode): ${url}`);
      
      const response = await this.post<any>(url, {
        model: primaryModel,
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
        model: response.model || primaryModel
      };
    } else {
      // 2. OpenAI-Compatible Format (GLM / Coding Plan)
      let url = baseUrl;
      let model = primaryModel;
      
      if (isCodingPlan) {
        url = baseUrl.includes('/chat/completions') ? baseUrl : `${baseUrl}/chat/completions`;
        model = 'glm-4.7'; // Recommended for Coding Plan
      } else {
        url = baseUrl.includes('/chat/completions') ? baseUrl : `${baseUrl}/v4/chat/completions`;
      }
      
      console.log(`[ChatProvider] Calling Primary AI: ${url} (Model: ${model})`);
      const response = await this.post<any>(url, {
        model,
        messages: [
          { role: 'system', content: CHAT_SYSTEM_PROMPT },
          { role: 'user', content: fullPrompt }
        ],
      }, {
        Authorization: `Bearer ${this.config.zaiApiKey}`,
      });

      return {
        content: response.choices[0].message.content,
        usage: normalizeOpenRouterUsage(response.usage),
        model: response.model || model
      };
    }
  }

  /**
   * Stream Primary AI (z.ai - Adaptive Format)
   */
  async streamPrimary(fullPrompt: string): Promise<Response> {
    const baseUrl = this.config.zaiApiBase.replace(/\/$/, '');
    const isAnthropic = baseUrl.includes('/anthropic');
    const isCodingPlan = baseUrl.includes('/coding');
    const primaryModel = this.config.primaryModel;

    if (isAnthropic) {
      // 1. Anthropic/Claude Format
      const url = baseUrl.endsWith('/v1/messages') ? baseUrl : `${baseUrl}/v1/messages`;
      console.log(`[ChatProvider] Streaming Primary AI (Anthropic Mode): ${url}`);
      
      return this.postStream(url, {
        model: primaryModel,
        max_tokens: 1024,
        system: CHAT_SYSTEM_PROMPT,
        messages: [{ role: 'user', content: fullPrompt }],
        stream: true,
      }, {
        'x-api-key': this.config.zaiApiKey,
        'anthropic-version': '2023-06-01',
      });
    } else {
      // 2. OpenAI-Compatible Format (GLM / Coding Plan)
      let url = baseUrl;
      let model = primaryModel;

      if (isCodingPlan) {
        url = baseUrl.includes('/chat/completions') ? baseUrl : `${baseUrl}/chat/completions`;
        model = 'glm-4.7';
      } else {
        url = baseUrl.includes('/chat/completions') ? baseUrl : `${baseUrl}/v4/chat/completions`;
      }

      console.log(`[ChatProvider] Streaming Primary AI: ${url} (Model: ${model})`);
      return this.postStream(url, {
        model,
        messages: [
          { role: 'system', content: CHAT_SYSTEM_PROMPT },
          { role: 'user', content: fullPrompt }
        ],
        stream: true,
      }, {
        Authorization: `Bearer ${this.config.zaiApiKey}`,
      });
    }
  }

  /**
   * Call Fallback AI (OpenRouter/Gemini)
   */
  async callFallback(fullPrompt: string): Promise<ChatProviderResult> {
    if (!this.config.openrouterApiKey) {
      throw new Error('OpenRouter API key is not configured');
    }

    const baseUrl = this.config.openrouterApiBase!;
    const url = baseUrl.includes('/v1/chat/completions') 
      ? baseUrl 
      : `${baseUrl.replace(/\/$/, '')}/api/v1/chat/completions`;

    console.log(`[ChatProvider] Calling Fallback AI: ${url} (Model: ${model})`);
    const response = await this.post<any>(url, {
      model: this.config.fallbackModel,
      messages: [
        { role: 'system', content: CHAT_SYSTEM_PROMPT },
        { role: 'user', content: fullPrompt },
      ],
    }, {
      Authorization: `Bearer ${this.config.openrouterApiKey}`,
      'HTTP-Referer': 'https://github.com/aif912752/trainee-knowledge-assistant',
      'X-Title': 'Mini Knowledge Assistant',
    });

    return {
      content: response.choices[0].message.content,
      usage: normalizeOpenRouterUsage(response.usage),
      model: response.model || model
    };
  }

  /**
   * Stream Fallback AI (OpenRouter/Gemini)
   */
  async streamFallback(fullPrompt: string): Promise<Response> {
    if (!this.config.openrouterApiKey) {
      throw new Error('OpenRouter API key is not configured');
    }

    const baseUrl = this.config.openrouterApiBase!;
    const url = baseUrl.includes('/v1/chat/completions') 
      ? baseUrl 
      : `${baseUrl.replace(/\/$/, '')}/api/v1/chat/completions`;

    console.log(`[ChatProvider] Streaming Fallback AI: ${url} (Model: ${model})`);
    return this.postStream(url, {
      model: this.config.fallbackModel,
      messages: [
        { role: 'system', content: CHAT_SYSTEM_PROMPT },
        { role: 'user', content: fullPrompt },
      ],
      stream: true,
    }, {
      Authorization: `Bearer ${this.config.openrouterApiKey}`,
      'HTTP-Referer': 'https://github.com/aif912752/trainee-knowledge-assistant',
      'X-Title': 'Mini Knowledge Assistant',
    });
  }
}
