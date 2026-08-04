import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  query, 
  where, 
  getDocs, 
  onSnapshot 
} from 'firebase/firestore';

import fallbackFirebaseConfig from '../../firebase-applet-config.json';

// Prefer Vite env vars (VITE_FIREBASE_*) if they're set - e.g. in Vercel
// project settings - and fall back to the committed config file otherwise.
// Note: Firebase's web SDK config (apiKey, authDomain, etc.) is meant to be
// public and shipped in the client bundle; it's not a secret the way a
// database password is - real access control comes from Firebase
// Auth/Security Rules, not from hiding these values.
const env = import.meta.env;
const firebaseConfig = {
  projectId: env.VITE_FIREBASE_PROJECT_ID || fallbackFirebaseConfig.projectId,
  appId: env.VITE_FIREBASE_APP_ID || fallbackFirebaseConfig.appId,
  apiKey: env.VITE_FIREBASE_API_KEY || fallbackFirebaseConfig.apiKey,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || fallbackFirebaseConfig.authDomain,
  firestoreDatabaseId: env.VITE_FIREBASE_FIRESTORE_DATABASE_ID || fallbackFirebaseConfig.firestoreDatabaseId,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || fallbackFirebaseConfig.storageBucket,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || fallbackFirebaseConfig.messagingSenderId,
  measurementId: env.VITE_FIREBASE_MEASUREMENT_ID || fallbackFirebaseConfig.measurementId,
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== '(default)'
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

export const storage = {
  ref: () => ({
    put: async () => ({ ref: { getDownloadURL: async () => "" } })
  })
};

export {
  app,
  auth,
  db,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile,
  doc,
  setDoc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  onSnapshot
};
