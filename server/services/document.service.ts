import { DocumentRepository } from '~~/server/repositories/document.repository';
import { getDatabase } from '~~/server/db';
import type { CreateDocumentInput } from '~~/types/document';

// Allowed file types
const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'text/plain',
  'text/plain; charset=utf-8',
];

// Max file size: 5MB
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB in bytes

export class FileValidationError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = 'FileValidationError';
  }
}

export class DocumentService {
  private documentRepository: DocumentRepository;

  constructor() {
    const db = getDatabase();
    this.documentRepository = new DocumentRepository(db);
  }

  /**
   * Validate file type
   */
  private validateFileType(fileType: string, originalName: string): void {
    // Check by MIME type
    if (ALLOWED_FILE_TYPES.includes(fileType)) {
      return;
    }

    // Also check by file extension for better compatibility
    const ext = originalName.toLowerCase().split('.').pop();
    if (ext === 'pdf' || ext === 'txt') {
      return;
    }

    throw new FileValidationError(
      'อนุญาตเฉพาะไฟล์ PDF และ TXT เท่านั้น',
      'INVALID_FILE_TYPE'
    );
  }

  /**
   * Validate file size
   */
  private validateFileSize(fileSize: number): void {
    if (fileSize > MAX_FILE_SIZE) {
      throw new FileValidationError(
        `ขนาดไฟล์ต้องไม่เกิน 5MB (ไฟล์ของคุณ: ${(fileSize / 1024 / 1024).toFixed(2)}MB)`,
        'FILE_TOO_LARGE'
      );
    }
  }

  /**
   * Sanitize filename
   * - Remove special characters
   * - Replace spaces with underscores
   * - Add timestamp to prevent conflicts
   */
  sanitizeFilename(originalName: string): string {
    // Get file extension
    const parts = originalName.split('.');
    const ext = parts.length > 1 ? parts.pop() : '';
    const nameWithoutExt = parts.join('.');

    // Remove special characters, keep only alphanumeric, spaces, hyphens, underscores (Thai, Chinese, etc.)
    const sanitized = nameWithoutExt
      .replace(/[^a-zA-Z0-9\u0E00-\u0E7F\u4E00-\u9FFF\s\-_]/g, '')
      .trim()
      .replace(/\s+/g, '_');

    // Add timestamp
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 8);

    return `${sanitized}_${timestamp}_${randomStr}.${ext}`;
  }

  /**
   * Extract text from PDF buffer
   */
  private async extractPDFText(buffer: Buffer): Promise<string> {
    try {
      // Use dynamic import and handle default export manually for pdf-parse compatibility
      const pdf = await import('pdf-parse');
      const parse = (pdf.default || pdf) as any;
      const data = await parse(buffer);
      return data.text;
    } catch (error) {
      throw new FileValidationError(
        'ไม่สามารถอ่านไฟล์ PDF ได้ กรุณาลองไฟล์อื่น',
        'PDF_PARSE_ERROR'
      );
    }
  }

  /**
   * Read text from TXT buffer
   */
  private async readTXTText(buffer: Buffer): Promise<string> {
    try {
      return buffer.toString('utf-8');
    } catch (error) {
      throw new FileValidationError(
        'ไม่สามารถอ่านไฟล์ TXT ได้',
        'TXT_READ_ERROR'
      );
    }
  }

  /**
   * Extract content from file based on type
   */
  async extractContent(file: File, buffer: Buffer): Promise<string> {
    const fileType = file.type;
    const originalName = file.name;

    // Determine file type by extension if MIME type is generic
    const ext = originalName.toLowerCase().split('.').pop();

    if (fileType === 'application/pdf' || ext === 'pdf') {
      return await this.extractPDFText(buffer);
    }

    if (fileType === 'text/plain' || ext === 'txt') {
      return await this.readTXTText(buffer);
    }

    throw new FileValidationError(
      'ไม่รองรับประเภทไฟล์นี้สำหรับการดึงเนื้อหา',
      'UNSUPPORTED_CONTENT_TYPE'
    );
  }

  /**
   * Upload and save document
   */
  async uploadDocument(
    userId: number,
    file: File,
    buffer: Buffer
  ): Promise<{ id: number; filename: string; originalName: string; fileType: string; fileSize: number; content?: string }> {
    // Validate file type
    this.validateFileType(file.type, file.name);

    // Validate file size
    this.validateFileSize(file.size);

    // Sanitize filename
    const sanitizedFilename = this.sanitizeFilename(file.name);

    // Extract content
    const content = await this.extractContent(file, buffer);

    // Create document record
    const document = this.documentRepository.create({
      user_id: userId,
      filename: sanitizedFilename,
      original_name: file.name,
      file_type: file.type || this.getMimeTypeFromExtension(file.name),
      file_size: file.size,
      content: content,
    });

    return {
      id: document.id,
      filename: document.filename,
      originalName: document.original_name,
      fileType: document.file_type,
      fileSize: document.file_size,
      content: document.content || undefined,
    };
  }

  /**
   * Get MIME type from file extension
   */
  private getMimeTypeFromExtension(filename: string): string {
    const ext = filename.toLowerCase().split('.').pop();
    const mimeTypes: Record<string, string> = {
      'pdf': 'application/pdf',
      'txt': 'text/plain',
    };
    return mimeTypes[ext || ''] || 'application/octet-stream';
  }

  /**
   * Get user documents
   */
  getUserDocuments(userId: number) {
    return this.documentRepository.findByUserId(userId);
  }

  /**
   * Get document by ID (with ownership check)
  */
  getDocument(id: number, userId: number) {
    return this.documentRepository.findByIdAndUserId(id, userId);
  }

  /**
   * Delete document
   */
  deleteDocument(id: number, userId: number): boolean {
    return this.documentRepository.delete(id, userId);
  }

  /**
   * Get document count
   */
  getDocumentCount(userId: number): number {
    return this.documentRepository.countByUserId(userId);
  }
}
