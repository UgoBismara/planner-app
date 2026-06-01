import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyAXdi1h53I67xY4EZ0oHKtI6wtmoXR6hM8',
  authDomain: 'planner-app-83b8b.firebaseapp.com',
  projectId: 'planner-app-83b8b',
  storageBucket: 'planner-app-83b8b.firebasestorage.app',
  messagingSenderId: '551538913932',
  appId: '1:551538913932:web:7fde5ba3f2f25590c341a9',
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
