import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { DocumentRepository } from '~/server/repositories/document.repository';
import { createTestDatabase, createTestUser } from '~/test/utils/database';
import Database from 'better-sqlite3';

describe('DocumentRepository', () => {
  let db: Database.Database;
  let repository: DocumentRepository;
  let userId: number;

  beforeEach(() => {
    db = createTestDatabase();
    repository = new DocumentRepository(db);
    const user = createTestUser(db);
    userId = user.id;
  });

  afterEach(() => {
    db.close();
  });

  describe('findByUserId', () => {
    it('should return empty array when user has no documents', () => {
      // Act
      const documents = repository.findByUserId(userId);

      // Assert
      expect(documents).toEqual([]);
    });

    it('should return all documents for user ordered by created_at DESC', () => {
      // Arrange
      repository.create({
        user_id: userId,
        filename: 'doc1.txt',
        original_name: 'doc1.txt',
        file_type: 'text/plain',
        file_size: 100,
        content: 'content1'
      });
      repository.create({
        user_id: userId,
        filename: 'doc2.txt',
        original_name: 'doc2.txt',
        file_type: 'text/plain',
        file_size: 200,
        content: 'content2'
      });

      // Act
      const documents = repository.findByUserId(userId);

      // Assert
      expect(documents).toHaveLength(2);
      const filenames = documents.map(d => d.filename);
      expect(filenames).toContain('doc1.txt');
      expect(filenames).toContain('doc2.txt');
    });

    it('should not return documents from other users', () => {
      // Arrange
      const otherUser = createTestUser(db, 'otheruser');
      repository.create({
        user_id: userId,
        filename: 'mydoc.txt',
        original_name: 'mydoc.txt',
        file_type: 'text/plain',
        file_size: 100,
        content: 'mycontent'
      });
      repository.create({
        user_id: otherUser.id,
        filename: 'otherdoc.txt',
        original_name: 'otherdoc.txt',
        file_type: 'text/plain',
        file_size: 100,
        content: 'othercontent'
      });

      // Act
      const documents = repository.findByUserId(userId);

      // Assert
      expect(documents).toHaveLength(1);
      expect(documents[0].filename).toBe('mydoc.txt');
    });
  });

  describe('findById', () => {
    it('should return document when id exists', () => {
      // Arrange
      const created = repository.create({
        user_id: userId,
        filename: 'test.txt',
        original_name: 'test.txt',
        file_type: 'text/plain',
        file_size: 100,
        content: 'test content'
      });

      // Act
      const document = repository.findById(created.id);

      // Assert
      expect(document).toBeDefined();
      expect(document?.id).toBe(created.id);
      expect(document?.filename).toBe('test.txt');
    });

    it('should return undefined when id does not exist', () => {
      // Act
      const document = repository.findById(999);

      // Assert
      expect(document).toBeUndefined();
    });
  });

  describe('findByIdAndUserId', () => {
    it('should return document when id and userId match', () => {
      // Arrange
      const created = repository.create({
        user_id: userId,
        filename: 'test.txt',
        original_name: 'test.txt',
        file_type: 'text/plain',
        file_size: 100,
        content: 'test content'
      });

      // Act
      const document = repository.findByIdAndUserId(created.id, userId);

      // Assert
      expect(document).toBeDefined();
      expect(document?.id).toBe(created.id);
    });

    it('should return undefined when document belongs to different user', () => {
      // Arrange
      const created = repository.create({
        user_id: userId,
        filename: 'test.txt',
        original_name: 'test.txt',
        file_type: 'text/plain',
        file_size: 100,
        content: 'test content'
      });

      // Act
      const document = repository.findByIdAndUserId(created.id, 999);

      // Assert
      expect(document).toBeUndefined();
    });
  });

  describe('create', () => {
    it('should create new document and return it', () => {
      // Act
      const document = repository.create({
        user_id: userId,
        filename: 'newdoc.pdf',
        original_name: 'original.pdf',
        file_type: 'application/pdf',
        file_size: 1024,
        content: 'pdf content'
      });

      // Assert
      expect(document).toBeDefined();
      expect(document.id).toBeDefined();
      expect(document.filename).toBe('newdoc.pdf');
      expect(document.original_name).toBe('original.pdf');
      expect(document.file_type).toBe('application/pdf');
      expect(document.file_size).toBe(1024);
      expect(document.content).toBe('pdf content');
    });

    it('should create document without content', () => {
      // Act
      const document = repository.create({
        user_id: userId,
        filename: 'empty.txt',
        original_name: 'empty.txt',
        file_type: 'text/plain',
        file_size: 0
      });

      // Assert
      expect(document).toBeDefined();
      expect(document.content).toBeNull();
    });
  });

  describe('delete', () => {
    it('should delete document and return true', () => {
      // Arrange
      const created = repository.create({
        user_id: userId,
        filename: 'todelete.txt',
        original_name: 'todelete.txt',
        file_type: 'text/plain',
        file_size: 100,
        content: 'delete me'
      });

      // Act
      const deleted = repository.delete(created.id, userId);

      // Assert
      expect(deleted).toBe(true);
      const document = repository.findById(created.id);
      expect(document).toBeUndefined();
    });

    it('should return false when document does not exist', () => {
      // Act
      const deleted = repository.delete(999, userId);

      // Assert
      expect(deleted).toBe(false);
    });

    it('should return false when document belongs to different user', () => {
      // Arrange
      const otherUser = createTestUser(db, 'otheruser');
      const created = repository.create({
        user_id: otherUser.id,
        filename: 'other.txt',
        original_name: 'other.txt',
        file_type: 'text/plain',
        file_size: 100,
        content: 'content'
      });

      // Act
      const deleted = repository.delete(created.id, userId);

      // Assert
      expect(deleted).toBe(false);
    });
  });

  describe('countByUserId', () => {
    it('should return 0 when user has no documents', () => {
      // Act
      const count = repository.countByUserId(userId);

      // Assert
      expect(count).toBe(0);
    });

    it('should return correct count of user documents', () => {
      // Arrange
      const otherUser = createTestUser(db, 'otheruser');
      repository.create({
        user_id: userId,
        filename: 'doc1.txt',
        original_name: 'doc1.txt',
        file_type: 'text/plain',
        file_size: 100,
        content: 'content1'
      });
      repository.create({
        user_id: userId,
        filename: 'doc2.txt',
        original_name: 'doc2.txt',
        file_type: 'text/plain',
        file_size: 100,
        content: 'content2'
      });
      repository.create({
        user_id: otherUser.id,
        filename: 'other.txt',
        original_name: 'other.txt',
        file_type: 'text/plain',
        file_size: 100,
        content: 'other content'
      });

      // Act
      const count = repository.countByUserId(userId);

      // Assert
      expect(count).toBe(2);
    });
  });
});
