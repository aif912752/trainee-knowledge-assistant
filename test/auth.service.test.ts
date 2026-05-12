import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { AuthService } from '~/server/services/auth.service';
import { createTestDatabase, createTestUser } from '~/test/utils/database';
import Database from 'better-sqlite3';

// Mock getDatabase to use test database
vi.mock('~/server/db', () => ({
  getDatabase: vi.fn(() => testDb),
}));

let testDb: Database.Database;

describe('AuthService', () => {
  let authService: AuthService;
  let userId: number;

  beforeEach(() => {
    // Create test database for each test
    testDb = createTestDatabase();
    const user = createTestUser(testDb, 'testuser', 'password123');
    userId = user.id;
    authService = new AuthService();
  });

  afterEach(() => {
    testDb?.close();
  });

  describe('hashPassword', () => {
    it('should hash password with bcrypt', () => {
      // Act
      const hash = authService.hashPassword('mypassword');

      // Assert
      expect(hash).toBeDefined();
      expect(hash).not.toBe('mypassword');
      expect(hash.length).toBeGreaterThan(20);
    });

    it('should generate different hashes for same password', () => {
      // Act
      const hash1 = authService.hashPassword('password');
      const hash2 = authService.hashPassword('password');

      // Assert
      expect(hash1).not.toBe(hash2); // Different salt
    });
  });

  describe('verifyPassword', () => {
    it('should return true for correct password', () => {
      // Arrange
      const hash = authService.hashPassword('correctpassword');

      // Act
      const isValid = authService.verifyPassword('correctpassword', hash);

      // Assert
      expect(isValid).toBe(true);
    });

    it('should return false for incorrect password', () => {
      // Arrange
      const hash = authService.hashPassword('correctpassword');

      // Act
      const isValid = authService.verifyPassword('wrongpassword', hash);

      // Assert
      expect(isValid).toBe(false);
    });
  });

  describe('login', () => {
    it('should return error when username is missing', async () => {
      // Act
      const result = await authService.login({ password: 'password123' });

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('Username and password are required');
    });

    it('should return error when password is missing', async () => {
      // Act
      const result = await authService.login({ username: 'testuser' });

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('Username and password are required');
    });

    it('should return error for non-existent user', async () => {
      // Act
      const result = await authService.login({
        username: 'nonexistent',
        password: 'password123'
      });

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid credentials');
    });

    it('should return error for wrong password', async () => {
      // Act
      const result = await authService.login({
        username: 'testuser',
        password: 'wrongpassword'
      });

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid credentials');
    });

    it('should return success with user without password for valid credentials', async () => {
      // Act
      const result = await authService.login({
        username: 'testuser',
        password: 'password123'
      });

      // Assert
      expect(result.success).toBe(true);
      expect(result.user).toBeDefined();
      expect(result.user?.username).toBe('testuser');
      expect(result.user).not.toHaveProperty('password_hash');
    });
  });

  describe('getUserById', () => {
    it('should return user without password when id exists', () => {
      // Act
      const user = authService.getUserById(userId);

      // Assert
      expect(user).toBeDefined();
      expect(user?.id).toBe(userId);
      expect(user?.username).toBe('testuser');
      expect(user).not.toHaveProperty('password_hash');
    });

    it('should return undefined when id does not exist', () => {
      // Act
      const user = authService.getUserById(999);

      // Assert
      expect(user).toBeUndefined();
    });
  });

  describe('validateSession', () => {
    it('should return true for valid user id', () => {
      // Act
      const isValid = authService.validateSession(userId);

      // Assert
      expect(isValid).toBe(true);
    });

    it('should return false for invalid user id', () => {
      // Act
      const isValid = authService.validateSession(999);

      // Assert
      expect(isValid).toBe(false);
    });
  });
});
