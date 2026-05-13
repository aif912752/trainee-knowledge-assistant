export interface ParsedStreamData {
  content: string;
  model?: string;
  usage?: { output: number };
  isDone: boolean;
}

/**
 * Utility to parse Server-Sent Events (SSE) chunks from both OpenAI and Anthropic formats.
 * Shared between backend and frontend to avoid duplication.
 */
// Deprecated: แนะนำให้ใช้ ChatStreamParser แทนเพื่อรองรับ Stateful Buffering
export function parseChatStreamChunk(chunk: string): ParsedStreamData {
  let content = '';
  let model: string | undefined = undefined;
  let isDone = false;

  const lines = chunk.split('\n');
  for (const line of lines) {
    const trimmedLine = line.trim();
    if (!trimmedLine) continue;

    if (trimmedLine.startsWith('data: ')) {
      const dataStr = trimmedLine.slice(6).trim();
      if (dataStr === '[DONE]') {
        isDone = true;
        continue;
      }

      try {
        const data = JSON.parse(dataStr);
        if (data.model) model = data.model;

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

  return { content, model, isDone };
}

/**
 * Stateful Chat Stream Parser with built-in buffering.
 * Prevents data loss when SSE chunks are fragmented over the network.
 */
export class ChatStreamParser {
  private buffer: string = '';

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

    for (const line of lines) {
      const trimmedLine = line.trim();
      if (!trimmedLine) continue;

      if (trimmedLine.startsWith('data: ')) {
        const dataStr = trimmedLine.slice(6).trim();
        if (dataStr === '[DONE]') {
          isDone = true;
          continue;
        }

        try {
          const data = JSON.parse(dataStr);
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

    return { content, model, usage, isDone };
  }
}
