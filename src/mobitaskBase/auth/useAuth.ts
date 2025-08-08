import { useState, useEffect } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../../../firebaseConfig';

export interface UserProfile {
    uid: string;
    email: string;
    name: string;
    role: 'admin' | 'colaborador';
    companyId: string;
    permissions?: string[];
    activeModules?: string[];
    lastLogin?: number;
    createdAt?: number;
    updatedAt?: number;
}

export interface AuthState {
    user: UserProfile | null;
    role: 'admin' | 'colaborador' | null;
    companyId: string | null;
    loading: boolean;
    error: string | null;
}

export interface UseAuthReturn extends AuthState {
    hasPermission: (permission: string) => boolean;
    hasModuleAccess: (moduleId: string) => boolean;
    isAdmin: boolean;
    isColaborador: boolean;
    refreshUser: () => Promise<void>;
}

export const useAuth = (): UseAuthReturn => {
    const [authState, setAuthState] = useState<AuthState>({
        user: null,
        role: null,
        companyId: null,
        loading: true,
        error: null
    });

    const [userDocUnsubscribe, setUserDocUnsubscribe] = useState<(() => void) | null>(null);

    // Subscribe to Firebase Auth state changes
    useEffect(() => {
        const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                try {
                    await loadUserProfile(firebaseUser);
                } catch (error) {
                    console.error('Error loading user profile:', error);
                    setAuthState(prev => ({
                        ...prev,
                        loading: false,
                        error: 'Failed to load user profile'
                    }));
                }
            } else {
                // User is signed out
                if (userDocUnsubscribe) {
                    userDocUnsubscribe();
                    setUserDocUnsubscribe(null);
                }

                setAuthState({
                    user: null,
                    role: null,
                    companyId: null,
                    loading: false,
                    error: null
                });
            }
        });

        return () => {
            unsubscribeAuth();
            if (userDocUnsubscribe) {
                userDocUnsubscribe();
            }
        };
    }, [userDocUnsubscribe]);

    const loadUserProfile = async (firebaseUser: User) => {
        try {
            setAuthState(prev => ({ ...prev, loading: true, error: null }));

            // Clean up previous subscription
            if (userDocUnsubscribe) {
                userDocUnsubscribe();
            }

            // Subscribe to user document changes
            const userDocRef = doc(db, 'users', firebaseUser.uid);

            const unsubscribe = onSnapshot(
                userDocRef,
                (doc) => {
                    if (doc.exists()) {
                        const userData = doc.data();
                        const userProfile: UserProfile = {
                            uid: firebaseUser.uid,
                            email: firebaseUser.email || '',
                            name: userData.name || firebaseUser.displayName || '',
                            role: userData.role || 'colaborador',
                            companyId: userData.companyId || '',
                            permissions: userData.permissions || [],
                            activeModules: userData.activeModules || [],
                            lastLogin: userData.lastLogin,
                            createdAt: userData.createdAt,
                            updatedAt: userData.updatedAt
                        };

                        setAuthState({
                            user: userProfile,
                            role: userProfile.role,
                            companyId: userProfile.companyId,
                            loading: false,
                            error: null
                        });

                        // Update last login timestamp
                        updateLastLogin(firebaseUser.uid);
                    } else {
                        // User document doesn't exist, create it
                        createUserDocument(firebaseUser);
                    }
                },
                (error) => {
                    console.error('Error listening to user document:', error);
                    setAuthState(prev => ({
                        ...prev,
                        loading: false,
                        error: 'Failed to load user profile'
                    }));
                }
            );

            setUserDocUnsubscribe(() => unsubscribe);

        } catch (error) {
            console.error('Error in loadUserProfile:', error);
            setAuthState(prev => ({
                ...prev,
                loading: false,
                error: 'Failed to load user profile'
            }));
        }
    };

    const createUserDocument = async (firebaseUser: User) => {
        try {
            // In a real app, you might want to prompt the user for additional info
            // or have an admin assign them to a company
            const userData = {
                name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
                email: firebaseUser.email,
                role: 'colaborador', // Default role
                companyId: '', // Would be assigned by admin
                permissions: [],
                activeModules: [],
                createdAt: Date.now(),
                updatedAt: Date.now(),
                lastLogin: Date.now()
            };

            const userDocRef = doc(db, 'users', firebaseUser.uid);
            await setDoc(userDocRef, userData);

        } catch (error) {
            console.error('Error creating user document:', error);
            setAuthState(prev => ({
                ...prev,
                loading: false,
                error: 'Failed to create user profile'
            }));
        }
    };

    const updateLastLogin = async (uid: string) => {
        try {
            const userDocRef = doc(db, 'users', uid);
            await updateDoc(userDocRef, {
                lastLogin: Date.now(),
                updatedAt: Date.now()
            });
        } catch (error) {
            console.error('Error updating last login:', error);
            // Don't set error state for this non-critical operation
        }
    };

    const refreshUser = async (): Promise<void> => {
        if (auth.currentUser) {
            try {
                setAuthState(prev => ({ ...prev, loading: true }));
                await loadUserProfile(auth.currentUser);
            } catch (error) {
                console.error('Error refreshing user:', error);
                setAuthState(prev => ({
                    ...prev,
                    loading: false,
                    error: 'Failed to refresh user profile'
                }));
            }
        }
    };

    const hasPermission = (permission: string): boolean => {
        if (!authState.user) return false;
        if (authState.user.role === 'admin') return true; // Admins have all permissions
        return authState.user.permissions?.includes(permission) || false;
    };

    const hasModuleAccess = (moduleId: string): boolean => {
        if (!authState.user) return false;
        if (authState.user.role === 'admin') return true; // Admins have access to all modules
        return authState.user.activeModules?.includes(moduleId) || false;
    };

    return {
        ...authState,
        hasPermission,
        hasModuleAccess,
        isAdmin: authState.role === 'admin',
        isColaborador: authState.role === 'colaborador',
        refreshUser
    };
};
