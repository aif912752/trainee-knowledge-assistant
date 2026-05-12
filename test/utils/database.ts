import Database from 'better-sqlite3';
import { readFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const schemaPath = join(__dirname, '../../server/db/schema.sql');

/**
 * Create an in-memory database for testing
 */
export function createTestDatabase(): Database.Database {
  const db = new Database(':memory:');

  // Enable foreign keys
  db.pragma('foreign_keys = ON');

  // Read and execute schema
  const schema = readFileSync(schemaPath, 'utf-8');
  db.exec(schema);

  return db;
}

/**
 * Create a test user in the database
 */
export function createTestUser(db: Database.Database, username = 'testuser', password = 'password123') {
  const bcrypt = require('bcrypt');
  const passwordHash = bcrypt.hashSync(password, 10);

  const result = db.prepare(
    'INSERT INTO users (username, password_hash) VALUES (?, ?)'
  ).run(username, passwordHash);

  return db.prepare('SELECT * FROM users WHERE id = ?').get(result.lastInsertRowid);
}

/**
 * Create a test document in the database
 */
export function createTestDocument(db: Database.Database, userId: number, content = 'Test content') {
  const result = db.prepare(
    'INSERT INTO documents (user_id, filename, original_name, file_type, file_size, content) VALUES (?, ?, ?, ?, ?, ?)'
  ).run(userId, 'test.txt', 'test.txt', 'text/plain', 100, content);

  return db.prepare('SELECT * FROM documents WHERE id = ?').get(result.lastInsertRowid);
}

/**
 * Create test messages in the database
 */
export function createTestMessages(db: Database.Database, userId: number, documentId?: number) {
  const result1 = db.prepare(
    'INSERT INTO messages (user_id, document_id, role, content, tokens) VALUES (?, ?, ?, ?, ?)'
  ).run(userId, documentId, 'user', 'Hello', 10);

  const result2 = db.prepare(
    'INSERT INTO messages (user_id, document_id, role, content, tokens) VALUES (?, ?, ?, ?, ?)'
  ).run(userId, documentId, 'assistant', 'Hi there!', 15);

  return [
    db.prepare('SELECT * FROM messages WHERE id = ?').get(result1.lastInsertRowid),
    db.prepare('SELECT * FROM messages WHERE id = ?').get(result2.lastInsertRowid),
  ];
}
