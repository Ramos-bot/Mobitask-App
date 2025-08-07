// Context para gestão de estado global cross-module
import React, { createContext, useContext, useReducer, useEffect, useMemo, useCallback } from 'react';
import DataManager from '../services/DataManager';
import AuthService from '../services/AuthService';
import AnalyticsService from '../services/AnalyticsService';
import NotificationManager from '../services/NotificationManager';
import BackupManager from '../services/BackupManager';
import { useLicenseManager } from '../../core/licensing/LicenseManager';
// import { MODULE_CONFIG } from '../../config/modules.config';

// Configuração básica temporária
const MODULE_CONFIG = {
    modules: {
        aqua: { name: 'Mobitask Aqua', price: 39 },
        verde: { name: 'Mobitask Verde', price: 29 },
        phyto: { name: 'Mobitask Phyto', price: 49 }
    }
};

// Ações do reducer
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
    // Ações para licenciamento
    SET_SUBSCRIPTION: 'SET_SUBSCRIPTION',
    UPDATE_MODULE_ACCESS: 'UPDATE_MODULE_ACCESS',
    SET_TRIAL_STATUS: 'SET_TRIAL_STATUS'
};

// Estado inicial
const initialState = {
    user: null,
    company: null,
    clients: [],
    dashboardStats: {
        totalClients: 0,
        pendingTasks: 0,
        recentAnalyses: 0,
        activeModules: 0
    },
    recentActivity: [],
    // Dados de subscrição e licenciamento
    userSubscription: {
        plan: 'professional',
        status: 'active',
        modules: ['aqua', 'verde'],
        nextBilling: '2024-09-01',
        trialEndsAt: null,
        permissions: ['base_access', 'aqua_access', 'verde_access']
    },
    moduleAccess: {
        aqua: true,
        verde: true,
        phyto: false
    },
    loading: false,
    error: null
};

// Reducer
function appReducer(state, action) {
    switch (action.type) {
        case ACTIONS.SET_USER:
            return { ...state, user: action.payload };

        case ACTIONS.SET_COMPANY:
            return { ...state, company: action.payload };

        case ACTIONS.SET_CLIENTS:
            return { ...state, clients: action.payload };

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
            return { ...state, dashboardStats: action.payload };

        case ACTIONS.SET_RECENT_ACTIVITY:
            return { ...state, recentActivity: action.payload };

        case ACTIONS.SET_LOADING:
            return { ...state, loading: action.payload };

        case ACTIONS.SET_ERROR:
            return { ...state, error: action.payload };

        case ACTIONS.CLEAR_ERROR:
            return { ...state, error: null };

        // Ações para licenciamento
        case ACTIONS.SET_SUBSCRIPTION:
            return { ...state, userSubscription: { ...state.userSubscription, ...action.payload } };

        case ACTIONS.UPDATE_MODULE_ACCESS:
            return {
                ...state,
                moduleAccess: { ...state.moduleAccess, ...action.payload }
            };

        case ACTIONS.SET_TRIAL_STATUS:
            return {
                ...state,
                userSubscription: {
                    ...state.userSubscription,
                    status: 'trial',
                    trialEndsAt: action.payload.trialEndsAt
                }
            };

        default:
            return state;
    }
}

// Context
const AppContext = createContext();

