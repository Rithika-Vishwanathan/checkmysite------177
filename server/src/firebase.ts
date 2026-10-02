import admin from 'firebase-admin';
import { config, hasValidFirebaseConfig } from './config.js';

if (!admin.apps.length && hasValidFirebaseConfig()) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: config.firebaseProjectId,
        clientEmail: config.firebaseClientEmail,
        privateKey: config.firebasePrivateKey,
      }),
    });
  } catch (error) {
    console.warn('Firebase Admin initialization skipped because the configured service account is invalid:', error instanceof Error ? error.message : error);
  }
}

export const firebaseAdmin = admin;
