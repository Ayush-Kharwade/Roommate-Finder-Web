import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage"; // 1. Import getStorage

const firebaseConfig = {
    // ... your config object remains the same
    apiKey: "AIzaSyAYd9WjzNp4RQK9oPX31gCBdbfCHcsRVb4",
    authDomain: "roommatefinder-259c8.firebaseapp.com",
    projectId: "roommatefinder-259c8",
    storageBucket: "roommatefinder-259c8.firebasestorage.app",
    messagingSenderId: "104872560630",
    appId: "1:104872560630:web:11f285546f36d5439069d7"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app); // 2. Initialize and export storage