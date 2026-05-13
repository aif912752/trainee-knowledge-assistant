import Database from 'better-sqlite3';
import { join } from 'path';

const dbPath = join(process.cwd(), 'data/app.db');
const db = new Database(dbPath);

try {
  console.log('🚀 Adding "model" column to messages table...');
  db.prepare('ALTER TABLE messages ADD COLUMN model TEXT').run();
  console.log('✅ Column added successfully!');
} catch (error: any) {
  if (error.message.includes('duplicate column name')) {
    console.log('ℹ️ Column already exists, skipping.');
  } else {
    console.error('❌ Error updating schema:', error.message);
  }
} finally {
  db.close();
}
