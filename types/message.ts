export interface Message {
  id: number;
  user_id: number;
  document_id: number | null;
  role: 'user' | 'assistant';
  content: string;
  tokens: number;
  model: string | null;
  created_at: string;
}

export interface CreateMessageInput {
  user_id: number;
  document_id?: number;
  role: 'user' | 'assistant';
  content: string;
  tokens?: number;
  model?: string;
}
