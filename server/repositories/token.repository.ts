import type { Database } from 'better-sqlite3';
import type { TokenUsage, CreateTokenUsageInput, SessionTokenSummary } from '~~/types/token';

export class TokenRepository {
  constructor(private db: Database) {}

  /**
   * Create token usage record
   */
  create(input: CreateTokenUsageInput): TokenUsage {
    const stmt = this.db.prepare(
      'INSERT INTO token_usage (user_id, session_id, tokens) VALUES (?, ?, ?)'
    );

    const result = stmt.run(input.user_id, input.session_id, input.tokens);

    const tokenUsage = this.db.prepare(
      'SELECT * FROM token_usage WHERE id = ?'
    ).get(result.lastInsertRowid) as TokenUsage | undefined;

    if (!tokenUsage) {
      throw new Error('Failed to create token usage record');
    }

    return tokenUsage;
  }

  /**
   * Get total tokens by session ID
   */
  getTotalBySessionId(sessionId: string): number {
    const stmt = this.db.prepare(
      'SELECT SUM(tokens) as total FROM token_usage WHERE session_id = ?'
    );
    const result = stmt.get(sessionId) as { total: number | null };
    return result.total || 0;
  }

  /**
   * Get total tokens by user ID
   */
  getTotalByUserId(userId: number): number {
    const stmt = this.db.prepare(
      'SELECT SUM(tokens) as total FROM token_usage WHERE user_id = ?'
    );
    const result = stmt.get(userId) as { total: number | null };
    return result.total || 0;
  }

  /**
   * Get all session summaries for user
   */
  getSessionSummariesByUserId(userId: number): SessionTokenSummary[] {
    const stmt = this.db.prepare(
      `SELECT session_id, SUM(tokens) as total_tokens
       FROM token_usage
       WHERE user_id = ?
       GROUP BY session_id
       ORDER BY MAX(created_at) DESC`
    );
    return stmt.all(userId) as SessionTokenSummary[];
  }

  /**
   * Get recent token usage records
   */
  findRecentByUserId(userId: number, limit: number = 100): TokenUsage[] {
    const stmt = this.db.prepare(
      `SELECT * FROM token_usage
       WHERE user_id = ?
       ORDER BY created_at DESC
       LIMIT ?`
    );
    return stmt.all(userId, limit) as TokenUsage[];
  }

  /**
   * Delete old token records (cleanup)
   */
  deleteOlderThan(days: number): number {
    const stmt = this.db.prepare(
      `DELETE FROM token_usage
       WHERE created_at < datetime('now', '-' || ? || ' days')`
    );
    const result = stmt.run(days);
    return result.changes;
  }
}
