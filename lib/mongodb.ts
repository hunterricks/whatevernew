import mongoose from 'mongoose';

declare global {
  var mongooseCache: {
    conn: mongoose.Connection | null;
    promise: Promise<mongoose.Connection> | null;
  } | undefined;
}

const isWebContainer = process.env.NEXT_PUBLIC_ENV_MODE === 'webcontainer';

if (isWebContainer) {
  // In web container mode, we do not connect to MongoDB
  async function dbConnect() {
    console.log('Running in web container mode. Skipping MongoDB connection.');
    return null;
  }

  export default dbConnect;
} else {
  const MONGODB_URI = process.env.MONGODB_URI;

  if (!MONGODB_URI) {
    throw new Error('Please define the MONGODB_URI environment variable');
  }

  let cached = global.mongooseCache;

  if (!cached) {
    cached = global.mongooseCache = { conn: null, promise: null };
  }

  async function dbConnect() {
    if (cached?.conn) {
      return cached.conn;
    }

    if (!cached?.promise) {
      const opts = {
        bufferCommands: false,
      };

      cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
        console.log('Connected to MongoDB');
        return mongoose.connection;
      });
    }

    try {
      cached.conn = await cached.promise;
    } catch (e) {
      cached.promise = null;
      console.error('MongoDB connection error:', e);
      throw e;
    }

    return cached.conn;
  }

  export default dbConnect;
}