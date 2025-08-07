import React, { useState, useEffect } from 'react';
import { View, StatusBar } from 'react-native';
import { useApp } from './shared/context/AppContext';
import ServiceInitializer from './shared/services/ServiceInitializer';

// Componentes de autenticação
import SplashScreen from './shared/components/SplashScreen';
import LoginScreen from './shared/components/LoginScreen';

// Mobitask Base
import MobitaskBaseNavigator from './mobitaskBase/MobitaskBaseNavigator';

// Módulos especializados
import MobitaskAqua from '../mobitaskAqua/MobitaskAqua';
import MobitaskVerde from './mobitaskVerde';
import MobitaskPhyto from './mobitaskPhyto';

export default function MobitaskMain() {
    const { user, setUser, setCompany } = useApp();
    const [currentScreen, setCurrentScreen] = useState('splash');
    const [selectedModule, setSelectedModule] = useState(null);

    useEffect(() => {
        // Initialize core services
        const initServices = async () => {
            await ServiceInitializer.initializeServices();
        };

        initServices();

        // Simular carregamento inicial
        const timer = setTimeout(() => {
            if (user) {
                setCurrentScreen('base');
            } else {
                setCurrentScreen('login');
            }
        }, 2000);

        return () => clearTimeout(timer);
    }, [user]);

    const handleLogin = (userData) => {
        setUser(userData);

        // Simular dados da empresa (em produção, buscar do Firebase)
        setCompany({
            id: 'company_123',
            name: 'AquaVerde Services',
            subscription: {
                plan: 'premium',
                modules: ['aqua', 'verde', 'phyto']
            }
        });

        setCurrentScreen('base');
    };

    const handleModuleSelect = (module) => {
        setSelectedModule(module);
        setCurrentScreen('module');
    };

    const handleBackToBase = () => {
        setSelectedModule(null);
        setCurrentScreen('base');
    };

    const handleLogout = () => {
        setUser(null);
        setCompany(null);
        setSelectedModule(null);
        setCurrentScreen('login');
    };

    // Renderização condicional baseada no estado
    if (currentScreen === 'splash') {
        return <SplashScreen />;
    }

    if (currentScreen === 'login') {
        return <LoginScreen onLogin={handleLogin} />;
    }

    if (currentScreen === 'base') {
        return (
            <MobitaskBaseNavigator
                user={user}
                onModuleSelect={handleModuleSelect}
                onLogout={handleLogout}
            />
        );
    }

    if (currentScreen === 'module' && selectedModule) {
        const moduleProps = {
            user,
            onBack: handleBackToBase
        };

        switch (selectedModule) {
            case 'aqua':
                return <MobitaskAqua {...moduleProps} />;
            case 'verde':
                return <MobitaskVerde {...moduleProps} />;
            case 'phyto':
                return <MobitaskPhyto {...moduleProps} />;
            default:
                return <MobitaskBaseNavigator
                    user={user}
                    onModuleSelect={handleModuleSelect}
                    onLogout={handleLogout}
                />;
        }
    }

    // Fallback
    return (
        <View style={{ flex: 1, backgroundColor: '#f8f9fa' }}>
            <StatusBar barStyle="dark-content" />
        </View>
    );
}
