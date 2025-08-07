// Firebase configuration with environment support
import { initializeApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';

// Configuration for different environments
const firebaseConfigs = {
    production: {
        apiKey: "AIzaSyDeOyyWNRt3QFMbqiOoKtDVcg4lXjnZ29w",
        authDomain: "mobitask-aqua-app.firebaseapp.com",
        projectId: "mobitask-aqua-app",
        storageBucket: "mobitask-aqua-app.firebasestorage.app",
        messagingSenderId: "92745170017",
        appId: "1:92745170017:web:3d4750fb77428c5d4b3e20"
    },
    development: {
        // Use same config for development, or create a separate Firebase project
        apiKey: "AIzaSyDeOyyWNRt3QFMbqiOoKtDVcg4lXjnZ29w",
        authDomain: "mobitask-aqua-app.firebaseapp.com",
        projectId: "mobitask-aqua-app",
        storageBucket: "mobitask-aqua-app.firebasestorage.app",
        messagingSenderId: "92745170017",
        appId: "1:92745170017:web:3d4750fb77428c5d4b3e20"
    }
};

// Determine environment
const isDevelopment = __DEV__ || process.env.NODE_ENV === 'development';
const environment = isDevelopment ? 'development' : 'production';

// Get appropriate config
const firebaseConfig = firebaseConfigs[environment];

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
const db = getFirestore(app);
const storage = getStorage(app);
const auth = getAuth(app);
const functions = getFunctions(app);

// Configure emulators for development
if (isDevelopment && !auth._delegate._config?.emulator) {
    try {
        // Only connect to emulators if they're not already connected
        console.log('🔧 Connecting to Firebase emulators...');

        // Uncomment these lines if you want to use Firebase emulators
        // connectAuthEmulator(auth, "http://localhost:9099");
        // connectFirestoreEmulator(db, "localhost", 8080);
        // connectStorageEmulator(storage, "localhost", 9199);
        // connectFunctionsEmulator(functions, "localhost", 5001);

        console.log('✅ Firebase configured for development');
    } catch (error) {
        console.log('⚠️  Firebase emulators not available, using production services');
    }
} else {
    console.log('🚀 Firebase configured for production');
}

// Export Firebase services
export {
    app,
    db,
    storage,
    auth,
    functions,
    firebaseConfig,
    environment
};

// Export utility functions
export const isEmulatorMode = () => {
    return isDevelopment && auth._delegate._config?.emulator;
};

export const getFirebaseEnv = () => environment;
