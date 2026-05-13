export interface ParsedStreamData {
  content: string;
  model?: string;
  isDone: boolean;
}

/**
 * Stateful parser for Server-Sent Events (SSE) chunks from AI providers.
 * Handles partial lines split across multiple network chunks.
 */
export class ChatStreamParser {
  private buffer = '';

  /**
   * Parse a new chunk of data and return the accumulated content and metadata.
   */
  parse(chunk: string): ParsedStreamData {
    let content = '';
    let model: string | undefined = undefined;
    let isDone = false;

    // Add new chunk to buffer and split by lines
    this.buffer += chunk;
    const lines = this.buffer.split('\n');

    // Keep the last (potentially partial) line in the buffer
    this.buffer = lines.pop() || '';

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

          // 1. OpenAI / OpenRouter format
          if (data.choices?.[0]?.delta?.content) {
            content += data.choices[0].delta.content;
          } 
          // 2. Anthropic format
          else if (data.type === 'content_block_delta' && data.delta?.text) {
            content += data.delta.text;
          }
          // 3. Meta/Message format (OpenRouter usage, etc.)
          else if (data.choices?.[0]?.text) {
             content += data.choices[0].text;
          }
        } catch (e) {
          // JSON parse error usually means the line was somehow malformed 
          // but since we buffer full lines it should be rare.
        }
      }
    }

    return { content, model, isDone };
  }

  /**
   * Handle any remaining data in the buffer when the stream ends.
   */
  flush(): ParsedStreamData {
    const remaining = this.buffer;
    this.buffer = '';
    if (!remaining) return { content: '', isDone: true };
    
    // Attempt to parse the remaining bit if it looks like a data line
    if (remaining.startsWith('data: ')) {
      const dataStr = remaining.slice(6).trim();
      if (dataStr !== '[DONE]') {
        try {
          const data = JSON.parse(dataStr);
          const content = data.choices?.[0]?.delta?.content || (data.type === 'content_block_delta' ? data.delta?.text : '');
          return { content: content || '', model: data.model, isDone: true };
        } catch (e) {}
      }
    }
    
    return { content: '', isDone: true };
  }
}

/**
 * Non-stateful utility (for backward compatibility if needed, though stateful is better)
 */
export function parseChatStreamChunk(chunk: string): ParsedStreamData {
  const parser = new ChatStreamParser();
  return parser.parse(chunk + '\n'); // Append newline to force parsing the "chunk" as full lines
}