export interface Document {
  id: number;
  user_id: number;
  filename: string;
  original_name: string;
  file_type: string;
  file_size: number;
  content: string | null;
  created_at: string;
}

export interface CreateDocumentInput {
  user_id: number;
  filename: string;
  original_name: string;
  file_type: string;
  file_size: number;
  content?: string;
}
