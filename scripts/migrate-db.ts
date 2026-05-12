import Database from 'better-sqlite3';
import { join } from 'path';

const dbPath = join(process.cwd(), 'data/app.db');
const db = new Database(dbPath);

try {
  db.prepare('ALTER TABLE documents ADD COLUMN file_path TEXT;').run();
  console.log('✅ Added file_path column to documents table');
} catch (error: any) {
  if (error.message.includes('duplicate column name')) {
    console.log('ℹ️ file_path column already exists');
  } else {
    console.error('❌ Error updating database:', error.message);
  }
} finally {
  db.close();
}
