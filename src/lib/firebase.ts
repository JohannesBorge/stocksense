'use client';

import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyCcAFgZzQ7ZXWqc4SHZ5QxwsD8DEFRjM9o",
  authDomain: "stocksense-28b34.firebaseapp.com",
  projectId: "stocksense-28b34",
  storageBucket: "stocksense-28b34.firebasestorage.app",
  messagingSenderId: "685169630434",
  appId: "1:685169630434:web:b61ef7bfcf5a2b37d812bb"
};

// Initialize Firebase only if we have the required environment variables
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);

export { app, auth }; 