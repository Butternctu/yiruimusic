import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Only initialize if we have a config (at least apiKey and projectId)
// This prevents the whole app from crashing if .env is not yet set up
let app = null;
let auth = null;
let db = null;
let initializationError = null;

try {
  const missingKeys = [];
  if (!firebaseConfig.apiKey) missingKeys.push('API Key');
  if (!firebaseConfig.projectId) missingKeys.push('Project ID');
  
  if (missingKeys.length === 0 && firebaseConfig.apiKey !== 'your-api-key') {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
  } else {
    initializationError = missingKeys.length > 0 
      ? `Missing Firebase configuration: ${missingKeys.join(', ')}. Check your .env file or GitHub Secrets.`
      : "Firebase is using placeholder credentials.";
    console.warn(initializationError);
  }
} catch (error) {
  initializationError = `Firebase initialization failed: ${error.message}`;
  console.error(initializationError);
}

export { auth, db, initializationError };
export default app;
