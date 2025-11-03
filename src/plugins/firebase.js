// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

//Importar getFirestore desde 'firebase/firestore'
import { getFirestore } from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB4ueEl2Lx5Cwi7dGTAsnxMvmWEGZgEruQ", 
  authDomain: "proyecto-integrador-equipo.firebaseapp.com",
  projectId: "proyecto-integrador-equipo",
  storageBucket: "proyecto-integrador-equipo.firebasestorage.app",
  messagingSenderId: "299993128781",
  appId: "1:299993128781:web:449bcadb4a0027de0b2104",
  measurementId: "G-MK0HFKDD10"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// 
const db = getFirestore(app);

// Exporta 'db' para usarla en los componentes
export { app, analytics, db };