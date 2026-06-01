import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Remplace ces valeurs par celles de ta console Firebase
// (Project settings → Your apps → SDK setup and configuration)
const firebaseConfig = {
  apiKey: 'REMPLACE_MOI',
  authDomain: 'REMPLACE_MOI',
  projectId: 'REMPLACE_MOI',
  storageBucket: 'REMPLACE_MOI',
  messagingSenderId: 'REMPLACE_MOI',
  appId: 'REMPLACE_MOI',
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
