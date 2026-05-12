import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { MessageRepository } from '~/server/repositories/message.repository';
import { createTestDatabase, createTestUser, createTestDocument } from '~/test/utils/database';
import Database from 'better-sqlite3';

describe('MessageRepository', () => {
  let db: Database.Database;
  let repository: MessageRepository;
  let userId: number;

  beforeEach(() => {
    db = createTestDatabase();
    repository = new MessageRepository(db);
    const user = createTestUser(db);
    userId = user.id;
  });

  afterEach(() => {
    db.close();
  });

  describe('findByUserId', () => {
    it('should return empty array when user has no messages', () => {
      // Act
      const messages = repository.findByUserId(userId);

      // Assert
      expect(messages).toEqual([]);
    });

    it('should return all messages for user ordered by created_at ASC', () => {
      // Arrange
      repository.create({
        user_id: userId,
        role: 'user',
        content: 'Hello',
        tokens: 5
      });
      repository.create({
        user_id: userId,
        role: 'assistant',
        content: 'Hi there!',
        tokens: 8
      });

      // Act
      const messages = repository.findByUserId(userId);

      // Assert
      expect(messages).toHaveLength(2);
      expect(messages[0].role).toBe('user'); // Oldest first
      expect(messages[1].role).toBe('assistant');
    });
  });

  describe('findByUserIdAndDocumentId', () => {
    it('should return messages for specific document', () => {
      // Arrange
      const document = createTestDocument(db, userId, 'doc content');
      repository.create({
        user_id: userId,
        document_id: document.id,
        role: 'user',
        content: 'Question about doc',
        tokens: 10
      });
      repository.create({
        user_id: userId,
        document_id: null,
        role: 'user',
        content: 'General question',
        tokens: 5
      });

      // Act
      const messages = repository.findByUserIdAndDocumentId(userId, document.id);

      // Assert
      expect(messages).toHaveLength(1);
      expect(messages[0].content).toBe('Question about doc');
    });
  });

  describe('findRecentByUserId', () => {
    it('should return recent messages limited by default', () => {
      // Arrange
      for (let i = 0; i < 60; i++) {
        repository.create({
          user_id: userId,
          role: 'user',
          content: `Message ${i}`,
          tokens: i
        });
      }

      // Act
      const messages = repository.findRecentByUserId(userId);

      // Assert
      expect(messages).toHaveLength(50);
    });

    it('should respect custom limit', () => {
      // Arrange
      for (let i = 0; i < 10; i++) {
        repository.create({
          user_id: userId,
          role: 'user',
          content: `Message ${i}`,
          tokens: i
        });
      }

      // Act
      const messages = repository.findRecentByUserId(userId, 5);

      // Assert
      expect(messages).toHaveLength(5);
    });
  });

  describe('create', () => {
    it('should create new message and return it', () => {
      // Act
      const message = repository.create({
        user_id: userId,
        role: 'user',
        content: 'Test message',
        tokens: 15
      });

      // Assert
      expect(message).toBeDefined();
      expect(message.id).toBeDefined();
      expect(message.role).toBe('user');
      expect(message.content).toBe('Test message');
      expect(message.tokens).toBe(15);
      expect(message.document_id).toBeNull();
    });

    it('should create message with document_id', () => {
      // Arrange
      const document = createTestDocument(db, userId);

      // Act
      const message = repository.create({
        user_id: userId,
        document_id: document.id,
        role: 'assistant',
        content: 'Response',
        tokens: 20
      });

      // Assert
      expect(message.document_id).toBe(document.id);
    });

    it('should default tokens to 0 when not provided', () => {
      // Act
      const message = repository.create({
        user_id: userId,
        role: 'user',
        content: 'Message without tokens'
      });

      // Assert
      expect(message.tokens).toBe(0);
    });
  });

  describe('deleteByUserId', () => {
    it('should delete all messages for user', () => {
      // Arrange
      repository.create({
        user_id: userId,
        role: 'user',
        content: 'Message 1',
        tokens: 5
      });
      repository.create({
        user_id: userId,
        role: 'user',
        content: 'Message 2',
        tokens: 5
      });

      // Act
      const deleted = repository.deleteByUserId(userId);

      // Assert
      expect(deleted).toBe(true);
      const messages = repository.findByUserId(userId);
      expect(messages).toHaveLength(0);
    });

    it('should return false when user has no messages', () => {
      // Act
      const deleted = repository.deleteByUserId(userId);

      // Assert
      expect(deleted).toBe(false);
    });
  });

  describe('getTotalTokensByUserId', () => {
    it('should return 0 when user has no messages', () => {
      // Act
      const total = repository.getTotalTokensByUserId(userId);

      // Assert
      expect(total).toBe(0);
    });

    it('should return sum of all tokens for user', () => {
      // Arrange
      const otherUser = createTestUser(db, 'other');
      repository.create({
        user_id: userId,
        role: 'user',
        content: 'Msg 1',
        tokens: 10
      });
      repository.create({
        user_id: userId,
        role: 'assistant',
        content: 'Msg 2',
        tokens: 15
      });
      repository.create({
        user_id: otherUser.id,
        role: 'user',
        content: 'Other msg',
        tokens: 100
      });

      // Act
      const total = repository.getTotalTokensByUserId(userId);

      // Assert
      expect(total).toBe(25); // 10 + 15
    });
  });
});
