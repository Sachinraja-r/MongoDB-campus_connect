import app from '../backend/src/app.js';
import { connectDB } from '../backend/src/config/db.js';
import { SystemSettings } from '../backend/src/models/SystemSettings.js';
import { seedDatabase } from '../backend/src/seed/seedData.js';

let isSeeded = false;

export default async function handler(req, res) {
  try {
    await connectDB();

    if (!isSeeded) {
      try {
        const count = await SystemSettings.countDocuments();
        if (count === 0) {
          console.log('[Vercel Serverless] Auto-seeding initial KIOT dataset...');
          await seedDatabase();
        }
        isSeeded = true;
      } catch (err) {
        console.error('[Vercel Serverless] Seed check error:', err.message);
      }
    }

    return app(req, res);
  } catch (err) {
    console.error('[Vercel Serverless] Handler error:', err);
    return res.status(500).json({
      success: false,
      message: 'Serverless execution error: ' + err.message,
    });
  }
}
