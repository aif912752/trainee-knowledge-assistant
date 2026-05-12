import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { UserRepository } from '~/server/repositories/user.repository';
import { createTestDatabase } from '~/test/utils/database';
import Database from 'better-sqlite3';

describe('UserRepository', () => {
  let db: Database.Database;
  let repository: UserRepository;

  beforeEach(() => {
    db = createTestDatabase();
    repository = new UserRepository(db);
  });

  afterEach(() => {
    db.close();
  });

  describe('findByUsername', () => {
    it('should return user when username exists', () => {
      // Arrange
      db.prepare('INSERT INTO users (username, password_hash) VALUES (?, ?)').run('testuser', 'hash123');

      // Act
      const user = repository.findByUsername('testuser');

      // Assert
      expect(user).toBeDefined();
      expect(user?.username).toBe('testuser');
      expect(user?.password_hash).toBe('hash123');
    });

    it('should return undefined when username does not exist', () => {
      // Act
      const user = repository.findByUsername('nonexistent');

      // Assert
      expect(user).toBeUndefined();
    });
  });

  describe('findById', () => {
    it('should return user when id exists', () => {
      // Arrange
      const result = db.prepare('INSERT INTO users (username, password_hash) VALUES (?, ?)').run('testuser', 'hash123');
      const userId = result.lastInsertRowid as number;

      // Act
      const user = repository.findById(userId);

      // Assert
      expect(user).toBeDefined();
      expect(user?.id).toBe(userId);
      expect(user?.username).toBe('testuser');
    });

    it('should return undefined when id does not exist', () => {
      // Act
      const user = repository.findById(999);

      // Assert
      expect(user).toBeUndefined();
    });
  });

  describe('create', () => {
    it('should create new user and return it', () => {
      // Act
      const user = repository.create({
        username: 'newuser',
        password_hash: 'hashedpassword'
      });

      // Assert
      expect(user).toBeDefined();
      expect(user.id).toBeDefined();
      expect(user.username).toBe('newuser');
      expect(user.password_hash).toBe('hashedpassword');
    });

    it('should throw error when username already exists', () => {
      // Arrange
      db.prepare('INSERT INTO users (username, password_hash) VALUES (?, ?)').run('existing', 'hash');

      // Act & Assert
      expect(() => {
        repository.create({
          username: 'existing',
          password_hash: 'hash'
        });
      }).toThrow();
    });
  });

  describe('delete', () => {
    it('should delete user and return true', () => {
      // Arrange
      const result = db.prepare('INSERT INTO users (username, password_hash) VALUES (?, ?)').run('todelete', 'hash');
      const userId = result.lastInsertRowid as number;

      // Act
      const deleted = repository.delete(userId);

      // Assert
      expect(deleted).toBe(true);
      const user = repository.findById(userId);
      expect(user).toBeUndefined();
    });

    it('should return false when user does not exist', () => {
      // Act
      const deleted = repository.delete(999);

      // Assert
      expect(deleted).toBe(false);
    });
  });
});
