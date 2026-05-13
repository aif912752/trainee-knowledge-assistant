import { DocumentRepository } from '~~/server/repositories/document.repository';
import type { Document } from '~~/types/document';
import type { H3Event } from 'h3';
import formidable from 'formidable';
import { renameSync, readFileSync, mkdirSync, existsSync, copyFileSync, unlinkSync } from 'fs';
import { join } from 'path';
import { createRequire } from 'module';
import { pathToFileURL } from 'url';
import { ValidationError, InternalServerError } from '~~/shared/errors';

const require = createRequire(import.meta.url);

// Allowed file types
const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'text/plain',
  'text/plain; charset=utf-8',
];

// Max file size: 5MB
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB in bytes

// Uploads directory
interface PdfTextItem {
  str: string;
  transform: number[];
  width: number;
  height: number;
}

interface UploadDocumentResult {
  id: number;
  filename: string;
  originalName: string;
  fileType: string;
  fileSize: number;
  filePath: string | undefined;
  content: string | undefined;
}

const UPLOAD_DIR = join(process.cwd(), 'storage/uploads');

export class DocumentService {
  private documentRepository: DocumentRepository;

  constructor(documentRepo: DocumentRepository) {
    this.documentRepository = documentRepo;

    // Ensure upload directory exists
    if (!existsSync(UPLOAD_DIR)) {
      mkdirSync(UPLOAD_DIR, { recursive: true });
    }
  }

  /**
   * Parse multipart request using formidable
   */
  async parseMultipartRequest(event: H3Event): Promise<{ fields: formidable.Fields, files: formidable.Files }> {
    const form = formidable({
      maxFileSize: MAX_FILE_SIZE,
      multiples: false,
    });

    return new Promise((resolve, reject) => {
      form.parse(event.node.req, (err, fields, files) => {
        if (err) {
          if (err.message.includes('maxFileSize exceeded')) {
            reject(new ValidationError('ขนาดไฟล์ต้องไม่เกิน 5MB', 'FILE_TOO_LARGE'));
          } else {
            reject(new InternalServerError(
              'เกิดข้อผิดพลาดในการประมวลผลไฟล์อัปโหลด',
              'UPLOAD_PARSE_ERROR'
            ));
          }
          return;
        }
        resolve({ fields, files });
      });

      // In some environments (like Nuxt/Nitro), we might need to resume the request stream
      // if it was paused by some middleware (like nuxt-security).
      event.node.req.resume();
    });
  }

  /**
   * Validate file type
   */
  private validateFileType(fileType: string | null, originalName: string | null): void {
    const name = originalName || '';
    const type = fileType || '';

    // Check by MIME type
    if (ALLOWED_FILE_TYPES.includes(type)) {
      return;
    }

    // Also check by file extension for better compatibility
    const ext = name.toLowerCase().split('.').pop();
    if (ext === 'pdf' || ext === 'txt') {
      return;
    }

    throw new ValidationError(
      'อนุญาตเฉพาะไฟล์ PDF และ TXT เท่านั้น',
      'INVALID_FILE_TYPE'
    );
  }

  /**
   * Sanitize filename
   */
  sanitizeFilename(originalName: string): string {
    const parts = originalName.split('.');
    const ext = parts.length > 1 ? parts.pop() : '';
    const nameWithoutExt = parts.join('.');

    const sanitized = nameWithoutExt
      .replace(/[^a-zA-Z0-9\u0E00-\u0E7F\u4E00-\u9FFF\s\-_]/g, '')
      .trim()
      .replace(/\s+/g, '_');

    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 8);

