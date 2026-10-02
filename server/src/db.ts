import dns from 'node:dns';
import mongoose from 'mongoose';
import { config } from './config.js';

function configureMongoDns() {
  const servers = ['8.8.8.8', '1.1.1.1'];
  try {
    dns.setServers(servers);
    console.log('MongoDB DNS configured with public resolver servers for SRV lookup.');
  } catch (error) {
    console.warn('MongoDB DNS configuration failed:', error instanceof Error ? error.message : error);
  }
}

export async function connectDatabase() {
  if (!config.mongoUri) {
    throw new Error('MongoDB URI is not configured.');
  }

  configureMongoDns();

  const dbName = config.mongoDbName || 'checkmysite';
  console.log(`Connecting to MongoDB database: ${dbName}`);

  await mongoose.connect(config.mongoUri, {
    dbName,
    serverSelectionTimeoutMS: 15000,
  });

  console.log(`MongoDB connection established for database: ${dbName}`);
}
