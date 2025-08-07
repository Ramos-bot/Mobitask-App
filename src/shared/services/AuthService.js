import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    sendPasswordResetEmail,
    updateProfile,
    sendEmailVerification,
    onAuthStateChanged
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase.config';
import AsyncStorage from '@react-native-async-storage/async-storage';

class AuthService {
    constructor() {
        this.currentUser = null;
        this.authStateListeners = [];
        this.setupAuthStateListener();
    }

    // Setup authentication state listener
    setupAuthStateListener() {
        onAuthStateChanged(auth, async (user) => {
            this.currentUser = user;

            if (user) {
                // User is signed in
                await this.cacheUserData(user);
                console.log('✅ User authenticated:', user.email);
            } else {
                // User is signed out
                await this.clearCachedData();
                console.log('👋 User signed out');
            }

            // Notify all listeners
            this.authStateListeners.forEach(listener => listener(user));
        });
    }

    // Add auth state listener
    addAuthStateListener(callback) {
        this.authStateListeners.push(callback);

        // Return unsubscribe function
        return () => {
            const index = this.authStateListeners.indexOf(callback);
            if (index > -1) {
                this.authStateListeners.splice(index, 1);
            }
        };
    }

    // Sign in with email and password
    async signIn(email, password) {
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Load user profile from Firestore
            const userProfile = await this.getUserProfile(user.uid);

            return {
                success: true,
                user: {
                    uid: user.uid,
                    email: user.email,
                    emailVerified: user.emailVerified,
                    ...userProfile
                }
            };
        } catch (error) {
            console.error('❌ Sign in error:', error);
            return {
                success: false,
                error: this.getErrorMessage(error.code)
            };
        }
    }

    // Sign up with email and password
    async signUp(email, password, userData = {}) {
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Update user profile
            await updateProfile(user, {
                displayName: userData.name || email.split('@')[0]
            });

            // Create user document in Firestore
            const userProfile = {
                uid: user.uid,
                email: user.email,
                name: userData.name || email.split('@')[0],
                createdAt: new Date(),
                emailVerified: false,
                subscription: {
                    plan: 'free',
                    modules: ['base']
                },
                preferences: {
                    notifications: true,
                    darkMode: false,
                    language: 'pt'
                },
                ...userData
            };

            await setDoc(doc(db, 'users', user.uid), userProfile);

            // Send email verification
            await this.sendEmailVerification();

            return {
                success: true,
                user: userProfile
            };
        } catch (error) {
            console.error('❌ Sign up error:', error);
            return {
                success: false,
                error: this.getErrorMessage(error.code)
            };
        }
    }

    // Sign out
    async signOut() {
        try {
            await signOut(auth);
            await this.clearCachedData();
            return { success: true };
        } catch (error) {
            console.error('❌ Sign out error:', error);
            return {
                success: false,
                error: this.getErrorMessage(error.code)
            };
        }
    }

    // Send password reset email
    async resetPassword(email) {
        try {
            await sendPasswordResetEmail(auth, email);
            return {
                success: true,
                message: 'Email de recuperação enviado'
            };
        } catch (error) {
            console.error('❌ Password reset error:', error);
            return {
                success: false,
                error: this.getErrorMessage(error.code)
            };
        }
    }

    // Send email verification
    async sendEmailVerification() {
        try {
            if (auth.currentUser) {
                await sendEmailVerification(auth.currentUser);
                return {
                    success: true,
                    message: 'Email de verificação enviado'
                };
            }
            return {
                success: false,
                error: 'Nenhum utilizador autenticado'
            };
        } catch (error) {
            console.error('❌ Email verification error:', error);
            return {
                success: false,
                error: this.getErrorMessage(error.code)
            };
        }
    }

    // Get user profile from Firestore
    async getUserProfile(uid) {
        try {
            const userDoc = await getDoc(doc(db, 'users', uid));
            if (userDoc.exists()) {
                return userDoc.data();
            }
            return null;
        } catch (error) {
            console.error('❌ Get user profile error:', error);
            return null;
        }
    }

    // Update user profile
    async updateUserProfile(updates) {
        try {
            if (!auth.currentUser) {
                throw new Error('No authenticated user');
            }

            const uid = auth.currentUser.uid;
            await setDoc(doc(db, 'users', uid), updates, { merge: true });

            return { success: true };
        } catch (error) {
            console.error('❌ Update profile error:', error);
            return {
                success: false,
                error: this.getErrorMessage(error.code)
            };
        }
    }

    // Cache user data locally
    async cacheUserData(user) {
        try {
            const userData = {
                uid: user.uid,
                email: user.email,
                emailVerified: user.emailVerified,
                lastLogin: new Date().toISOString()
            };
            await AsyncStorage.setItem('userData', JSON.stringify(userData));
        } catch (error) {
            console.error('❌ Cache user data error:', error);
        }
    }

    // Get cached user data
    async getCachedUserData() {
        try {
            const userData = await AsyncStorage.getItem('userData');
            return userData ? JSON.parse(userData) : null;
        } catch (error) {
            console.error('❌ Get cached user data error:', error);
            return null;
        }
    }

    // Clear cached data
    async clearCachedData() {
        try {
            await AsyncStorage.removeItem('userData');
        } catch (error) {
            console.error('❌ Clear cached data error:', error);
        }
    }

    // Get current user
    getCurrentUser() {
        return this.currentUser;
    }

    // Check if user is authenticated
    isAuthenticated() {
        return !!this.currentUser;
    }

    // Get error message in Portuguese
    getErrorMessage(errorCode) {
        const errorMessages = {
            'auth/user-not-found': 'Utilizador não encontrado',
            'auth/wrong-password': 'Palavra-passe incorreta',
            'auth/email-already-in-use': 'Email já está em uso',
            'auth/weak-password': 'Palavra-passe muito fraca',
            'auth/invalid-email': 'Email inválido',
            'auth/too-many-requests': 'Demasiadas tentativas. Tente novamente mais tarde',
            'auth/network-request-failed': 'Erro de rede. Verifique a sua conexão',
            'auth/invalid-credential': 'Credenciais inválidas'
        };

        return errorMessages[errorCode] || 'Erro de autenticação desconhecido';
    }
}

// Export singleton instance
export default new AuthService();
