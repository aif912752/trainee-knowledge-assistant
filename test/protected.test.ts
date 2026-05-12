import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { createTestDatabase, createTestUser } from '~/test/utils/database';
import Database from 'better-sqlite3';
import protectedMiddleware from '~~/server/middleware/protected';
import { H3Event } from 'h3';

// Mock dependencies
vi.mock('~/server/db', () => ({
  getDatabase: vi.fn(() => testDb),
}));

// Mock session utilities
vi.mock('~/server/utils/session', () => ({
  getSessionUserId: vi.fn(() => null),
}));

let testDb: Database.Database;

// Helper to create mock event
function createMockEvent(url: string, cookie?: string) {
  const req = {
    url,
    headers: {
      cookie: cookie || '',
    },
  };

  const res = {
    statusCode: 200,
    setHeader: vi.fn(),
  };

  const event = {
    node: { req, res },
    context: {},
  } as unknown as H3Event;

  return event;
}

describe('Protected Middleware', () => {
  beforeEach(() => {
    testDb = createTestDatabase();
    createTestUser(testDb, 'testuser', 'password123');
  });

  afterEach(() => {
    testDb?.close();
  });

  describe('Unauthorized Access', () => {
    it('should return 401 when no session cookie provided', async () => {
      // Arrange
      const { getSessionUserId } = await import('~/server/utils/session');
      vi.mocked(getSessionUserId).mockReturnValue(null);
      const event = createMockEvent('/api/test/protected');

      // Act
      const result = await protectedMiddleware(event);

      // Assert
      expect(result).toBeDefined();
      expect(result.success).toBe(false);
      expect(result.code).toBe('UNAUTHORIZED');
    });

    it('should return 401 when session user does not exist', async () => {
      // Arrange
      const { getSessionUserId } = await import('~/server/utils/session');
      vi.mocked(getSessionUserId).mockReturnValue(9999);
      const event = createMockEvent('/api/test/protected');

      // Act
      const result = await protectedMiddleware(event);

      // Assert
      expect(result).toBeDefined();
      expect(result.success).toBe(false);
      expect(result.code).toBe('UNAUTHORIZED');
    });
  });

  describe('Public Endpoints', () => {
    it('should skip /api/auth/login endpoint', async () => {
      // Arrange
      const event = createMockEvent('/api/auth/login');

      // Act
      const result = await protectedMiddleware(event);

      // Assert - middleware should return undefined (skip)
      expect(result).toBeUndefined();
    });

    it('should skip /api/auth/me endpoint', async () => {
      // Arrange
      const event = createMockEvent('/api/auth/me');

      // Act
      const result = await protectedMiddleware(event);

      // Assert - middleware should return undefined (skip)
      expect(result).toBeUndefined();
    });

    it('should skip non-API routes', async () => {
      // Arrange
      const event = createMockEvent('/some/page');

      // Act
      const result = await protectedMiddleware(event);

      // Assert - middleware should return undefined (skip)
      expect(result).toBeUndefined();
    });
  });

  describe('Authorized Access', () => {
    it('should attach user to event context when session is valid', async () => {
      // Arrange
      const { getSessionUserId } = await import('~/server/utils/session');
      const user = createTestUser(testDb, 'authuser', 'password123');
      vi.mocked(getSessionUserId).mockReturnValue(user.id);
      const event = createMockEvent('/api/test/protected');

      // Act
      const result = await protectedMiddleware(event);

      // Assert - middleware should return undefined (pass through)
      expect(result).toBeUndefined();
      expect(event.context.user).toBeDefined();
      expect(event.context.user.id).toBe(user.id);
      expect(event.context.user.username).toBe('authuser');
    });
  });
});
