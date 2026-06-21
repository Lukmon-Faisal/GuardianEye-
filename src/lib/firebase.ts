import { initializeApp, getApps, getApp } from "firebase/app";
import { initializeFirestore } from "firebase/firestore";

// Configured values from AI Studio setup
const FALLBACK_CONFIG = {
  apiKey: "AIzaSyA943Pfzeb8yrwMRUQ4nwgYK9EdlCQaruM",
  authDomain: "probable-influence-vjkt0.firebaseapp.com",
  projectId: "probable-influence-vjkt0",
  storageBucket: "probable-influence-vjkt0.firebasestorage.app",
  messagingSenderId: "912842368076",
  appId: "1:912842368076:web:f20d5782db76c2548bc0e9",
  firestoreDatabaseId: "ai-studio-7cc30211-ee40-4094-948e-3e8fb8418881"
};

// Check import.meta.env first, then fallback
const firebaseConfig = {
  apiKey: (import.meta as any).env?.VITE_FIREBASE_API_KEY || FALLBACK_CONFIG.apiKey,
  authDomain: (import.meta as any).env?.VITE_FIREBASE_AUTH_DOMAIN || FALLBACK_CONFIG.authDomain,
  projectId: (import.meta as any).env?.VITE_FIREBASE_PROJECT_ID || FALLBACK_CONFIG.projectId,
  storageBucket: (import.meta as any).env?.VITE_FIREBASE_STORAGE_BUCKET || FALLBACK_CONFIG.storageBucket,
  messagingSenderId: (import.meta as any).env?.VITE_FIREBASE_MESSAGING_SENDER_ID || FALLBACK_CONFIG.messagingSenderId,
  appId: (import.meta as any).env?.VITE_FIREBASE_APP_ID || FALLBACK_CONFIG.appId,
  firestoreDatabaseId: (import.meta as any).env?.VITE_FIREBASE_FIRESTORE_DATABASE_ID || FALLBACK_CONFIG.firestoreDatabaseId
};

// Initialize Firebase App
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Firestore with custom databaseId if provided as third argument
export const db = initializeFirestore(app, {}, firebaseConfig.firestoreDatabaseId || "(default)");
