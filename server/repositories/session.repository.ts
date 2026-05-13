import { randomBytes } from 'crypto';
import type { Database } from 'better-sqlite3';

export interface Session {
  id: number;
  user_id: number;
  token: string;
  expires_at: string;
  created_at: string;
}

export class SessionRepository {
  constructor(private db: Database) {}

  /**
   * Generate a secure random session token
   */
  generateToken(): string {
    return randomBytes(32).toString('hex');
  }

  /**
   * Create a new session for user
   */
  create(userId: number, maxAgeSeconds: number = 60 * 60 * 24 * 7): Session {
    const token = this.generateToken();
    const expiresAt = new Date(Date.now() + maxAgeSeconds * 1000).toISOString();

    const stmt = this.db.prepare(`
      INSERT INTO sessions (user_id, token, expires_at)
      VALUES (?, ?, ?)
    `);

    const result = stmt.run(userId, token, expiresAt);

    return {
      id: result.lastInsertRowid as number,
      user_id: userId,
      token,
      expires_at: expiresAt,
      created_at: new Date().toISOString()
    };
  }

  /**
   * Find session by token
   */
  findByToken(token: string): Session | null {
    const stmt = this.db.prepare(`
      SELECT * FROM sessions
      WHERE token = ? AND expires_at > datetime('now')
      ORDER BY created_at DESC
      LIMIT 1
    `);

    return stmt.get(token) as Session | null;
  }

  /**
   * Get user ID from session token
   */
  getUserIdByToken(token: string): number | null {
    const session = this.findByToken(token);
    return session ? session.user_id : null;
  }

  /**
   * Delete session by token
   */
  deleteByToken(token: string): boolean {
    const stmt = this.db.prepare('DELETE FROM sessions WHERE token = ?');
    const result = stmt.run(token);
    return result.changes > 0;
  }

  /**
   * Delete all sessions for a user
   */
  deleteByUserId(userId: number): number {
    const stmt = this.db.prepare('DELETE FROM sessions WHERE user_id = ?');
    const result = stmt.run(userId);
    return result.changes;
  }

  /**
   * Clean up expired sessions
   */
  deleteExpired(): number {
    const stmt = this.db.prepare('DELETE FROM sessions WHERE expires_at <= datetime("now")');
    const result = stmt.run();
    return result.changes;
  }
}
