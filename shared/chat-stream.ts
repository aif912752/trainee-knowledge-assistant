export interface ParsedStreamData {
  content: string;
  model?: string;
  isDone: boolean;
}

/**
 * Utility to parse Server-Sent Events (SSE) chunks from both OpenAI and Anthropic formats.
 * Shared between backend and frontend to avoid duplication.
 */
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