// Provider
export function AppProvider({ children }) {
    const [state, dispatch] = useReducer(appReducer, initialState);

    // Inicializar DataManager quando company estiver disponível - memoizado
    const dataManager = useMemo(() => {
        return state.company ? new DataManager(state.company.id) : null;
    }, [state.company?.id]);

    const licenseManager = useLicenseManager();

    // ===============================
    // AÇÕES DE UTILIZADOR
    // ===============================

    const setUser = (user) => {
        dispatch({ type: ACTIONS.SET_USER, payload: user });
    };

    const setCompany = (company) => {
        dispatch({ type: ACTIONS.SET_COMPANY, payload: company });
    };

    // ===============================
    // AÇÕES DE CLIENTES
    // ===============================

    const loadClients = useCallback(async () => {
        if (!dataManager) return;

        try {
            dispatch({ type: ACTIONS.SET_LOADING, payload: true });

            // Carregar clientes de todos os módulos
            const [aquaClients, verdeClients, phytoClients] = await Promise.all([
                dataManager.getClientsByModule('aqua'),
                dataManager.getClientsByModule('verde'),
                dataManager.getClientsByModule('phyto')
            ]);

            // Combinar e remover duplicatas
            const allClientsMap = new Map();

            [...aquaClients, ...verdeClients, ...phytoClients].forEach(client => {
                allClientsMap.set(client.id, client);
            });

            const uniqueClients = Array.from(allClientsMap.values());
            dispatch({ type: ACTIONS.SET_CLIENTS, payload: uniqueClients });

        } catch (error) {
            dispatch({ type: ACTIONS.SET_ERROR, payload: error.message });
        } finally {
            dispatch({ type: ACTIONS.SET_LOADING, payload: false });
        }
    }, [dataManager]);

    const createClient = useCallback(async (clientData) => {
        if (!dataManager) return null;

        try {
            dispatch({ type: ACTIONS.SET_LOADING, payload: true });
            const newClient = await dataManager.createClient(clientData);
            dispatch({ type: ACTIONS.ADD_CLIENT, payload: newClient });
            return newClient;
        } catch (error) {
            dispatch({ type: ACTIONS.SET_ERROR, payload: error.message });
            return null;
        } finally {
            dispatch({ type: ACTIONS.SET_LOADING, payload: false });
        }
    }, [dataManager]);

    const updateClient = useCallback(async (clientId, updates) => {
        if (!dataManager) return null;

        try {
            dispatch({ type: ACTIONS.SET_LOADING, payload: true });
            await dataManager.updateClient(clientId, updates);

            const updatedClient = await dataManager.getClientById(clientId);
            dispatch({ type: ACTIONS.UPDATE_CLIENT, payload: updatedClient });
            return updatedClient;
        } catch (error) {
            dispatch({ type: ACTIONS.SET_ERROR, payload: error.message });
            return null;
        } finally {
            dispatch({ type: ACTIONS.SET_LOADING, payload: false });
        }
    }, [dataManager]);

    // ===============================
    // DASHBOARD E ESTATÍSTICAS
    // ===============================

    const loadDashboardStats = useCallback(async () => {
        if (!dataManager) return;

        try {
            const stats = await dataManager.getDashboardStats();
            dispatch({ type: ACTIONS.SET_DASHBOARD_STATS, payload: stats });
        } catch (error) {
            dispatch({ type: ACTIONS.SET_ERROR, payload: error.message });
        }
    }, [dataManager]);

    const loadRecentActivity = useCallback(async () => {
        if (!dataManager) return;

        try {
            const activity = await dataManager.getRecentActivity(10);
            dispatch({ type: ACTIONS.SET_RECENT_ACTIVITY, payload: activity });
        } catch (error) {
            dispatch({ type: ACTIONS.SET_ERROR, payload: error.message });
        }
    }, [dataManager]);

    // ===============================
    // GESTÃO DE ASSETS (Pools, Gardens, Crops)
    // ===============================

    const createAsset = useCallback(async (module, assetData) => {
        if (!dataManager) return null;

        try {
            dispatch({ type: ACTIONS.SET_LOADING, payload: true });
            const newAsset = await dataManager.createAsset(module, assetData);

            // Recarregar clientes para atualizar referências
            await loadClients();

            return newAsset;
        } catch (error) {
            dispatch({ type: ACTIONS.SET_ERROR, payload: error.message });
            return null;
        } finally {
            dispatch({ type: ACTIONS.SET_LOADING, payload: false });
        }
    }, [dataManager, loadClients]);

    const getAssetsByClient = useCallback(async (clientId, module) => {
        if (!dataManager) return [];

        try {
            return await dataManager.getAssetsByClient(clientId, module);
        } catch (error) {
            dispatch({ type: ACTIONS.SET_ERROR, payload: error.message });
            return [];
        }
    }, [dataManager]);

    // ===============================
    // ANÁLISES CROSS-MODULE
    // ===============================

    const createAnalysis = useCallback(async (analysisData) => {
        if (!dataManager) return null;

        try {
            dispatch({ type: ACTIONS.SET_LOADING, payload: true });
            const newAnalysis = await dataManager.createAnalysis(analysisData);

            // Atualizar estatísticas do dashboard
            await loadDashboardStats();
            await loadRecentActivity();

            return newAnalysis;
        } catch (error) {
            dispatch({ type: ACTIONS.SET_ERROR, payload: error.message });
            return null;
        } finally {
            dispatch({ type: ACTIONS.SET_LOADING, payload: false });
        }
    }, [dataManager, loadDashboardStats, loadRecentActivity]);

    const getAnalysesByClient = useCallback(async (clientId, module = null) => {
        if (!dataManager) return [];

        try {
            return await dataManager.getAnalysesByClient(clientId, module);
        } catch (error) {
            dispatch({ type: ACTIONS.SET_ERROR, payload: error.message });
            return [];
        }
    }, [dataManager]);

    // ===============================
    // TAREFAS CROSS-MODULE
    // ===============================

    const createTask = useCallback(async (taskData) => {
        if (!dataManager) return null;

        try {
            dispatch({ type: ACTIONS.SET_LOADING, payload: true });
            const newTask = await dataManager.createTask(taskData);

            // Atualizar estatísticas do dashboard
            await loadDashboardStats();

            return newTask;
        } catch (error) {
            dispatch({ type: ACTIONS.SET_ERROR, payload: error.message });
            return null;
        } finally {
            dispatch({ type: ACTIONS.SET_LOADING, payload: false });
        }
    }, [dataManager, loadDashboardStats]);

    const getTasksByClient = useCallback(async (clientId, module = null) => {
        if (!dataManager) return [];

        try {
            return await dataManager.getTasksByClient(clientId, module);
        } catch (error) {
            dispatch({ type: ACTIONS.SET_ERROR, payload: error.message });
            return [];
        }
    }, [dataManager]);

    // ===============================
    // UTILITÁRIOS
    // ===============================

    const clearError = useCallback(() => {
        dispatch({ type: ACTIONS.CLEAR_ERROR });
    }, []);

    // Funções para licenciamento
    const checkModuleAccess = useCallback(async (moduleId) => {
        try {
            const hasAccess = await licenseManager.isModuleLicensed(moduleId);
            if (!hasAccess) {
                console.log(`Acesso negado ao módulo: ${moduleId}`);
                return false;
            }
            return true;
        } catch (error) {
            console.error('Erro ao verificar licença:', error);
            return false;
        }
    }, [licenseManager]);

    const startTrial = useCallback(async (moduleId) => {
        try {
            dispatch({ type: ACTIONS.SET_LOADING, payload: true });
            await licenseManager.startTrial(moduleId);

            const trialEndsAt = new Date();
            trialEndsAt.setDate(trialEndsAt.getDate() + 7); // 7 dias de trial

            dispatch({
                type: ACTIONS.SET_TRIAL_STATUS,
                payload: { trialEndsAt: trialEndsAt.toISOString() }
            });

            // Atualizar acesso aos módulos
            const moduleAccess = {};
            moduleAccess[moduleId] = true;
            dispatch({
                type: ACTIONS.UPDATE_MODULE_ACCESS,
                payload: moduleAccess
            });

            setSuccess('Trial iniciado com sucesso! Aproveite 7 dias grátis.');
        } catch (error) {
            setError('Erro ao iniciar trial: ' + error.message);
        } finally {
            dispatch({ type: ACTIONS.SET_LOADING, payload: false });
        }
    }, [licenseManager]);

    const upgradeSubscription = useCallback(async (planId, moduleIds = []) => {
        try {
            dispatch({ type: ACTIONS.SET_LOADING, payload: true });

            // Simular upgrade (implementar com pagamento real)
            await licenseManager.simulateUpgrade(planId, moduleIds);

            dispatch({
                type: ACTIONS.SET_SUBSCRIPTION,
                payload: {
                    planId,
                    status: 'active',
                    startDate: new Date().toISOString(),
                    modules: moduleIds
                }
            });

            // Atualizar acesso aos módulos
            const moduleAccess = {};
            moduleIds.forEach(moduleId => {
                moduleAccess[moduleId] = true;
            });
            dispatch({
                type: ACTIONS.UPDATE_MODULE_ACCESS,
                payload: moduleAccess
            });

            setSuccess('Subscrição atualizada com sucesso!');
        } catch (error) {
            setError('Erro ao atualizar subscrição: ' + error.message);
        } finally {
            dispatch({ type: ACTIONS.SET_LOADING, payload: false });
        }
    }, [licenseManager]);

    const refreshLicenseStatus = useCallback(async () => {
        try {
            const subscription = await licenseManager.getSubscriptionInfo();
            dispatch({
                type: ACTIONS.SET_SUBSCRIPTION,
                payload: subscription
            });

            // Verificar acesso a todos os módulos
            const moduleAccess = {};
            const moduleIds = Object.keys(MODULE_CONFIG.modules);

            for (const moduleId of moduleIds) {
                moduleAccess[moduleId] = await licenseManager.isModuleLicensed(moduleId);
            }

            dispatch({
                type: ACTIONS.UPDATE_MODULE_ACCESS,
                payload: moduleAccess
            });
        } catch (error) {
            console.error('Erro ao atualizar status da licença:', error);
        }
    }, [licenseManager]);

    // Carregar status da licença ao inicializar - TEMPORARIAMENTE DESABILITADO
    // useEffect(() => {
    //     if (state.user) {
    //         refreshLicenseStatus();
    //     }
    // }, [state.user, refreshLicenseStatus]);

    // Atualizar dados quando o dataManager está disponível - TEMPORARIAMENTE DESABILITADO
    // useEffect(() => {
    //     if (dataManager && state.company) {
    //         loadDashboardStats();
    //         loadRecentActivity();
    //         loadClients();
    //     }
    // }, [dataManager, state.company, loadDashboardStats, loadRecentActivity, loadClients]);

    // Valor do contexto
    const value = {
        // Estado
        ...state,

        // Ações de utilizador
        setUser,
        setCompany,

        // Ações de clientes
        loadClients,
        createClient,
        updateClient,

        // Dashboard
        loadDashboardStats,
        loadRecentActivity,

        // Assets
        createAsset,
        getAssetsByClient,

        // Análises
        createAnalysis,
        getAnalysesByClient,

        // Tarefas
        createTask,
        getTasksByClient,

        // Utilitários
        clearError,
        dataManager,

        // Funções de licenciamento
        checkModuleAccess,
        startTrial,
        upgradeSubscription,
        refreshLicenseStatus,

        // Dados de subscrição e licenciamento
        userSubscription: state.userSubscription,
        moduleAccess: state.moduleAccess,
    };

    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    );
}

// Hook personalizado
export function useApp() {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('useApp deve ser usado dentro de AppProvider');
    }
    return context;
}

export { ACTIONS, AppContext };
