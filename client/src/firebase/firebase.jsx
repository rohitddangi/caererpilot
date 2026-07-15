import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const isPlaceholder = (val) => !val || val.includes('your-') || val.includes('placeholder');

export const isFirebaseConfigured = !isPlaceholder(firebaseConfig.apiKey) && !isPlaceholder(firebaseConfig.projectId);

let app = null;
let auth = null;
let googleProvider = null;

if (isFirebaseConfigured) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);
    googleProvider = new GoogleAuthProvider();
    // Prompt option for user account selection
    googleProvider.setCustomParameters({ prompt: 'select_account' });
  } catch (error) {
    console.error('[Firebase] Failed to initialize Firebase client:', error);
  }
}

export { auth, googleProvider };
