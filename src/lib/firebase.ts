
// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics, isSupported } from "firebase/analytics";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBzZlpqCuIYGCCGIRqcf8eA5jvniHRYo_s",
  authDomain: "svsdmediplaza-9cbae.firebaseapp.com",
  projectId: "svsdmediplaza-9cbae",
  storageBucket: "svsdmediplaza-9cbae.appspot.com", // Corrected from firebasestorage.app
  messagingSenderId: "272750299862",
  appId: "1:272750299862:web:c91097b0f4b6cb3d59d777",
  measurementId: "G-5K8Q3F2B1K"
};

// Initialize Firebase
let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

// Initialize Firebase Analytics if supported
let analytics;
if (typeof window !== 'undefined') {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  });
}

export const auth = getAuth(app);
export { app, analytics }; // Export app and analytics
export default app; // Default export app for broader compatibility if needed
