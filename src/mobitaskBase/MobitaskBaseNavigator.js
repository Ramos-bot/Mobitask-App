import React, { useState } from 'react';
import { View } from 'react-native';

// Importar todas as telas da Base
import DashboardBase from './DashboardBase';
import ProfileScreen from './ProfileScreen';
import SettingsScreen from './SettingsScreen';
import ClientsScreen from './ClientsScreen';
import AnalyticsScreen from './AnalyticsScreen';
import NotificationsScreen from './NotificationsScreen';
import TeamsScreen from './TeamsScreen';
import CalendarScreen from './CalendarScreen';
import SubscriptionScreen from './SubscriptionScreen';
import ModuleSelector from './ModuleSelector';
import MarketplaceScreen from './MarketplaceScreen';
import TesteLicenciamento from './TesteLicenciamento';
import NotificationSettingsScreen from './NotificationSettingsScreen';
import BackupScreen from './BackupScreen';

export default function MobitaskBaseNavigator({ user, onModuleSelect, onLogout }) {
    const [currentScreen, setCurrentScreen] = useState('dashboard');
    const [screenParams, setScreenParams] = useState({});

    const navigate = (screen, params = {}) => {
        setCurrentScreen(screen);
        setScreenParams(params);
    };

    const handleSaveProfile = (profileData) => {
        // Aqui integraria com o Firebase para salvar
        console.log('Saving profile:', profileData);
        // Por agora apenas volta ao dashboard
        setCurrentScreen('dashboard');
    };

    // Props comuns para todas as telas
    const commonProps = {
        user,
        onBack: () => setCurrentScreen('dashboard'),
        onNavigate: navigate,
        onLogout
    };

    // Renderização condicional baseada na tela atual
    switch (currentScreen) {
        case 'dashboard':
            return (
                <DashboardBase
                    {...commonProps}
                    onModuleSelect={onModuleSelect}
                />
            );

        case 'profile':
            return (
                <ProfileScreen
                    {...commonProps}
                    onSave={handleSaveProfile}
                />
            );

        case 'settings':
            return (
                <SettingsScreen
                    {...commonProps}
                />
            );

        case 'clients':
            return (
                <ClientsScreen
                    {...commonProps}
                />
            );

        case 'analytics':
            return (
                <AnalyticsScreen
                    {...commonProps}
                />
            );

        case 'notifications':
            return (
                <NotificationsScreen
                    {...commonProps}
                />
            );

        case 'teams':
            return (
                <TeamsScreen
                    {...commonProps}
                />
            );

        case 'calendar':
            return (
                <CalendarScreen
                    {...commonProps}
                />
            );

        case 'subscription':
            return (
                <SubscriptionScreen
                    {...commonProps}
                />
            );

        case 'marketplace':
            return (
                <MarketplaceScreen
                    {...commonProps}
                />
            );

        case 'test-licensing':
            return (
                <TesteLicenciamento
                    {...commonProps}
                />
            );

        case 'modules':
            return (
                <ModuleSelector
                    {...commonProps}
                    onModuleSelect={onModuleSelect}
                />
            );

        case 'notification-settings':
            return (
                <NotificationSettingsScreen
                    {...commonProps}
                />
            );

        case 'backup':
            return (
                <BackupScreen
                    {...commonProps}
                />
            );

        default:
            return (
                <DashboardBase
                    {...commonProps}
                    onModuleSelect={onModuleSelect}
                />
            );
    }
}
