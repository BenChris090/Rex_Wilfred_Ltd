import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAq91YGmKN6_a_p31ux8o0V5goHLeWXyN8",
  authDomain: "rex-wilfred-db.firebaseapp.com",
  projectId: "rex-wilfred-db",
  storageBucket: "rex-wilfred-db.firebasestorage.app",
  messagingSenderId: "782339409977",
  appId: "1:782339409977:web:fefd404663800a022d65e8",
  measurementId: "G-T16N60NXN4"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app); 