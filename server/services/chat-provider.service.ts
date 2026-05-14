import { BaseApiService } from './base-api.service';
import { CHAT_SYSTEM_PROMPT, normalizeOpenRouterUsage, normalizeZaiUsage } from '~~/server/utils/chat';
import type { AiTokenUsage } from '~~/shared/tokens';

export interface ChatProviderConfig {
  zaiApiKey: string;
  zaiApiBase: string;
  primaryModel: string;
  primaryModelDisplayName?: string;
  openrouterApiKey?: string;
  openrouterApiBase?: string;
  fallbackModel?: string;
}

export interface ChatProviderResult {
  content: string;
  usage: AiTokenUsage;
  model: string;
}

interface AnthropicMessageResponse {
  content: Array<{ type: string; text: string }>;
  usage: { input_tokens: number; output_tokens: number };
  model: string;
}

interface OpenAIChatResponse {
  choices: Array<{ message: { content: string }; delta?: { content: string } }>;
  usage: { prompt_tokens: number; completion_tokens: number; total_tokens: number };
  model: string;
}

export class ChatProviderService extends BaseApiService {
  constructor(private config: ChatProviderConfig) {
    super();
  }

  /**
   * Build URL for OpenAI-compatible API
   */
  private buildOpenAiUrl(baseUrl: string): string {
    return baseUrl.includes('/chat/completions') ? baseUrl : `${baseUrl}/v4/chat/completions`;
  }

  /**
   * Build URL for Anthropic API
   */
  private buildAnthropicUrl(baseUrl: string): string {
    return baseUrl.endsWith('/v1/messages') ? baseUrl : `${baseUrl}/v1/messages`;
  }

  async callPrimary(fullPrompt: string): Promise<ChatProviderResult> {
    const baseUrl = this.config.zaiApiBase.replace(/\/$/, '');
    const isAnthropic = baseUrl.includes('/anthropic');
    const primaryModel = this.config.primaryModel;

    if (!primaryModel) {
      throw new Error('PRIMARY_MODEL is not configured in .env');
    }

    if (isAnthropic) {
      const url = this.buildAnthropicUrl(baseUrl);
      console.log(`[ChatProvider] Calling Primary AI (Anthropic Mode): ${url}`);

      const response = await this.post<AnthropicMessageResponse>(url, {
        model: primaryModel,
        max_tokens: 1024,
        system: CHAT_SYSTEM_PROMPT,
        messages: [{ role: 'user', content: fullPrompt }],
      }, {
        'x-api-key': this.config.zaiApiKey,
        'anthropic-version': '2023-06-01',
      });

      if (!response.content || response.content.length === 0 || !response.content[0]?.text) {
        throw new Error('Anthropic API response content is empty or malformed.');
      }

      return {
        content: response.content[0].text,
        usage: normalizeZaiUsage(response.usage),
        model: primaryModel
      };
    } else {
      const url = this.buildOpenAiUrl(baseUrl);

      console.log(`[ChatProvider] Calling Primary AI: ${url} (Model: ${primaryModel})`);
      const response = await this.post<OpenAIChatResponse>(url, {
        model: primaryModel,
        messages: [
          { role: 'system', content: CHAT_SYSTEM_PROMPT },
          { role: 'user', content: fullPrompt }
        ],
      }, {
        Authorization: `Bearer ${this.config.zaiApiKey}`,
      });

      const choice = response.choices?.[0];
      if (!choice || !choice.message || typeof choice.message.content !== 'string') {
        throw new Error('Primary AI API response choices are empty or malformed.');
      }

      return {
        content: choice.message.content,
        usage: normalizeOpenRouterUsage(response.usage),
        model: primaryModel
      };
    }
  }

  async streamPrimary(fullPrompt: string): Promise<Response> {
    const baseUrl = this.config.zaiApiBase.replace(/\/$/, '');
    const isAnthropic = baseUrl.includes('/anthropic');
    const primaryModel = this.config.primaryModel;

    if (!primaryModel) {
      throw new Error('PRIMARY_MODEL is not configured in .env');
    }

    if (isAnthropic) {
      const url = this.buildAnthropicUrl(baseUrl);
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
      const url = this.buildOpenAiUrl(baseUrl);

      console.log(`[ChatProvider] Streaming Primary AI: ${url} (Model: ${primaryModel})`);
      return this.postStream(url, {
        model: primaryModel,
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

  async callFallback(fullPrompt: string): Promise<ChatProviderResult> {
    if (!this.config.openrouterApiKey) {
      throw new Error('OPENROUTER_API_KEY is not configured in .env');
    }

    const model = this.config.fallbackModel;
    if (!model) {
      throw new Error('FALLBACK_MODEL is not configured in .env');
    }

    const baseUrl = this.config.openrouterApiBase!.replace(/\/$/, '');
    let url = baseUrl;
    if (!url.includes('/chat/completions')) {
      if (!url.endsWith('/v1')) {
        url = `${url}/v1/chat/completions`;
      } else {
        url = `${url}/chat/completions`;
      }
    }

    console.log(`[ChatProvider] Calling Fallback AI: ${url} (Model: ${model})`);
    const response = await this.post<OpenAIChatResponse>(url, {
      model,
      messages: [
        { role: 'system', content: CHAT_SYSTEM_PROMPT },
        { role: 'user', content: fullPrompt },
      ],
    }, {
      Authorization: `Bearer ${this.config.openrouterApiKey}`,
      'HTTP-Referer': 'https://github.com/aif912752/trainee-knowledge-assistant',
      'X-Title': 'Mini Knowledge Assistant',
    });

    const choice = response.choices?.[0];
    if (!choice || !choice.message || typeof choice.message.content !== 'string') {
      throw new Error('Fallback AI response choices are empty or malformed.');
    }

    return {
      content: choice.message.content,
      usage: normalizeOpenRouterUsage(response.usage),
      model: model
    };
  }

  async streamFallback(fullPrompt: string): Promise<Response> {
    if (!this.config.openrouterApiKey) {
      throw new Error('OPENROUTER_API_KEY is not configured in .env');
    }

    const model = this.config.fallbackModel;
    if (!model) {
      throw new Error('FALLBACK_MODEL is not configured in .env');
    }

    const baseUrl = this.config.openrouterApiBase!.replace(/\/$/, '');
    let url = baseUrl;
    if (!url.includes('/chat/completions')) {
      if (!url.endsWith('/v1')) {
        url = `${url}/v1/chat/completions`;
      } else {
        url = `${url}/chat/completions`;
      }
    }

    console.log(`[ChatProvider] Streaming Fallback AI: ${url} (Model: ${model})`);
    return this.postStream(url, {
      model,
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
