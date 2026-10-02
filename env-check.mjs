import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
dotenv.config({ path: path.join(process.cwd(), '.env') });
const env = process.env;
const requiredBackend = ['MONGODB_URI','MONGODB_DB_NAME','GEMINI_API_KEY','GEMINI_MODEL'];
const requiredFrontend = ['VITE_FIREBASE_API_KEY','VITE_FIREBASE_AUTH_DOMAIN'];
console.log('BACKEND_PRESENT');
for (const key of requiredBackend) console.log(key + '=' + Boolean((env[key] || '').trim()));
console.log('FRONTEND_PRESENT');
for (const key of requiredFrontend) console.log(key + '=' + Boolean((env[key] || '').trim()));

try {
  const adminModule = await import('firebase-admin').catch(() => null);
  if (adminModule && env.FIREBASE_PRIVATE_KEY) {
    const admin = adminModule.default || adminModule;
    const key = (env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n');
    admin.initializeApp({ credential: admin.credential.cert({ projectId: env.FIREBASE_PROJECT_ID, clientEmail: env.FIREBASE_CLIENT_EMAIL, privateKey: key }) });
    await admin.auth().listUsers(1);
    console.log('FIREBASE_ADMIN_OK=true');
  } else {
    console.log('FIREBASE_ADMIN_OK=optional_disabled');
  }
} catch (e) {
  console.log('FIREBASE_ADMIN_INIT_ERROR=' + (e && e.message ? e.message : String(e)));
}
