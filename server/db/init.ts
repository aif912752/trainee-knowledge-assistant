import Database from 'better-sqlite3';
import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcrypt';

const __dirname = dirname(fileURLToPath(import.meta.url));
const schemaPath = join(__dirname, 'schema.sql');

export interface DatabaseContext {
  db: Database.Database;
}

/**
 * Initialize database connection and schema
 */
export function initDatabase(databasePath: string): Database.Database {
  // Ensure database directory exists
  const dbDir = dirname(databasePath);
  require('fs').mkdirSync(dbDir, { recursive: true });

  // Open database connection
  const db = new Database(databasePath);

  // Enable foreign keys
  db.pragma('foreign_keys = ON');

  // Read and execute schema
  const schema = readFileSync(schemaPath, 'utf-8');
  db.exec(schema);

  console.log(`✅ Database initialized at ${databasePath}`);

  return db;
}

/**
 * Seed initial data (mock user)
 */
export function seedDatabase(db: Database.Database): void {
  // Check if admin user exists
  const existingUser = db
    .prepare('SELECT id FROM users WHERE username = ?')
    .get('admin');

  if (existingUser) {
    console.log('✅ Admin user already exists');
    return;
  }

  // Create admin user with hashed password
  const passwordHash = bcrypt.hashSync('admin123', 10);

  db.prepare(
    'INSERT INTO users (username, password_hash) VALUES (?, ?)'
  ).run('admin', passwordHash);

  console.log('✅ Admin user created (username: admin, password: admin123)');
}

/**
 * Get database instance (singleton pattern)
 */
let dbInstance: Database.Database | null = null;

export function getDatabase(): Database.Database {
  if (!dbInstance) {
    const config = useRuntimeConfig();
    const dbPath = config.databasePath;
    dbInstance = initDatabase(dbPath);
    seedDatabase(dbInstance);
  }
  return dbInstance;
}
