import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const envPath = path.resolve(fileURLToPath(new URL('../../.env', import.meta.url)));
dotenv.config({ path: envPath });

export function hasValidGeminiConfig() {
  const apiKey = (process.env.GEMINI_API_KEY || '').trim();
  return Boolean(apiKey && apiKey.length >= 20);
}

export const config = {
  port: Number(process.env.PORT || 4000),
  mongoUri: process.env.MONGODB_URI || '',
  mongoDbName: process.env.MONGODB_DB_NAME || 'checkmysite',
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  geminiModel: process.env.GEMINI_MODEL || 'gemma-4-26b-a4b-it',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
};
