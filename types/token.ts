export interface TokenUsage {
  id: number;
  user_id: number;
  session_id: string;
  tokens: number;
  created_at: string;
}

export interface CreateTokenUsageInput {
  user_id: number;
  session_id: string;
  tokens: number;
}

export interface SessionTokenSummary {
  session_id: string;
  total_tokens: number;
}
