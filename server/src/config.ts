import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const envPath = path.resolve(fileURLToPath(new URL('../../.env', import.meta.url)));
dotenv.config({ path: envPath });

function normalizePrivateKey(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return '';

  const withEscapedNewlines = trimmed.replace(/\\n/g, '\n');
  const withWindowsNewlines = withEscapedNewlines.replace(/\r/g, '');

  if (withWindowsNewlines.includes('-----BEGIN PRIVATE KEY-----')) {
    return withWindowsNewlines;
  }

  return trimmed;
}

const rawFirebasePrivateKey = (process.env.FIREBASE_PRIVATE_KEY || '').trim();
const firebasePrivateKey = normalizePrivateKey(rawFirebasePrivateKey);

export function hasValidFirebaseConfig() {
  return Boolean(
    process.env.FIREBASE_PROJECT_ID?.trim() &&
      process.env.FIREBASE_CLIENT_EMAIL?.trim() &&
      firebasePrivateKey.includes('-----BEGIN PRIVATE KEY-----') &&
      firebasePrivateKey.includes('-----END PRIVATE KEY-----'),
  );
}

export function hasValidGeminiConfig() {
  const apiKey = (process.env.GEMINI_API_KEY || '').trim();
  return Boolean(apiKey && apiKey.length >= 20);
}

export function hasRequiredFrontendFirebaseConfig() {
  return Boolean(
    process.env.VITE_FIREBASE_API_KEY?.trim() &&
      process.env.VITE_FIREBASE_AUTH_DOMAIN?.trim() &&
      process.env.VITE_FIREBASE_PROJECT_ID?.trim() &&
      process.env.VITE_FIREBASE_STORAGE_BUCKET?.trim() &&
      process.env.VITE_FIREBASE_MESSAGING_SENDER_ID?.trim() &&
      process.env.VITE_FIREBASE_APP_ID?.trim(),
  );
}

export const config = {
  port: Number(process.env.PORT || 4000),
  mongoUri: process.env.MONGODB_URI || '',
  mongoDbName: process.env.MONGODB_DB_NAME || 'checkmysite',
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  geminiModel: process.env.GEMINI_MODEL || 'gemma-4-26b-a4b-it',
  firebaseProjectId: process.env.FIREBASE_PROJECT_ID || '',
  firebaseClientEmail: process.env.FIREBASE_CLIENT_EMAIL || '',
  firebasePrivateKey,
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
};
