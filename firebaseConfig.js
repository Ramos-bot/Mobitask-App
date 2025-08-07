
// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDeOyyWNRt3QFMbqiOoKtDVcg4lXjnZ29w",
    authDomain: "mobitask-aqua-app.firebaseapp.com",
    projectId: "mobitask-aqua-app",
    storageBucket: "mobitask-aqua-app.firebasestorage.app",
    messagingSenderId: "92745170017",
    appId: "1:92745170017:web:3d4750fb77428c5d4b3e20"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
const db = getFirestore(app);
const storage = getStorage(app);
const auth = getAuth(app);
const functions = getFunctions(app);

// Configure for development (opcional - descomente para desenvolvimento local)
// if (__DEV__) {
//     connectAuthEmulator(auth, "http://localhost:9099");
//     connectFirestoreEmulator(db, "localhost", 8080);
//     connectStorageEmulator(storage, "localhost", 9199);
//     connectFunctionsEmulator(functions, "localhost", 5001);
// }

export { db, storage, auth, functions };
