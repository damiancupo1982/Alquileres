import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDGeY4CpjhNdzFFvQ8Nat_qpyW-H3ssHlI",
  authDomain: "alquileres-cupo.firebaseapp.com",
  projectId: "alquileres-cupo",
  storageBucket: "alquileres-cupo.firebasestorage.app",
  messagingSenderId: "102810542850",
  appId: "1:102810542850:web:699dfab0ab0222fb10181b"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);

export default app;