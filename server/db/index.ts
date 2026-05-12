export { initDatabase, seedDatabase, getDatabase } from './init';
export type { DatabaseContext } from './init';

// Re-export Database type for convenience
export { default as Database } from 'better-sqlite3';
