import dotenv from 'dotenv';
import { connectDB } from '../config/db.js';
import { seedDatabase } from './seedData.js';

dotenv.config();

const run = async () => {
  try {
    await connectDB();
    await seedDatabase();
    console.log('[Seed Runner] Seeding successfully finished!');
    process.exit(0);
  } catch (err) {
    console.error('[Seed Runner] Seeding failed:', err);
    process.exit(1);
  }
};

run();
