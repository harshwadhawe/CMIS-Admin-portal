// Database initialization script
// Run this once to set up the database tables

import { initializeDatabase } from '../lib/db-connection';

async function main() {
  console.log('🚀 Initializing database...');
  try {
    await initializeDatabase();
    console.log('✅ Database initialization complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    process.exit(1);
  }
}

main();

