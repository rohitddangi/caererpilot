import { initializeApp } from 'firebase-admin/app';
import { cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

let isFirebaseAdminInitialized = false;
let firebaseApp = null;

export function initializeFirebaseAdmin() {
  if (isFirebaseAdminInitialized) return;

  const projectId = process.env.FIREBASE_PROJECT_ID || process.env.VITE_FIREBASE_PROJECT_ID;
  const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT;

  if (serviceAccount) {
    try {
      const parsedAccount = JSON.parse(serviceAccount);
      firebaseApp = initializeApp({
        credential: cert(parsedAccount),
      });
      isFirebaseAdminInitialized = true;
      console.log('✅ [Firebase Admin] Initialized with Service Account Credential.');
    } catch (error) {
      console.error('❌ [Firebase Admin] Failed to parse/initialize Service Account JSON:', error.message);
    }
  } else if (projectId) {
    try {
      firebaseApp = initializeApp({
        projectId,
      });
      isFirebaseAdminInitialized = true;
      console.log(`✅ [Firebase Admin] Initialized with Project ID: ${projectId}.`);
    } catch (error) {
      console.error('❌ [Firebase Admin] Failed to initialize using Project ID:', error.message);
    }
  } else {
    console.warn('⚠️  [Firebase Admin] No credentials configured. Running in developer-mode fallback.');
  }
}

export function isFirebaseConfigured() {
  return isFirebaseAdminInitialized;
}

export function getFirebaseAuth() {
  if (!isFirebaseAdminInitialized) {
    throw new Error('Firebase Admin SDK is not initialized.');
  }
  return getAuth(firebaseApp);
}

export default {
  auth: () => getFirebaseAuth(),
};

