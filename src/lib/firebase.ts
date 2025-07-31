import { initializeApp, type FirebaseApp } from "firebase/app";
import { getFirestore, connectFirestoreEmulator, type Firestore } from "firebase/firestore";
import { getAuth, connectAuthEmulator, type Auth } from "firebase/auth";
import { isDemoMode } from "./demo-data";

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// App ID for namespacing
export const APP_ID = process.env.NEXT_PUBLIC_APP_ID || "kol-evaluation-platform";

// Initialize Firebase app and services
let app: FirebaseApp | null = null;
let db: Firestore | null = null;
let auth: Auth | null = null;

try {
  // Only initialize if we have the required config and not in demo mode
  if (!isDemoMode() && firebaseConfig.apiKey && firebaseConfig.projectId) {
    console.log("🔥 Initializing Firebase with real configuration...");

    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    auth = getAuth(app);

    // Enable persistence for better offline support
    if (typeof window !== 'undefined') {
      // Only enable emulator in development
      if (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === 'true') {
        try {
          connectFirestoreEmulator(db, 'localhost', 8080);
          connectAuthEmulator(auth, 'http://localhost:9099');
          console.log("🔧 Connected to Firebase emulators");
        } catch (error) {
          console.log("Emulator connection failed (already connected):", error);
        }
      }
    }

    console.log("✅ Firebase initialized successfully");
  } else {
    console.log("🎭 Running in demo mode - Firebase not initialized");
    if (isDemoMode()) {
      console.log("  Reason: Demo mode enabled");
    } else {
      console.log("  Reason: Missing Firebase configuration");
      console.log("  Required env vars:", {
        apiKey: !!firebaseConfig.apiKey,
        projectId: !!firebaseConfig.projectId,
        authDomain: !!firebaseConfig.authDomain
      });
    }
  }
} catch (error) {
  console.error("❌ Firebase initialization failed:", error);
  console.log("🎭 Falling back to demo mode");
}

export { db, auth, app };

// Configuration validation
export const getFirebaseStatus = () => {
  return {
    isConfigured: !isDemoMode(),
    hasAuth: !!auth,
    hasFirestore: !!db,
    config: {
      projectId: firebaseConfig.projectId,
      authDomain: firebaseConfig.authDomain,
      hasApiKey: !!firebaseConfig.apiKey
    }
  };
};

// Helper to check if Firebase is available
export const isFirebaseAvailable = () => {
  return !isDemoMode() && !!db && !!auth;
};
