import dotenv from 'dotenv';
import app from './app.js';
import { connectDB } from './config/db.js';
import { SystemSettings } from './models/SystemSettings.js';
import { seedDatabase } from './seed/seedData.js';

dotenv.config();

const PORT = process.env.PORT || 5000;

// Connect to MongoDB
await connectDB();

// Auto-seed if database is freshly initialized
try {
  const settingsCount = await SystemSettings.countDocuments();
  if (settingsCount === 0) {
    console.log('[CampusConnect] Initializing default KIOT seed data...');
    await seedDatabase();
  }
} catch (err) {
  console.error('[CampusConnect] Auto-seed check error:', err.message);
}

app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`🚀 CampusConnect Backend Server running on port ${PORT}`);
  console.log(`🏛️  Knowledge Institute of Technology (KIOT), Salem`);
  console.log(`📡 API Base: http://localhost:${PORT}/api`);
  console.log(`=======================================================`);
});
