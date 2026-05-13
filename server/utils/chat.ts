import type { Document } from '~~/types/document';
import type { AiTokenUsage } from '~~/shared/tokens';

export const CHAT_SYSTEM_PROMPT =
  'คุณคือผู้ช่วยอัจฉริยะ (Knowledge Assistant) ที่ช่วยตอบคำถามจากข้อมูลที่ได้รับ โปรดตอบคำถามให้ชัดเจน สุภาพ และเป็นกันเอง';

export const MAX_DOCUMENT_CONTEXT_LENGTH = 10000;
export const DOCUMENT_TRUNCATED_NOTICE = '... [เนื้อหาถูกตัดเนื่องจากยาวเกินไป]';

export function truncateDocumentContent(content: string): string {
  if (content.length <= MAX_DOCUMENT_CONTEXT_LENGTH) {
    return content;
  }

  return `${content.slice(0, MAX_DOCUMENT_CONTEXT_LENGTH)}\n${DOCUMENT_TRUNCATED_NOTICE}`;
}

export function buildDocumentContext(document: Pick<Document, 'original_name' | 'content'>): string {
  if (!document.content) {
    return '';
  }

  const content = truncateDocumentContent(document.content);

  return `เนื้อหาจากไฟล์เอกสาร (${document.original_name}):\n\n${content}\n\n---จบเนื้อหาจากไฟล์---\n\n`;
}

export function buildChatPrompt(message: string, documentContext: string = ''): string {
  return documentContext ? `${documentContext}คำถาม: ${message}` : message;
}

export function normalizeZaiUsage(usage: any): AiTokenUsage {
  const input = Number(usage?.input_tokens || 0);
  const output = Number(usage?.output_tokens || 0);

  return {
    input,
    output,
    total: input + output,
  };
}

export function normalizeOpenRouterUsage(usage: any): AiTokenUsage {
  const input = Number(usage?.prompt_tokens || 0);
  const output = Number(usage?.completion_tokens || 0);

  return {
    input,
    output,
    total: Number(usage?.total_tokens || input + output),
  };
}




