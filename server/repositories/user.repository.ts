import type { Database } from 'better-sqlite3';

export interface User {
  id: number;
  username: string;
  password_hash: string;
  created_at: string;
}

export interface CreateUserInput {
  username: string;
  password_hash: string;
}

export class UserRepository {
  constructor(private db: Database) {}

  /**
   * Find user by username
   */
  findByUsername(username: string): User | undefined {
    const stmt = this.db.prepare(
      'SELECT * FROM users WHERE username = ?'
    );
    return stmt.get(username) as User | undefined;
  }

  /**
   * Find user by ID
   */
  findById(id: number): User | undefined {
    const stmt = this.db.prepare(
      'SELECT * FROM users WHERE id = ?'
    );
    return stmt.get(id) as User | undefined;
  }

  /**
   * Create new user
   */
  create(input: CreateUserInput): User {
    const stmt = this.db.prepare(
      'INSERT INTO users (username, password_hash) VALUES (?, ?)'
    );

    const result = stmt.run(input.username, input.password_hash);
    const user = this.findById(result.lastInsertRowid as number);

    if (!user) {
      throw new Error('Failed to create user');
    }

    return user;
  }

  /**
   * Delete user by ID
   */
  delete(id: number): boolean {
    const stmt = this.db.prepare('DELETE FROM users WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }
}
