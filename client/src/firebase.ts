import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail, signOut } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
};

const hasFirebaseConfig = Object.values(firebaseConfig).every(Boolean);

if (!hasFirebaseConfig) {
  console.warn('Firebase web config is incomplete. Check the VITE_FIREBASE_* values in the environment.');
}

const app = hasFirebaseConfig
  ? getApps().length > 0
    ? getApp()
    : initializeApp(firebaseConfig)
  : null;

export const auth = app ? getAuth(app) : null;
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export async function signUpWithEmail(email: string, password: string) {
  if (!auth) {
    throw new Error('Firebase authentication is not configured.');
  }
  return createUserWithEmailAndPassword(auth, email, password);
}

export async function loginWithEmail(email: string, password: string) {
  if (!auth) {
    throw new Error('Firebase authentication is not configured.');
  }
  return signInWithEmailAndPassword(auth, email, password);
}

export async function loginWithGoogle() {
  if (!auth) {
    throw new Error('Firebase authentication is not configured.');
  }
  return signInWithPopup(auth, googleProvider);
}

export async function resetPassword(email: string) {
  if (!auth) {
    throw new Error('Firebase authentication is not configured.');
  }
  return sendPasswordResetEmail(auth, email);
}

export async function logout() {
  if (!auth) {
    return Promise.resolve();
  }
  return signOut(auth);
}
