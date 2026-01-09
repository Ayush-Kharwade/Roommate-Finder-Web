import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage"; // 1. Import getStorage

const firebaseConfig = {
    // ... your config object remains the same
    apiKey: import.meta.VITE_API_KEY,
    authDomain: import.meta.VITE_AUTH_DOMAIN,
    projectId: import.meta.VITE_PROJECT_ID,
    storageBucket: import.meta.VITE_STORAGE_BUCKET,
    messagingSenderId: import.meta.VITE_MESSAGING_SENDER_ID,
    appId: import.meta.VITE_APP_ID
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app); // 2. Initialize and export storage