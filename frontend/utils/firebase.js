import { initializeApp, getApps, getApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDybByBZ7_BEHGaax6KKiKeS8BAT1ObR00",
  authDomain: "rankveda-8863.firebaseapp.com",
  projectId: "rankveda-8863",
  storageBucket: "rankveda-8863.firebasestorage.app",
  messagingSenderId: "372866144724",
  appId: "1:372866144724:web:1da09afc6e1695d6629e41",
  measurementId: "G-ZPC84KD6Z3"
};

// Initialize Firebase (SSR friendly: avoid duplicate initialization)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Analytics safely on client side
let analytics;
if (typeof window !== "undefined") {
  analytics = getAnalytics(app);
}

export { app, analytics };
