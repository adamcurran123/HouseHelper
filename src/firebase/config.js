import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';


const firebaseConfig = {
  apiKey: "AIzaSyAUEuSCLOKo3_m7twypS2IghOkUBJhB5rw",
  authDomain: "househelper-ce603.firebaseapp.com",
  projectId: "househelper-ce603",
  storageBucket: "househelper-ce603.firebasestorage.app",
  messagingSenderId: "803581737742",
  appId: "1:803581737742:web:9d46ed4200982cb4b3b55f",
  measurementId: "G-92PXTRNDLL"
};


const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);