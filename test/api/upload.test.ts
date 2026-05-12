import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { createTestDatabase, createTestUser } from '~/test/utils/database';
import { DocumentService } from '~~/server/services/document.service';
import Database from 'better-sqlite3';

// Mock getDatabase to use test database
vi.mock('~/server/db', () => ({
  getDatabase: vi.fn(() => testDb),
}));

// Mock pdf-parse
vi.mock('pdf-parse', () => ({
  default: vi.fn(() => Promise.resolve({ text: 'Mock PDF content' })),
}));

let testDb: Database.Database;

describe('Upload API - Document Service Tests', () => {
  beforeEach(() => {
    testDb = createTestDatabase();
    createTestUser(testDb, 'testuser', 'password123');
  });

  afterEach(() => {
    testDb?.close();
  });

  describe('File Type Validation', () => {
    it('should accept valid PDF file type', async () => {
      // Arrange
      const documentService = new DocumentService();
      const user = createTestUser(testDb, 'pdfuser', 'password123');

      const file = new File(['test content'], 'test.pdf', { type: 'application/pdf' });
      const buffer = Buffer.from('test content');

      // Act & Assert - should not throw
      const result = await documentService.uploadDocument(user.id, file, buffer);

      expect(result.id).toBeDefined();
      expect(result.fileType).toBe('application/pdf');
      expect(result.originalName).toBe('test.pdf');
    });

    it('should accept valid TXT file type', async () => {
      // Arrange
      const documentService = new DocumentService();
      const user = createTestUser(testDb, 'txtuser', 'password123');

      const file = new File(['test content'], 'test.txt', { type: 'text/plain' });
      const buffer = Buffer.from('test content');

      // Act
      const result = await documentService.uploadDocument(user.id, file, buffer);

      // Assert
      expect(result.id).toBeDefined();
      expect(result.fileType).toBe('text/plain');
      expect(result.originalName).toBe('test.txt');
    });

    it('should accept TXT by extension when MIME type is generic', async () => {
      // Arrange
      const documentService = new DocumentService();
      const user = createTestUser(testDb, 'txtuser2', 'password123');

      const file = new File(['test content'], 'test.txt', { type: 'application/octet-stream' });
      const buffer = Buffer.from('test content');

      // Act
      const result = await documentService.uploadDocument(user.id, file, buffer);

      // Assert
      expect(result.id).toBeDefined();
    });

    it('should reject invalid file type', async () => {
      // Arrange
      const documentService = new DocumentService();
      const user = createTestUser(testDb, 'invaliduser', 'password123');

      const file = new File(['test content'], 'test.exe', { type: 'application/exe' });
      const buffer = Buffer.from('test content');

      // Act & Assert
      await expect(documentService.uploadDocument(user.id, file, buffer))
        .rejects.toThrow('อนุญาตเฉพาะไฟล์ PDF และ TXT เท่านั้น');
    });
  });

  describe('File Size Validation', () => {
    it('should reject file larger than 5MB', async () => {
      // Arrange
      const documentService = new DocumentService();
      const user = createTestUser(testDb, 'largeuser', 'password123');

      const largeContent = 'x'.repeat(6 * 1024 * 1024); // 6MB
      const file = new File([largeContent], 'large.txt', { type: 'text/plain' });
      const buffer = Buffer.from(largeContent);

      // Act & Assert
      await expect(documentService.uploadDocument(user.id, file, buffer))
        .rejects.toThrow('ขนาดไฟล์ต้องไม่เกิน 5MB');
    });

    it('should accept file exactly 5MB', async () => {
      // Arrange
      const documentService = new DocumentService();
      const user = createTestUser(testDb, 'exactuser', 'password123');

      const exactContent = 'x'.repeat(5 * 1024 * 1024); // Exactly 5MB
      const file = new File([exactContent], 'exact.txt', { type: 'text/plain' });
      const buffer = Buffer.from(exactContent);

      // Act
      const result = await documentService.uploadDocument(user.id, file, buffer);

      // Assert
      expect(result.id).toBeDefined();
      expect(result.fileSize).toBe(5 * 1024 * 1024);
    });
  });

  describe('Filename Sanitization', () => {
    it('should sanitize filename with special characters', async () => {
      // Arrange
      const documentService = new DocumentService();
      const user = createTestUser(testDb, 'sanitizeuser', 'password123');

      const file = new File(['test'], 'test@#$%file.txt', { type: 'text/plain' });
      const buffer = Buffer.from('test');

      // Act
      const result = await documentService.uploadDocument(user.id, file, buffer);

      // Assert - filename should be sanitized (special chars removed, timestamp added)
      expect(result.filename).not.toContain('@');
      expect(result.filename).not.toContain('#');
      expect(result.filename).not.toContain('$');
      expect(result.filename).not.toContain('%');
      expect(result.filename).toMatch(/_\d+_/); // Should contain timestamp
    });

    it('should handle Thai characters in filename', async () => {
      // Arrange
      const documentService = new DocumentService();
      const user = createTestUser(testDb, 'thaiuser', 'password123');

      const file = new File(['test'], 'ทดสอบไฟล์.txt', { type: 'text/plain' });
      const buffer = Buffer.from('test');

      // Act
      const result = await documentService.uploadDocument(user.id, file, buffer);

      // Assert - Thai characters should be preserved
      expect(result.filename).toContain('ทดสอบไฟล์');
    });

    it('should replace spaces with underscores', async () => {
      // Arrange
      const documentService = new DocumentService();
      const user = createTestUser(testDb, 'spaceuser', 'password123');

      const file = new File(['test'], 'my test file.txt', { type: 'text/plain' });
      const buffer = Buffer.from('test');

      // Act
      const result = await documentService.uploadDocument(user.id, file, buffer);

      // Assert
      expect(result.filename).not.toContain(' ');
      expect(result.filename).toContain('my_test_file');
    });
  });

  describe('Content Extraction', () => {
    it('should extract text content from TXT file', async () => {
      // Arrange
      const documentService = new DocumentService();
      const user = createTestUser(testDb, 'txtcontent', 'password123');

      const content = 'This is test content for TXT file';
      const file = new File([content], 'test.txt', { type: 'text/plain' });
      const buffer = Buffer.from(content);

      // Act
      const result = await documentService.uploadDocument(user.id, file, buffer);

      // Assert
      expect(result.content).toBe(content);
    });

    it('should extract text content from PDF file', async () => {
      // Arrange
      const documentService = new DocumentService();
      const user = createTestUser(testDb, 'pdfcontent', 'password123');

      const pdfContent = 'Sample PDF content';
      const file = new File([pdfContent], 'test.pdf', { type: 'application/pdf' });
      const buffer = Buffer.from(pdfContent);

      // Act
      const result = await documentService.uploadDocument(user.id, file, buffer);

      // Assert
      expect(result.content).toBeDefined();
      expect(result.content).toBe('Mock PDF content');
    });
  });

  describe('Database Storage', () => {
    it('should save document to database', async () => {
      // Arrange
      const documentService = new DocumentService();
      const user = createTestUser(testDb, 'dbsave', 'password123');

      const file = new File(['test content'], 'test.txt', { type: 'text/plain' });
      const buffer = Buffer.from('test content');

      // Act
      const result = await documentService.uploadDocument(user.id, file, buffer);

      // Assert - verify in database
      const doc = testDb.prepare('SELECT * FROM documents WHERE id = ?').get(result.id);

      expect(doc).toBeDefined();
      expect(doc.user_id).toBe(user.id);
      expect(doc.original_name).toBe('test.txt');
      expect(doc.content).toBe('test content');
    });

    it('should associate document with correct user', async () => {
      // Arrange
      const documentService = new DocumentService();
      const user1 = createTestUser(testDb, 'user1', 'password123');
      const user2 = createTestUser(testDb, 'user2', 'password123');

      const file1 = new File(['content1'], 'file1.txt', { type: 'text/plain' });
      const buffer1 = Buffer.from('content1');

      const file2 = new File(['content2'], 'file2.txt', { type: 'text/plain' });
      const buffer2 = Buffer.from('content2');

      // Act
      await documentService.uploadDocument(user1.id, file1, buffer1);
      await documentService.uploadDocument(user2.id, file2, buffer2);

      // Assert
      const user1Docs = testDb.prepare('SELECT * FROM documents WHERE user_id = ?').all(user1.id);
      const user2Docs = testDb.prepare('SELECT * FROM documents WHERE user_id = ?').all(user2.id);

      expect(user1Docs.length).toBe(1); // 1 from this test (new users have no docs from setup)
      expect(user2Docs.length).toBe(1);
      expect(user1Docs.find((d: any) => d.original_name === 'file1.txt')).toBeDefined();
      expect(user2Docs.find((d: any) => d.original_name === 'file2.txt')).toBeDefined();
    });
  });

  describe('Document Retrieval', () => {
    it('should get user documents', async () => {
      // Arrange
      const documentService = new DocumentService();
      const user = createTestUser(testDb, 'getuser', 'password123');

      // Upload a document first
      const file = new File(['test content'], 'test.txt', { type: 'text/plain' });
      const buffer = Buffer.from('test content');
      await documentService.uploadDocument(user.id, file, buffer);

      // Act
      const documents = documentService.getUserDocuments(user.id);

      // Assert
      expect(Array.isArray(documents)).toBe(true);
      expect(documents.length).toBeGreaterThan(0);
    });

    it('should get document by ID with ownership check', async () => {
      // Arrange
      const documentService = new DocumentService();
      const user = createTestUser(testDb, 'owner', 'password123');

      const file = new File(['owned content'], 'owned.txt', { type: 'text/plain' });
      const buffer = Buffer.from('owned content');

      const uploaded = await documentService.uploadDocument(user.id, file, buffer);

      // Act
      const found = documentService.getDocument(uploaded.id, user.id);

      // Assert
      expect(found).toBeDefined();
      expect(found?.original_name).toBe('owned.txt');
    });

    it('should return undefined for non-existent document', () => {
      // Arrange
      const documentService = new DocumentService();
      const user = createTestUser(testDb, 'nobody', 'password123');

      // Act
      const found = documentService.getDocument(99999, user.id);

      // Assert
      expect(found).toBeUndefined();
    });

    it('should return undefined when accessing another user document', async () => {
      // Arrange
      const documentService = new DocumentService();
      const user1 = createTestUser(testDb, 'owner1', 'password123');
      const user2 = createTestUser(testDb, 'other', 'password123');

      const file = new File(['private'], 'private.txt', { type: 'text/plain' });
      const buffer = Buffer.from('private');

      const uploaded = await documentService.uploadDocument(user1.id, file, buffer);

      // Act - try to access user1's document as user2
      const found = documentService.getDocument(uploaded.id, user2.id);

      // Assert
      expect(found).toBeUndefined();
    });
  });

  describe('Document Deletion', () => {
    it('should delete own document', async () => {
      // Arrange
      const documentService = new DocumentService();
      const user = createTestUser(testDb, 'deleter', 'password123');

      const file = new File(['to delete'], 'delete.txt', { type: 'text/plain' });
      const buffer = Buffer.from('to delete');

      const uploaded = await documentService.uploadDocument(user.id, file, buffer);

      // Act
      const deleted = documentService.deleteDocument(uploaded.id, user.id);

      // Assert
      expect(deleted).toBe(true);

      const found = documentService.getDocument(uploaded.id, user.id);
      expect(found).toBeUndefined();
    });

    it('should not delete another user document', async () => {
      // Arrange
      const documentService = new DocumentService();
      const user1 = createTestUser(testDb, 'owner1', 'password123');
      const user2 = createTestUser(testDb, 'hacker', 'password123');

      const file = new File(['protected'], 'protected.txt', { type: 'text/plain' });
      const buffer = Buffer.from('protected');

      const uploaded = await documentService.uploadDocument(user1.id, file, buffer);

      // Act - try to delete user1's document as user2
      const deleted = documentService.deleteDocument(uploaded.id, user2.id);

      // Assert
      expect(deleted).toBe(false);

      const found = documentService.getDocument(uploaded.id, user1.id);
      expect(found).toBeDefined();
    });
  });

  describe('Document Count', () => {
    it('should count documents per user', () => {
      // Arrange
      const documentService = new DocumentService();
      const user = createTestUser(testDb, 'counter', 'password123');

      // Act
      const count = documentService.getDocumentCount(user.id);

      // Assert
      expect(typeof count).toBe('number');
      expect(count).toBeGreaterThanOrEqual(0);
    });
  });
});
