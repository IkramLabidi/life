import mongoose from 'mongoose';

let memoryServer = null;

/**
 * Connect to MongoDB.
 * - If MONGODB_URI is set, connect to it.
 * - If it is missing (or unreachable in development), fall back to an
 *   in-memory MongoDB so the app runs out of the box for demos/testing.
 */
export const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  if (uri) {
    try {
      await mongoose.connect(uri, { serverSelectionTimeoutMS: 6000 });
      console.log(`✅ MongoDB connected: ${mongoose.connection.host}`);
      return;
    } catch (err) {
      console.warn(`⚠️  Could not connect to MONGODB_URI (${err.message}).`);
      if (process.env.NODE_ENV === 'production') throw err;
    }
  }

  try {
    const { MongoMemoryServer } = await import('mongodb-memory-server');
    memoryServer = await MongoMemoryServer.create();
    await mongoose.connect(memoryServer.getUri());
    console.log('⚠️  Using an in-memory MongoDB (development fallback).');
    console.log('   Data is NOT persisted between restarts. Set MONGODB_URI in server/.env for persistence.');
  } catch (err) {
    console.error('❌ No MONGODB_URI set and the in-memory MongoDB could not start.');
    console.error('   Install MongoDB or set MONGODB_URI in server/.env, then retry.');
    throw err;
  }
};

export const isUsingMemoryServer = () => Boolean(memoryServer);

export const disconnectDB = async () => {
  await mongoose.connection.close();
  if (memoryServer) await memoryServer.stop();
};

export default connectDB;
