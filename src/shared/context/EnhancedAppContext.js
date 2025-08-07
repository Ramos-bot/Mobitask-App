import React, { createContext, useContext, useReducer, useEffect, useMemo, useCallback } from 'react';
import DataManager from '../services/DataManager';
import AuthService from '../services/AuthService';
import AnalyticsService from '../services/AnalyticsService';
import NotificationManager from '../services/NotificationManager';
import BackupManager from '../services/BackupManager';

// Enhanced App Context with all services integrated
const AppContext = createContext();

// Action types
const ACTIONS = {
    SET_USER: 'SET_USER',
    SET_COMPANY: 'SET_COMPANY',
    SET_CLIENTS: 'SET_CLIENTS',
    ADD_CLIENT: 'ADD_CLIENT',
    UPDATE_CLIENT: 'UPDATE_CLIENT',
    SET_DASHBOARD_STATS: 'SET_DASHBOARD_STATS',
    SET_RECENT_ACTIVITY: 'SET_RECENT_ACTIVITY',
    SET_LOADING: 'SET_LOADING',
    SET_ERROR: 'SET_ERROR',
    CLEAR_ERROR: 'CLEAR_ERROR',
    SET_SUBSCRIPTION: 'SET_SUBSCRIPTION',
    UPDATE_MODULE_ACCESS: 'UPDATE_MODULE_ACCESS',
    SET_TRIAL_STATUS: 'SET_TRIAL_STATUS',
    // New actions for enhanced functionality
    SET_NOTIFICATIONS: 'SET_NOTIFICATIONS',
    SET_ANALYTICS_CONSENT: 'SET_ANALYTICS_CONSENT',
    SET_BACKUP_STATUS: 'SET_BACKUP_STATUS',
    SET_APP_SETTINGS: 'SET_APP_SETTINGS'
};

// Initial state
const initialState = {
    // User and authentication
    user: null,
    isAuthenticated: false,
    authLoading: true,

    // Company and business data
    company: null,
    clients: [],

    // Dashboard and analytics
    dashboardStats: {
        totalClients: 0,
        pendingTasks: 0,
        recentAnalyses: 0,
        activeModules: 0
    },
    recentActivity: [],

    // Subscription and licensing
    userSubscription: {
        plan: 'free',
        status: 'active',
        modules: ['base'],
        expiryDate: null,
        trialDaysLeft: 0
    },

    // App settings and preferences
    appSettings: {
        notifications: true,
        darkMode: false,
        language: 'pt',
        autoBackup: true,
        analyticsConsent: null
    },

    // Notifications
    notifications: [],
    unreadNotifications: 0,

    // Backup status
    backupStatus: {
        lastBackup: null,
        autoBackupEnabled: true,
        backupInProgress: false
    },

    // UI state
    loading: false,
    error: null
};

// Reducer function
function appReducer(state, action) {
    switch (action.type) {
        case ACTIONS.SET_USER:
            return {
                ...state,
                user: action.payload,
                isAuthenticated: !!action.payload,
                authLoading: false
            };

        case ACTIONS.SET_COMPANY:
            return {
                ...state,
                company: action.payload
            };

        case ACTIONS.SET_CLIENTS:
            return {
                ...state,
                clients: action.payload
            };

        case ACTIONS.ADD_CLIENT:
            return {
                ...state,
                clients: [...state.clients, action.payload]
            };

        case ACTIONS.UPDATE_CLIENT:
            return {
                ...state,
                clients: state.clients.map(client =>
                    client.id === action.payload.id ? action.payload : client
                )
            };

        case ACTIONS.SET_DASHBOARD_STATS:
            return {
                ...state,
                dashboardStats: action.payload
            };

        case ACTIONS.SET_RECENT_ACTIVITY:
            return {
                ...state,
                recentActivity: action.payload
            };

        case ACTIONS.SET_NOTIFICATIONS:
            return {
                ...state,
                notifications: action.payload,
                unreadNotifications: action.payload.filter(n => !n.read).length
            };

        case ACTIONS.SET_ANALYTICS_CONSENT:
            return {
                ...state,
                appSettings: {
                    ...state.appSettings,
                    analyticsConsent: action.payload
                }
            };

        case ACTIONS.SET_BACKUP_STATUS:
            return {
                ...state,
                backupStatus: {
                    ...state.backupStatus,
                    ...action.payload
                }
            };

        case ACTIONS.SET_APP_SETTINGS:
            return {
                ...state,
                appSettings: {
                    ...state.appSettings,
                    ...action.payload
                }
            };

        case ACTIONS.SET_SUBSCRIPTION:
            return {
                ...state,
                userSubscription: action.payload
            };

        case ACTIONS.SET_LOADING:
            return {
                ...state,
                loading: action.payload
            };

        case ACTIONS.SET_ERROR:
            return {
                ...state,
                error: action.payload
            };

        case ACTIONS.CLEAR_ERROR:
            return {
                ...state,
                error: null
            };

        default:
            return state;
    }
}