    return `${sanitized}_${timestamp}_${randomStr}.${ext}`;
  }

  /**
   * Extract text from PDF buffer using pdfjs-dist directly
   */
  private async extractPDFText(buffer: Buffer): Promise<string> {
    const startTime = Date.now();
    try {
      console.log('📄 Starting PDF text extraction...');
      const pdfjsPath = require.resolve('pdfjs-dist/legacy/build/pdf.mjs');
      const pdfjs = await import(pathToFileURL(pdfjsPath).href);
      
      const workerPath = require.resolve('pdfjs-dist/legacy/build/pdf.worker.mjs');
      pdfjs.GlobalWorkerOptions.workerSrc = pathToFileURL(workerPath).href;
      
      const uint8Array = new Uint8Array(buffer);
      const loadingTask = pdfjs.getDocument({
        data: uint8Array,
        useSystemFonts: true,
        disableFontFace: true,
        isEvalSupported: false,
        useWorkerFetch: false,
      });
      
      const pdf = await loadingTask.promise;
      console.log(`📄 PDF loaded: ${pdf.numPages} pages found.`);
      let fullText = '';
      
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item: PdfTextItem) => item.str)
          .join(' ');
        fullText += pageText + '\n';
        
        if (i % 10 === 0) console.log(`📄 Extracted ${i}/${pdf.numPages} pages...`);
      }
      
      const duration = Date.now() - startTime;
      console.log(`✅ PDF extraction completed in ${duration}ms`);
      return fullText.trim();
    } catch (error) {
      console.error('PDF extraction error (pdfjs):', error);
      throw new ValidationError(
        'ไม่สามารถอ่านไฟล์ PDF ได้ กรุณาลองไฟล์อื่น',
        'PDF_PARSE_ERROR'
      );
    }
  }

  /**
   * Read text from TXT buffer
   */
  private async readTXTText(buffer: Buffer): Promise<string> {
    const startTime = Date.now();
    try {
      const text = buffer.toString('utf-8');
      console.log(`✅ TXT extraction completed in ${Date.now() - startTime}ms`);
      return text;
    } catch (error) {
      throw new ValidationError(
        'ไม่สามารถอ่านไฟล์ TXT ได้',
        'TXT_READ_ERROR'
      );
    }
  }

  /**
   * Extract content from file path based on extension
   */
  async extractContent(filePath: string, mimeType: string, originalName: string): Promise<string> {
    console.log(`🔍 Extracting content from: ${originalName} (${mimeType})`);
    const buffer = readFileSync(filePath);
    const ext = originalName.toLowerCase().split('.').pop();

    if (mimeType === 'application/pdf' || ext === 'pdf') {
      return await this.extractPDFText(buffer);
    }

    if (mimeType === 'text/plain' || ext === 'txt') {
      return await this.readTXTText(buffer);
    }

    throw new ValidationError(
      'ไม่รองรับประเภทไฟล์นี้สำหรับการดึงเนื้อหา',
      'UNSUPPORTED_CONTENT_TYPE'
    );
  }

  /**
   * Upload and save document
   */
  async uploadDocument(
    userId: number,
    formidableFile: formidable.File
  ): Promise<UploadDocumentResult> {
    const overallStartTime = Date.now();
    const originalName = formidableFile.originalFilename || 'unknown';
    const mimeType = formidableFile.mimetype || 'application/octet-stream';
    const fileSize = formidableFile.size;
    const tempPath = formidableFile.filepath;

    console.log(`🚀 Starting upload process for: ${originalName}`);

    // Validate file type
    this.validateFileType(mimeType, originalName);

    // Sanitize filename for storage
    const sanitizedFilename = this.sanitizeFilename(originalName);
    const targetPath = join(UPLOAD_DIR, sanitizedFilename);

    // Move file from temp to uploads directory
    console.log('📁 Moving file to storage...');
    try {
      renameSync(tempPath, targetPath);
    } catch (err: any) {
      if (err.code === 'EXDEV') {
        console.log('🔄 Cross-device link detected, using copy + unlink instead');
        try {
          copyFileSync(tempPath, targetPath);
          unlinkSync(tempPath);
        } catch (copyErr) {
          throw new InternalServerError('ไม่สามารถคัดลอกไฟล์ไปยังพื้นที่จัดเก็บได้', 'FILE_COPY_ERROR');
        }
      } else {
        throw new InternalServerError('ไม่สามารถบันทึกไฟล์ได้', 'FILE_SAVE_ERROR');
      }
    }

    // Extract content from the saved file
    const content = await this.extractContent(targetPath, mimeType, originalName);

    // Create document record in database
    console.log('💾 Saving record to database...');
    const document = this.documentRepository.create({
      user_id: userId,
      filename: sanitizedFilename,
      original_name: originalName,
      file_type: mimeType,
      file_size: fileSize,
      file_path: targetPath,
      content: content,
    });

    const totalDuration = Date.now() - overallStartTime;
    console.log(`✨ Total upload and processing completed in ${totalDuration}ms`);

    return {
      id: document.id,
      filename: document.filename,
      originalName: document.original_name,
      fileType: document.file_type,
      fileSize: document.file_size,
      filePath: document.file_path || undefined,
      content: document.content || undefined,
    };
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
