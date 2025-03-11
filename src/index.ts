import dotenv from 'dotenv';
import { initBot } from './bot';
import { initDatabase } from './database';

// Load environment variables
dotenv.config();

async function main() {
  try {
    // Initialize database
    await initDatabase();
    console.log('Database initialized');
    
    // Initialize bot
    initBot();
    console.log('Bot started');
  } catch (error) {
    console.error('Error starting application:', error);
    process.exit(1);
  }
}

main();
