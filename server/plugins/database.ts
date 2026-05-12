import { getDatabase } from '../db';

/**
 * Initialize database connection on server startup
 * This plugin runs when the Nuxt server starts
 */
export default defineNitroPlugin(() => {
  try {
    // Initialize database connection and seed data
    getDatabase();

    console.log('✅ Database plugin loaded successfully');
  } catch (error) {
    console.error('❌ Failed to initialize database:', error);
    throw error;
  }
});
