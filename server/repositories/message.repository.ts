import type { Database } from 'better-sqlite3';
import type { Message, CreateMessageInput } from '~~/types/message';

export class MessageRepository {
  constructor(private db: Database) {}

  /**
   * Find all messages by user ID
   */
  findByUserId(userId: number): Message[] {
    const stmt = this.db.prepare(
      'SELECT * FROM messages WHERE user_id = ? ORDER BY created_at ASC'
    );
    return stmt.all(userId) as Message[];
  }

  /**
   * Find messages by user ID and document ID
   */
  findByUserIdAndDocumentId(userId: number, documentId: number): Message[] {
    const stmt = this.db.prepare(
      `SELECT * FROM messages
       WHERE user_id = ? AND document_id = ?
       ORDER BY created_at ASC`
    );
    return stmt.all(userId, documentId) as Message[];
  }

  /**
   * Find recent messages by user ID (limit)
   */
  findRecentByUserId(userId: number, limit: number = 50): Message[] {
    const stmt = this.db.prepare(
      `SELECT * FROM messages
       WHERE user_id = ?
       ORDER BY created_at DESC
       LIMIT ?`
    );
    return stmt.all(userId, limit) as Message[];
  }

  /**
   * Create new message
   */
  create(input: CreateMessageInput): Message {
    const stmt = this.db.prepare(
      `INSERT INTO messages (user_id, document_id, role, content, tokens, model)
       VALUES (?, ?, ?, ?, ?, ?)`
    );

    const result = stmt.run(
      input.user_id,
      input.document_id || null,
      input.role,
      input.content,
      input.tokens || 0,
      input.model || null
    );

    const message = this.db.prepare(
      'SELECT * FROM messages WHERE id = ?'
    ).get(result.lastInsertRowid) as Message | undefined;

    if (!message) {
      throw new Error('Failed to create message');
    }

    return message;
  }

  /**
   * Delete messages by user ID
   */
  deleteByUserId(userId: number): boolean {
    const stmt = this.db.prepare(
      'DELETE FROM messages WHERE user_id = ?'
    );
    const result = stmt.run(userId);
    return result.changes > 0;
  }

  /**
   * Count total tokens used by user
   */
  getTotalTokensByUserId(userId: number): number {
    const stmt = this.db.prepare(
      'SELECT SUM(tokens) as total FROM messages WHERE user_id = ?'
    );
    const result = stmt.get(userId) as { total: number | null };
    return result.total || 0;
  }

  /**
   * Find the last message for a user by role
   */
  findLastByUserIdAndRole(userId: number, role: 'user' | 'assistant'): Message | undefined {
    const stmt = this.db.prepare(
      `SELECT * FROM messages 
       WHERE user_id = ? AND role = ? 
       ORDER BY created_at DESC 
       LIMIT 1`
    );
    return stmt.get(userId, role) as Message | undefined;
  }

  /**
   * Update tokens for a specific message
   */
  updateTokens(messageId: number, tokens: number): boolean {
    const stmt = this.db.prepare(
      'UPDATE messages SET tokens = ? WHERE id = ?'
    );
    const result = stmt.run(tokens, messageId);
    return result.changes > 0;
  }
}
