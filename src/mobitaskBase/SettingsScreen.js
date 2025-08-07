import React, { useState } from 'react';
import {
    View, Text, TouchableOpacity, StyleSheet, ScrollView,
    Switch, Alert, StatusBar
} from 'react-native';

export default function SettingsScreen({ user, onBack, onLogout }) {
    const [settings, setSettings] = useState({
        notifications: true,
        darkMode: false,
        autoBackup: true,
        biometric: false,
        language: 'pt',
    });

    const updateSetting = (key, value) => {
        setSettings(prev => ({ ...prev, [key]: value }));
    };

    const settingsGroups = [
        {
            title: 'Conta',
            items: [
                {
                    id: 'profile',
                    icon: '👤',
                    label: 'Editar Perfil',
                    action: () => { },
                    showArrow: true
                },
                {
                    id: 'company',
                    icon: '🏢',
                    label: 'Dados da Empresa',
                    action: () => { },
                    showArrow: true
                },
                {
                    id: 'subscription',
                    icon: '💳',
                    label: 'Subscrição',
                    action: () => { },
                    showArrow: true
                },
            ]
        },
        {
            title: 'Aplicação',
            items: [
                {
                    id: 'notifications',
                    icon: '🔔',
                    label: 'Notificações',
                    toggle: true,
                    value: settings.notifications,
                    action: (value) => updateSetting('notifications', value)
                },
                {
                    id: 'notification-settings',
                    icon: '⚙️',
                    label: 'Configurações de Notificações',
                    action: () => onNavigate('notification-settings'),
                    showArrow: true
                },
                {
                    id: 'darkMode',
                    icon: '🌙',
                    label: 'Modo Escuro',
                    toggle: true,
                    value: settings.darkMode,
                    action: (value) => updateSetting('darkMode', value)
                },
                {
                    id: 'language',
                    icon: '🌍',
                    label: 'Idioma',
                    subtitle: 'Português',
                    action: () => { },
                    showArrow: true
                },
                {
                    id: 'autoBackup',
                    icon: '☁️',
                    label: 'Backup Automático',
                    toggle: true,
                    value: settings.autoBackup,
                    action: (value) => updateSetting('autoBackup', value)
                },
                {
                    id: 'backup-settings',
                    icon: '🔄',
                    label: 'Backup e Sincronização',
                    action: () => onNavigate('backup'),
                    showArrow: true
                },
            ]
        },
        {
            title: 'Segurança',
            items: [
                {
                    id: 'biometric',
                    icon: '🔒',
                    label: 'Autenticação Biométrica',
                    toggle: true,
                    value: settings.biometric,
                    action: (value) => updateSetting('biometric', value)
                },
                {
                    id: 'password',
                    icon: '🔑',
                    label: 'Alterar Password',
                    action: () => { },
                    showArrow: true
                },
                {
                    id: 'sessions',
                    icon: '📱',
                    label: 'Sessões Ativas',
                    action: () => { },
                    showArrow: true
                },
            ]
        },
        {
            title: 'Suporte',
            items: [
                {
                    id: 'help',
                    icon: '❓',
                    label: 'Centro de Ajuda',
                    action: () => { },
                    showArrow: true
                },
                {
                    id: 'contact',
                    icon: '📞',
                    label: 'Contactar Suporte',
                    action: () => { },
                    showArrow: true
                },
                {
                    id: 'feedback',
                    icon: '💬',
                    label: 'Enviar Feedback',
                    action: () => { },
                    showArrow: true
                },
                {
                    id: 'about',
                    icon: 'ℹ️',
                    label: 'Sobre a Aplicação',
                    action: () => { },
                    showArrow: true
                },
            ]
        }
    ];

    const handleLogout = () => {
        Alert.alert(
            'Terminar Sessão',
            'Tens a certeza que queres terminar a sessão?',
            [
                { text: 'Cancelar', style: 'cancel' },
                { text: 'Terminar', style: 'destructive', onPress: onLogout }
            ]
        );
    };

    const renderSettingItem = (item) => {
        return (
            <TouchableOpacity
                key={item.id}
                style={styles.settingItem}
                onPress={() => item.toggle ? null : item.action()}
                disabled={item.toggle}
            >
                <View style={styles.settingLeft}>
                    <Text style={styles.settingIcon}>{item.icon}</Text>
                    <View>
                        <Text style={styles.settingLabel}>{item.label}</Text>
                        {item.subtitle && (
                            <Text style={styles.settingSubtitle}>{item.subtitle}</Text>
                        )}
                    </View>
                </View>
                <View style={styles.settingRight}>
                    {item.toggle ? (
                        <Switch
                            value={item.value}
                            onValueChange={item.action}
                            trackColor={{ false: '#e0e0e0', true: '#1e88e5' }}
                            thumbColor={item.value ? '#fff' : '#f4f3f4'}
                        />
                    ) : item.showArrow ? (
                        <Text style={styles.arrow}>›</Text>
                    ) : null}
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#fff" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={onBack}>
                    <Text style={styles.backIcon}>‹</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Configurações</Text>
                <View style={styles.placeholder} />
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* User Info */}
                <View style={styles.userSection}>
                    <View style={styles.userAvatar}>
                        <Text style={styles.userAvatarText}>
                            {(user?.displayName || user?.email || 'U')[0].toUpperCase()}
                        </Text>
                    </View>
                    <View style={styles.userInfo}>
                        <Text style={styles.userName}>
                            {user?.displayName || 'Nome do Utilizador'}
                        </Text>
                        <Text style={styles.userEmail}>{user?.email}</Text>
                        <Text style={styles.userRole}>Administrador</Text>
                    </View>
                </View>

                {/* Settings Groups */}
                {settingsGroups.map((group, groupIndex) => (
                    <View key={groupIndex} style={styles.settingsGroup}>
                        <Text style={styles.groupTitle}>{group.title}</Text>
                        <View style={styles.groupItems}>
                            {group.items.map(renderSettingItem)}
                        </View>
                    </View>
                ))}

                {/* Logout Button */}
                <View style={styles.logoutSection}>
                    <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                        <Text style={styles.logoutIcon}>🚪</Text>
                        <Text style={styles.logoutText}>Terminar Sessão</Text>
                    </TouchableOpacity>
                </View>

                {/* App Version */}
                <View style={styles.versionSection}>
                    <Text style={styles.versionText}>Mobitask v1.0.0</Text>
                    <Text style={styles.buildText}>Build 2025.1.0</Text>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 50,
        paddingBottom: 20,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    backButton: {
        padding: 8,
    },
    backIcon: {
        fontSize: 24,
        color: '#333',
        fontWeight: 'bold',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    placeholder: {
        width: 40,
    },
    content: {
        flex: 1,
    },
    userSection: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        padding: 20,
        marginBottom: 20,
        alignItems: 'center',
    },
    userAvatar: {
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: '#1e88e5',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    userAvatarText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
    },
    userInfo: {
        flex: 1,
    },
    userName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 5,
    },
    userEmail: {
        fontSize: 14,
        color: '#666',
        marginBottom: 5,
    },
    userRole: {
        fontSize: 12,
        color: '#1e88e5',
        fontWeight: '500',
    },
    settingsGroup: {
        marginBottom: 25,
    },
    groupTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#666',
        marginLeft: 20,
        marginBottom: 10,
        textTransform: 'uppercase',
    },
    groupItems: {
        backgroundColor: '#fff',
    },
    settingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#f5f5f5',
    },
    settingLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    settingIcon: {
        fontSize: 20,
        marginRight: 15,
        width: 25,
        textAlign: 'center',
    },
    settingLabel: {
        fontSize: 16,
        color: '#333',
        fontWeight: '500',
    },
    settingSubtitle: {
        fontSize: 12,
        color: '#666',
        marginTop: 2,
    },
    settingRight: {
        alignItems: 'center',
    },
    arrow: {
        fontSize: 20,
        color: '#ccc',
        fontWeight: 'bold',
    },
    logoutSection: {
        paddingHorizontal: 20,
        marginTop: 20,
        marginBottom: 30,
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f44336',
        paddingVertical: 15,
        borderRadius: 12,
    },
    logoutIcon: {
        fontSize: 18,
        marginRight: 10,
    },
    logoutText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    versionSection: {
        alignItems: 'center',
        paddingBottom: 30,
    },
    versionText: {
        fontSize: 14,
        color: '#666',
        marginBottom: 5,
    },
    buildText: {
        fontSize: 12,
        color: '#999',
    },
});
