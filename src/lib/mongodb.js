// This file is no longer used for the primary database connection,
// but might be kept for other potential direct MongoDB interactions
// if needed in the future. The main connection is now handled by
// `src/lib/mongoose.js`.

import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB_NAME = process.env.MONGODB_DB_NAME;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env');
}

if (!MONGODB_DB_NAME) {
  throw new Error('Please define the MONGODB_DB_NAME environment variable inside .env');
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections from growing exponentially
 * during API Route usage.
 */
let cachedClient = null;
let cachedDb = null;

export async function connectToDatabase() {
  if (cachedClient && cachedDb) {
    return cachedDb;
  }

  const client = new MongoClient(MONGODB_URI);

  if (!cachedClient) {
    cachedClient = await client.connect();
  }
  
  const db = cachedClient.db(MONGODB_DB_NAME);

  cachedDb = db;

  return db;
}
