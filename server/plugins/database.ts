import { initDatabase, seedDatabase } from '../db/init';

/**
 * Initialize database connection on server startup
 * This plugin runs when the Nuxt server starts
 * Attaches db instance to event.context for all requests
 */
export default defineNitroPlugin((nitroApp) => {
  try {
    const config = useRuntimeConfig();
    const dbPath = config.databasePath;

    // Initialize database connection and seed data ONCE
    const db = initDatabase(dbPath);
    seedDatabase(db);

    // Attach db to event context for all requests
    nitroApp.hooks.hook('request', (event) => {
      event.context.db = db;
    });

    console.log('✅ Database plugin loaded successfully');
  } catch (error) {
    console.error('❌ Failed to initialize database:', error);
    throw error;
  }
});