// AppProvider component
export function AppProvider({ children }) {
    const [state, dispatch] = useReducer(appReducer, initialState);

    // Authentication methods
    const signIn = useCallback(async (email, password) => {
        dispatch({ type: ACTIONS.SET_LOADING, payload: true });
        try {
            const result = await AuthService.signIn(email, password);
            if (result.success) {
                dispatch({ type: ACTIONS.SET_USER, payload: result.user });
                AnalyticsService.trackEvent('user_sign_in', {
                    user_id: result.user.uid,
                    method: 'email_password'
                });
            } else {
                dispatch({ type: ACTIONS.SET_ERROR, payload: result.error });
            }
            return result;
        } catch (error) {
            dispatch({ type: ACTIONS.SET_ERROR, payload: error.message });
            return { success: false, error: error.message };
        } finally {
            dispatch({ type: ACTIONS.SET_LOADING, payload: false });
        }
    }, []);

    const signUp = useCallback(async (email, password, userData) => {
        dispatch({ type: ACTIONS.SET_LOADING, payload: true });
        try {
            const result = await AuthService.signUp(email, password, userData);
            if (result.success) {
                dispatch({ type: ACTIONS.SET_USER, payload: result.user });
                AnalyticsService.trackEvent('user_sign_up', {
                    user_id: result.user.uid,
                    method: 'email_password'
                });
            } else {
                dispatch({ type: ACTIONS.SET_ERROR, payload: result.error });
            }
            return result;
        } catch (error) {
            dispatch({ type: ACTIONS.SET_ERROR, payload: error.message });
            return { success: false, error: error.message };
        } finally {
            dispatch({ type: ACTIONS.SET_LOADING, payload: false });
        }
    }, []);

    const signOut = useCallback(async () => {
        try {
            const result = await AuthService.signOut();
            if (result.success) {
                dispatch({ type: ACTIONS.SET_USER, payload: null });
                AnalyticsService.trackEvent('user_sign_out');
            }
            return result;
        } catch (error) {
            dispatch({ type: ACTIONS.SET_ERROR, payload: error.message });
            return { success: false, error: error.message };
        }
    }, []);

    // Notification methods
    const sendNotification = useCallback(async (title, body, data = {}) => {
        try {
            await NotificationManager.sendLocalNotification(title, body, data);
            AnalyticsService.trackEvent('notification_sent', { type: 'local' });
        } catch (error) {
            console.error('Failed to send notification:', error);
        }
    }, []);

    // Backup methods
    const createBackup = useCallback(async () => {
        dispatch({ type: ACTIONS.SET_BACKUP_STATUS, payload: { backupInProgress: true } });
        try {
            const result = await BackupManager.createManualBackup();
            if (result.success) {
                dispatch({
                    type: ACTIONS.SET_BACKUP_STATUS,
                    payload: {
                        lastBackup: new Date(),
                        backupInProgress: false
                    }
                });
                AnalyticsService.trackEvent('backup_created', { type: 'manual' });
            }
            return result;
        } catch (error) {
            dispatch({ type: ACTIONS.SET_BACKUP_STATUS, payload: { backupInProgress: false } });
            throw error;
        }
    }, []);

    // Analytics methods
    const trackScreenView = useCallback((screenName, properties = {}) => {
        AnalyticsService.trackScreenView(screenName, properties);
    }, []);

    const trackUserAction = useCallback((action, target, properties = {}) => {
        AnalyticsService.trackUserAction(action, target, properties);
    }, []);

    // Settings methods
    const updateAppSettings = useCallback(async (newSettings) => {
        dispatch({ type: ACTIONS.SET_APP_SETTINGS, payload: newSettings });

        // Update individual services based on settings
        if ('analyticsConsent' in newSettings) {
            await AnalyticsService.setUserConsent(newSettings.analyticsConsent);
        }

        if ('autoBackup' in newSettings) {
            if (newSettings.autoBackup) {
                await BackupManager.scheduleAutoBackup();
            } else {
                await BackupManager.cancelAutoBackup();
            }
        }

        // Track settings change
        AnalyticsService.trackEvent('settings_updated', newSettings);
    }, []);

    // Data management methods (from original context)
    const dataManager = useMemo(() => new DataManager(), []);

    const getAssetsByClient = useCallback(async (clientId, module) => {
        try {
            return await dataManager.getAssetsByClient(clientId, module);
        } catch (error) {
            console.error('Error fetching assets:', error);
            return [];
        }
    }, [dataManager]);

    const getAnalysesByClient = useCallback(async (clientId, module) => {
        try {
            return await dataManager.getAnalysesByClient(clientId, module);
        } catch (error) {
            console.error('Error fetching analyses:', error);
            return [];
        }
    }, [dataManager]);

    const getTasksByClient = useCallback(async (clientId, module) => {
        try {
            return await dataManager.getTasksByClient(clientId, module);
        } catch (error) {
            console.error('Error fetching tasks:', error);
            return [];
        }
    }, [dataManager]);

    // Setup auth state listener
    useEffect(() => {
        const unsubscribe = AuthService.addAuthStateListener((user) => {
            dispatch({ type: ACTIONS.SET_USER, payload: user });
        });

        return unsubscribe;
    }, []);

    // Load initial data when user is authenticated
    useEffect(() => {
        if (state.user) {
            // Load user-specific data
            // This could include loading clients, settings, etc.
        }
    }, [state.user]);

    // Context value
    const contextValue = useMemo(() => ({
        // State
        ...state,

        // Authentication
        signIn,
        signUp,
        signOut,

        // Data management
        dataManager,
        getAssetsByClient,
        getAnalysesByClient,
        getTasksByClient,

        // Notifications
        sendNotification,

        // Backup
        createBackup,

        // Analytics
        trackScreenView,
        trackUserAction,

        // Settings
        updateAppSettings,

        // Dispatch for direct state updates
        dispatch
    }), [
        state,
        signIn,
        signUp,
        signOut,
        dataManager,
        getAssetsByClient,
        getAnalysesByClient,
        getTasksByClient,
        sendNotification,
        createBackup,
        trackScreenView,
        trackUserAction,
        updateAppSettings
    ]);

    return (
        <AppContext.Provider value={contextValue}>
            {children}
        </AppContext.Provider>
    );
}

// Custom hook to use the app context
export function useApp() {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('useApp must be used within an AppProvider');
    }
    return context;
}

export default AppContext;
