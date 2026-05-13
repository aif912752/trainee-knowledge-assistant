/**
 * Shared token estimation utility
 * Conservative rule of thumb: ~3 characters per token average (English + Thai)
 */
export function estimateTokens(text: string): number {
  if (!text) return 0;
  return Math.ceil(text.length / 3);
}

export interface AiTokenUsage {
  input: number;
  output: number;
  total: number;
}

export function estimateAiUsage(input: string, output: string): AiTokenUsage {
  const inputTokens = estimateTokens(input);
  const outputTokens = estimateTokens(output);
  return {
    input: inputTokens,
    output: outputTokens,
    total: inputTokens + outputTokens
  };
}


