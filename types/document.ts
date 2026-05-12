export interface Document {
  id: number;
  user_id: number;
  filename: string;
  original_name: string;
  file_type: string;
  file_size: number;
  file_path: string | null;
  content: string | null;
  created_at: string;
}

export interface CreateDocumentInput {
  user_id: number;
  filename: string;
  original_name: string;
  file_type: string;
  file_size: number;
  file_path?: string;
  content?: string;
}
