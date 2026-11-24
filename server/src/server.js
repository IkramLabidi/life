import 'dotenv/config';
import app from './app.js';
import { connectDB, isUsingMemoryServer } from './config/db.js';
import User from './models/User.js';
import { seedDatabase } from './seed.js';

const PORT = process.env.PORT || 5000;

const start = async () => {
  try {
    await connectDB();

    // Seed the demo account and sample data when the database is empty so the
    // app is instantly testable (especially with the in-memory fallback).
    const userCount = await User.estimatedDocumentCount();
    if (userCount === 0) {
      console.log('🌱 Empty database detected — loading demo data…');
      await seedDatabase();
    }

    app.listen(PORT, () => {
      console.log(`🚀 LifeOS API running on http://localhost:${PORT}`);
      console.log(`   Health check: http://localhost:${PORT}/api/health`);
      console.log('   Demo login → demo@lifeos.app / demo1234');
      if (isUsingMemoryServer()) {
        console.log('   ⚠️  In-memory MongoDB in use — data resets when the server restarts.');
        console.log('      Set MONGODB_URI in server/.env to persist your data.');
      }
    });
  } catch (err) {
    console.error('❌ Failed to start the server:', err.message);
    process.exit(1);
  }
};

start();
