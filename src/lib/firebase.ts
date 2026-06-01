import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";

/**
 * Firebase configuration object.
 * Values are populated from environment variables defined in .env.local.
 */
const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

/**
 * Firebase application instance.
 * Uses a singleton pattern to ensure only one instance is initialized 
 * in Next.js development and production environments.
 */
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

/**
 * Firebase authentication service instance.
 */
const auth = getAuth(app);


export { app, auth };
