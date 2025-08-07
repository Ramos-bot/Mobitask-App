import React, { useState } from 'react';
import { View } from 'react-native';

// Componentes partilhados
import SplashScreen from './src/shared/SplashScreen';
import LoginScreen from './src/shared/auth/LoginScreen';

// App principal
import MobitaskBase from './src/mobitaskBase/MobitaskBase';

// Módulos especializados
import MobitaskAqua from './src/mobitaskAqua/MobitaskAqua';
import MobitaskVerde from './src/mobitaskVerde/MobitaskVerde';
import MobitaskPhyto from './src/mobitaskPhyto/MobitaskPhyto';

export default function App() {
    const [currentScreen, setCurrentScreen] = useState('splash');
    const [user, setUser] = useState(null);
    const [selectedModule, setSelectedModule] = useState(null);

    // Fluxo de navegação
    if (currentScreen === 'splash') {
        return <SplashScreen onFinish={() => setCurrentScreen('login')} />;
    }

    if (currentScreen === 'login' && !user) {
        return <LoginScreen onLogin={(userData) => {
            setUser(userData);
            setCurrentScreen('base');
        }} />;
    }

    if (currentScreen === 'base' && !selectedModule) {
        return <MobitaskBase
            user={user}
            onModuleSelect={(module) => {
                setSelectedModule(module);
                setCurrentScreen('module');
            }}
            onLogout={() => {
                setUser(null);
                setSelectedModule(null);
                setCurrentScreen('login');
            }}
        />;
    }

    // Renderizar módulo selecionado
    if (currentScreen === 'module') {
        const onBackToBase = () => {
            setSelectedModule(null);
            setCurrentScreen('base');
        };

        switch (selectedModule) {
            case 'aqua':
                return <MobitaskAqua user={user} onBack={onBackToBase} />;
            case 'verde':
                return <MobitaskVerde user={user} onBack={onBackToBase} />;
            case 'phyto':
                return <MobitaskPhyto user={user} onBack={onBackToBase} />;
            default:
                return <MobitaskBase user={user} onModuleSelect={setSelectedModule} />;
        }
    }

    return <View />; // Fallback
}
