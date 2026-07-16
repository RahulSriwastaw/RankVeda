import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyDybByBZ7_BEHGaax6KKiKeS8BAT1ObR00",
  authDomain: "rankveda-8863.firebaseapp.com",
  projectId: "rankveda-8863",
  storageBucket: "rankveda-8863.firebasestorage.app",
  messagingSenderId: "372866144724",
  appId: "1:372866144724:web:1da09afc6e1695d6629e41",
  measurementId: "G-ZPC84KD6Z3"
};

// Initialize Firebase (safely for SSR/Next.js)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export { auth, googleProvider, signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword };
