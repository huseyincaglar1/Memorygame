import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyApnYtiwZdf-AMPMHNs0r-bVYQDuJ1sLnY",
  authDomain: "memorygame-9ea1d.firebaseapp.com",
  projectId: "memorygame-9ea1d",
  storageBucket: "memorygame-9ea1d.firebasestorage.app",
  messagingSenderId: "567935112715",
  appId: "1:567935112715:web:08c52d41eda08606e0d90e",
  measurementId: "G-TBDDZRWM75"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
export default app;

/* Firebase hizmetlerini projede kullanmak için Firebase'i başlatır ve Firestore veritabanını yapılandırır */