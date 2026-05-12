import type { Database } from 'better-sqlite3';
import type { Document, CreateDocumentInput } from '~~/types/document';

export class DocumentRepository {
  constructor(private db: Database) {}

  /**
   * Find all documents by user ID
   */
  findByUserId(userId: number): Document[] {
    const stmt = this.db.prepare(
      'SELECT * FROM documents WHERE user_id = ? ORDER BY created_at DESC'
    );
    return stmt.all(userId) as Document[];
  }

  /**
   * Find document by ID
   */
  findById(id: number): Document | undefined {
    const stmt = this.db.prepare(
      'SELECT * FROM documents WHERE id = ?'
    );
    return stmt.get(id) as Document | undefined;
  }

  /**
   * Find document by ID and user ID (ensure ownership)
   */
  findByIdAndUserId(id: number, userId: number): Document | undefined {
    const stmt = this.db.prepare(
      'SELECT * FROM documents WHERE id = ? AND user_id = ?'
    );
    return stmt.get(id, userId) as Document | undefined;
  }

  /**
   * Create new document
   */
  create(input: CreateDocumentInput): Document {
    const stmt = this.db.prepare(
      `INSERT INTO documents (user_id, filename, original_name, file_type, file_size, content)
       VALUES (?, ?, ?, ?, ?, ?)`
    );

    const result = stmt.run(
      input.user_id,
      input.filename,
      input.original_name,
      input.file_type,
      input.file_size,
      input.content || null
    );

    const document = this.findById(result.lastInsertRowid as number);

    if (!document) {
      throw new Error('Failed to create document');
    }

    return document;
  }

  /**
   * Delete document by ID and user ID
   */
  delete(id: number, userId: number): boolean {
    const stmt = this.db.prepare(
      'DELETE FROM documents WHERE id = ? AND user_id = ?'
    );
    const result = stmt.run(id, userId);
    return result.changes > 0;
  }

  /**
   * Count documents by user ID
   */
  countByUserId(userId: number): number {
    const stmt = this.db.prepare(
      'SELECT COUNT(*) as count FROM documents WHERE user_id = ?'
    );
    const result = stmt.get(userId) as { count: number };
    return result.count;
  }
}
