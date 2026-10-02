const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.join(process.cwd(), '.env') });
const env = process.env;
const requiredBackend = ['MONGODB_URI','MONGODB_DB_NAME','GEMINI_API_KEY','GEMINI_MODEL','FIREBASE_PROJECT_ID','FIREBASE_CLIENT_EMAIL','FIREBASE_PRIVATE_KEY'];
const requiredFrontend = ['VITE_FIREBASE_API_KEY','VITE_FIREBASE_AUTH_DOMAIN','VITE_FIREBASE_PROJECT_ID','VITE_FIREBASE_STORAGE_BUCKET','VITE_FIREBASE_MESSAGING_SENDER_ID','VITE_FIREBASE_APP_ID'];
console.log('BACKEND_PRESENT');
for (const key of requiredBackend) console.log(key + '=' + Boolean((env[key] || '').trim()));
console.log('FRONTEND_PRESENT');
for (const key of requiredFrontend) console.log(key + '=' + Boolean((env[key] || '').trim()));
console.log('PROJECT_MATCH=' + ((env.FIREBASE_PROJECT_ID || '') === (env.VITE_FIREBASE_PROJECT_ID || '')));
console.log('EMAIL_PRESENT=' + Boolean((env.FIREBASE_CLIENT_EMAIL || '').trim()));
console.log('PRIVATE_KEY_PEM=' + ((env.FIREBASE_PRIVATE_KEY || '').includes('-----BEGIN PRIVATE KEY-----') && (env.FIREBASE_PRIVATE_KEY || '').includes('-----END PRIVATE KEY-----')));
console.log('VITE_AUTH_DOMAIN_VALID=' + ((env.VITE_FIREBASE_AUTH_DOMAIN || '').includes('firebaseapp.com') || (env.VITE_FIREBASE_AUTH_DOMAIN || '').includes('web.app')));
try {
  const admin = require('firebase-admin');
  const key = (env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n');
  admin.initializeApp({ credential: admin.credential.cert({ projectId: env.FIREBASE_PROJECT_ID, clientEmail: env.FIREBASE_CLIENT_EMAIL, privateKey: key }) });
  admin.auth().listUsers(1).then(() => console.log('FIREBASE_ADMIN_OK=true')).catch((e) => console.log('FIREBASE_ADMIN_OK=false: ' + (e && e.message ? e.message : String(e))));
} catch (e) {
  console.log('FIREBASE_ADMIN_INIT_ERROR=' + (e && e.message ? e.message : String(e)));
}
