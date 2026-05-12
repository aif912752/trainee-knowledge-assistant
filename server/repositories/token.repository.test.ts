import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TokenRepository } from '~/server/repositories/token.repository';
import { createTestDatabase, createTestUser } from '~/test/utils/database';
import Database from 'better-sqlite3';

describe('TokenRepository', () => {
  let db: Database.Database;
  let repository: TokenRepository;
  let userId: number;

  beforeEach(() => {
    db = createTestDatabase();
    repository = new TokenRepository(db);
    const user = createTestUser(db);
    userId = user.id;
  });

  afterEach(() => {
    db.close();
  });

  describe('create', () => {
    it('should create token usage record and return it', () => {
      // Act
      const tokenUsage = repository.create({
        user_id: userId,
        session_id: 'session-123',
        tokens: 100
      });

      // Assert
      expect(tokenUsage).toBeDefined();
      expect(tokenUsage.id).toBeDefined();
      expect(tokenUsage.user_id).toBe(userId);
      expect(tokenUsage.session_id).toBe('session-123');
      expect(tokenUsage.tokens).toBe(100);
    });
  });

  describe('getTotalBySessionId', () => {
    it('should return 0 when session has no tokens', () => {
      // Act
      const total = repository.getTotalBySessionId('nonexistent-session');

      // Assert
      expect(total).toBe(0);
    });

    it('should return sum of tokens for session', () => {
      // Arrange
      repository.create({ user_id: userId, session_id: 'session-1', tokens: 50 });
      repository.create({ user_id: userId, session_id: 'session-1', tokens: 30 });
      repository.create({ user_id: userId, session_id: 'session-2', tokens: 100 });

      // Act
      const total = repository.getTotalBySessionId('session-1');

      // Assert
      expect(total).toBe(80); // 50 + 30
    });
  });

  describe('getTotalByUserId', () => {
    it('should return 0 when user has no tokens', () => {
      // Act
      const total = repository.getTotalByUserId(userId);

      // Assert
      expect(total).toBe(0);
    });

    it('should return sum of all tokens for user across sessions', () => {
      // Arrange
      const otherUser = createTestUser(db, 'other');
      repository.create({ user_id: userId, session_id: 'session-1', tokens: 50 });
      repository.create({ user_id: userId, session_id: 'session-2', tokens: 30 });
      repository.create({ user_id: otherUser.id, session_id: 'session-3', tokens: 100 });

      // Act
      const total = repository.getTotalByUserId(userId);

      // Assert
      expect(total).toBe(80); // 50 + 30, not including other user
    });
  });

  describe('getSessionSummariesByUserId', () => {
    it('should return empty array when user has no sessions', () => {
      // Act
      const summaries = repository.getSessionSummariesByUserId(userId);

      // Assert
      expect(summaries).toEqual([]);
    });

    it('should return session summaries grouped by session_id', () => {
      // Arrange
      repository.create({ user_id: userId, session_id: 'session-1', tokens: 50 });
      repository.create({ user_id: userId, session_id: 'session-1', tokens: 30 });
      repository.create({ user_id: userId, session_id: 'session-2', tokens: 100 });

      // Act
      const summaries = repository.getSessionSummariesByUserId(userId);

      // Assert
      expect(summaries).toHaveLength(2);
      expect(summaries.find((s: any) => s.session_id === 'session-1')?.total_tokens).toBe(80);
      expect(summaries.find((s: any) => s.session_id === 'session-2')?.total_tokens).toBe(100);
    });
  });

  describe('findRecentByUserId', () => {
    it('should return empty array when user has no tokens', () => {
      // Act
      const tokens = repository.findRecentByUserId(userId);

      // Assert
      expect(tokens).toEqual([]);
    });

    it('should return recent tokens with default limit', () => {
      // Arrange
      for (let i = 0; i < 10; i++) {
        repository.create({ user_id: userId, session_id: `session-${i}`, tokens: i * 10 });
      }

      // Act
      const tokens = repository.findRecentByUserId(userId);

      // Assert
      expect(tokens.length).toBeLessThanOrEqual(100);
      expect(tokens.length).toBe(10);
    });

    it('should respect custom limit', () => {
      // Arrange
      for (let i = 0; i < 10; i++) {
        repository.create({ user_id: userId, session_id: `session-${i}`, tokens: i * 10 });
      }

      // Act
      const tokens = repository.findRecentByUserId(userId, 5);

      // Assert
      expect(tokens).toHaveLength(5);
    });
  });

  describe('deleteOlderThan', () => {
    it('should delete token records older than specified days', () => {
      // Arrange
      db.prepare(
        `INSERT INTO token_usage (user_id, session_id, tokens, created_at)
         VALUES (?, ?, ?, datetime('now', '-10 days'))`
      ).run(userId, 'old-session', 100);
      db.prepare(
        `INSERT INTO token_usage (user_id, session_id, tokens, created_at)
         VALUES (?, ?, ?, datetime('now', '-2 days'))`
      ).run(userId, 'recent-session', 50);

      // Act
      const deletedCount = repository.deleteOlderThan(5);

      // Assert
      expect(deletedCount).toBe(1);
      const remaining = repository.findRecentByUserId(userId, 100);
      expect(remaining).toHaveLength(1);
      expect(remaining[0].session_id).toBe('recent-session');
    });

    it('should return 0 when no records to delete', () => {
      // Arrange - no records

      // Act
      const deletedCount = repository.deleteOlderThan(5);

      // Assert
      expect(deletedCount).toBe(0);
    });
  });
});
