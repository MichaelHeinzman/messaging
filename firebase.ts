// Import the functions you need from the SDKs you need
import { initializeApp, getApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAaazGQmJACcw3CWYN9d1dsFPKL4zA5KUo",
  authDomain: "messaging-976f2.firebaseapp.com",
  projectId: "messaging-976f2",
  storageBucket: "messaging-976f2.appspot.com",
  messagingSenderId: "533031772477",
  appId: "1:533031772477:web:4433baa7a75627e9916554",
  measurementId: "G-VD7LJKHSN8",
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
const auth = getAuth();

export default app;
export { auth, db };
