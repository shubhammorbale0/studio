import { initializeApp, getApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  projectId: "studio-9708419441-38785",
  appId: "1:1032371636067:web:08a5071d919715b4f0b556",
  storageBucket: "studio-9708419441-38785.firebasestorage.app",
  apiKey: "AIzaSyAwNoOfefoRJPXOaLGIC569mjaWI9GcUMA",
  authDomain: "studio-9708419441-38785.firebaseapp.com",
  measurementId: "",
  messagingSenderId: "1032371636067"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

export { app, db };
