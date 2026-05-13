export interface ParsedStreamData {
  content: string;
  model?: string;
  usage?: { output: number };
  isDone: boolean;
  error?: {
    message: string;
    code?: string | number;
  };
}

/**
 * Utility to parse Server-Sent Events (SSE) chunks from both OpenAI and Anthropic formats.
 * Shared between backend and frontend to avoid duplication.
 */
// Deprecated: แนะนำให้ใช้ ChatStreamParser แทนเพื่อรองรับ Stateful Buffering
export function parseChatStreamChunk(chunk: string): ParsedStreamData {
  const parser = new ChatStreamParser();
  return parser.parse(chunk);
}

/**
 * Stateful Chat Stream Parser with built-in buffering.
 * Prevents data loss when SSE chunks are fragmented over the network.
 */
export class ChatStreamParser {
  private buffer: string = '';
  private lastEvent: string = '';

  parse(chunk: string): ParsedStreamData {
    this.buffer += chunk;
    const lines = this.buffer.split('\n');
    this.buffer = lines.pop() || ''; // Keep the last incomplete line in buffer

    return this.processLines(lines);
  }

  flush(): ParsedStreamData {
    const result = this.processLines([this.buffer]);
    this.buffer = '';
    return result;
  }

  private processLines(lines: string[]): ParsedStreamData {
    let content = '';
    let model: string | undefined = undefined;
    let usage: { output: number } | undefined = undefined;
    let isDone = false;
    let error: ParsedStreamData['error'] = undefined;

    for (const line of lines) {
      const trimmedLine = line.trim();
      if (!trimmedLine) continue;

      if (trimmedLine.startsWith('event: ')) {
        this.lastEvent = trimmedLine.slice(7).trim();
        continue;
      }

      if (trimmedLine.startsWith('data: ')) {
        const dataStr = trimmedLine.slice(6).trim();
        
        if (dataStr === '[DONE]') {
          isDone = true;
          continue;
        }

        try {
          const data = JSON.parse(dataStr);
          
          // Handle explicit error from provider
          if (data.error || this.lastEvent === 'error') {
            const errorObj = data.error || data;
            error = {
              message: errorObj.message || 'Unknown AI error',
              code: errorObj.code
            };
            continue;
          }

          if (data.model) model = data.model;
          
          // Capture token usage if available in the stream
          if (data.usage && data.usage.completion_tokens) {
            usage = { output: data.usage.completion_tokens }; // OpenAI format
          } else if (data.type === 'message_delta' && data.usage?.output_tokens !== undefined) {
            usage = { output: data.usage.output_tokens }; // Anthropic format
          }

          if (data.choices?.[0]?.delta?.content) {
            content += data.choices[0].delta.content; // OpenAI format
          } else if (data.type === 'content_block_delta' && data.delta?.text) {
            content += data.delta.text; // Anthropic format
          }
        } catch (e) {
          // Ignore JSON parse errors for incomplete chunks
        }
      }
    }

    return { content, model, usage, isDone, error };
  }
}
