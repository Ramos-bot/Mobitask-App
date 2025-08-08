import React, { useState, useEffect } from 'react';
import {
    View, Text, ScrollView, TouchableOpacity, StyleSheet,
    Dimensions, StatusBar, Image
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useApp } from '../shared/context/AppContext';

const { width } = Dimensions.get('window');

export default function DashboardBase({ user, onModuleSelect, onNavigate }) {
    const {
        dashboardStats,
        recentActivity: contextActivity,
        loadDashboardStats,
        loadRecentActivity
    } = useApp();

    const [localStats, setLocalStats] = useState({
        totalClients: 0,
        activeModules: 1,
        pendingTasks: 0,
        monthlyRevenue: 0
    });

    useEffect(() => {
        // Carregar dados do dashboard
        loadDashboardStats();
        loadRecentActivity();
    }, []);

    useEffect(() => {
        // Atualizar stats locais quando os dados do contexto mudarem
        if (dashboardStats) {
            setLocalStats(prev => ({
                ...prev,
                ...dashboardStats
            }));
        }
    }, [dashboardStats]);

    const quickActions = [
        { id: 'aqua', icon: '💧', name: 'Mobitask Aqua', color: '#1e88e5', action: () => onModuleSelect('aqua') },
        { id: 'verde', icon: '🌱', name: 'Mobitask Verde', color: '#4caf50', action: () => onModuleSelect('verde') },
        { id: 'phyto', icon: '🧪', name: 'Mobitask Phyto', color: '#ff9800', action: () => onModuleSelect('phyto') },
        { id: 'base-modules', icon: '⚙️', name: 'Módulos Base', color: '#f44336', action: () => onNavigate('dashboard-base-modules') },
        { id: 'calendar', icon: '📅', name: 'Calendário', color: '#9c27b0', action: () => onNavigate('calendar') },
        { id: 'clients', icon: '👥', name: 'Clientes', color: '#673ab7', action: () => onNavigate('clients') },
        { id: 'analytics', icon: '📊', name: 'Relatórios', color: '#00bcd4', action: () => onNavigate('analytics') },
        { id: 'marketplace', icon: '🛒', name: 'Loja Módulos', color: '#e91e63', action: () => onNavigate('marketplace') },
        { id: 'test', icon: '🧪', name: 'Teste Sistema', color: '#795548', action: () => onNavigate('test-licensing') },
    ];

    // Usar atividade do contexto ou fallback
    const displayActivity = contextActivity.length > 0 ? contextActivity : [
        { type: 'analysis', module: 'Aqua', description: 'Nova análise - Piscina Cliente A', time: '2h ago' },
        { type: 'alert', module: 'Verde', description: 'Alerta de rega - Jardim B', time: '4h ago' },
        { type: 'task', module: 'Phyto', description: 'Aplicação agendada', time: '1d ago' },
    ];

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            <StatusBar barStyle="light-content" backgroundColor="#1565C0" />

            {/* Header com gradiente */}
            <LinearGradient
                colors={['#1565C0', '#1e88e5', '#42a5f5']}
                style={styles.header}
            >
                <View style={styles.headerContent}>
                    <View>
                        <Text style={styles.greeting}>Bom dia! 👋</Text>
                        <Text style={styles.userName}>{user?.displayName || user?.email || 'Utilizador'}</Text>
                    </View>
                    <TouchableOpacity
                        style={styles.profileButton}
                        onPress={() => onNavigate('profile')}
                    >
                        <View style={styles.avatar}>
                            <Text style={styles.avatarText}>
                                {(user?.displayName || user?.email || 'U')[0].toUpperCase()}
                            </Text>
                        </View>
                    </TouchableOpacity>
                </View>
            </LinearGradient>

            {/* Cartões de estatísticas */}
            <View style={styles.statsContainer}>
                <View style={styles.statsRow}>
                    <View style={[styles.statCard, { backgroundColor: '#e3f2fd' }]}>
                        <Text style={styles.statNumber}>{localStats.totalClients}</Text>
                        <Text style={styles.statLabel}>Clientes</Text>
                        <Text style={styles.statIcon}>👥</Text>
                    </View>
                    <View style={[styles.statCard, { backgroundColor: '#e8f5e8' }]}>
                        <Text style={styles.statNumber}>{localStats.activeModules}</Text>
                        <Text style={styles.statLabel}>Módulos Ativos</Text>
                        <Text style={styles.statIcon}>📱</Text>
                    </View>
                </View>
                <View style={styles.statsRow}>
                    <View style={[styles.statCard, { backgroundColor: '#fff3e0' }]}>
                        <Text style={styles.statNumber}>{localStats.pendingTasks}</Text>
                        <Text style={styles.statLabel}>Tarefas Pendentes</Text>
                        <Text style={styles.statIcon}>📋</Text>
                    </View>
                    <View style={[styles.statCard, { backgroundColor: '#f3e5f5' }]}>
                        <Text style={styles.statNumber}>€{localStats.monthlyRevenue}</Text>
                        <Text style={styles.statLabel}>Receita Mensal</Text>
                        <Text style={styles.statIcon}>💰</Text>
                    </View>
                </View>
            </View>

            {/* Acesso rápido aos módulos */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Acesso Rápido</Text>
                <View style={styles.quickActionsGrid}>
                    {quickActions.map((action) => (
                        <TouchableOpacity
                            key={action.id}
                            style={[styles.quickActionCard, { borderLeftColor: action.color }]}
                            onPress={action.action}
                        >
                            <Text style={styles.quickActionIcon}>{action.icon}</Text>
                            <Text style={styles.quickActionName}>{action.name}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            {/* Atividade recente */}
            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Atividade Recente</Text>
                    <TouchableOpacity onPress={() => onNavigate('activity')}>
                        <Text style={styles.seeAllText}>Ver Tudo</Text>
                    </TouchableOpacity>
                </View>
                {displayActivity.map((activity, index) => (
                    <View key={index} style={styles.activityItem}>
                        <View style={styles.activityIcon}>
                            <Text>{activity.type === 'analysis' ? '🧪' : activity.type === 'alert' ? '🔔' : '📋'}</Text>
                        </View>
                        <View style={styles.activityContent}>
                            <Text style={styles.activityDescription}>{activity.description}</Text>
                            <Text style={styles.activityTime}>{activity.module} • {activity.time}</Text>
                        </View>
                    </View>
                ))}
            </View>

            {/* Widget do tempo */}
            <View style={styles.section}>
                <View style={styles.weatherCard}>
                    <LinearGradient
                        colors={['#64b5f6', '#42a5f5']}
                        style={styles.weatherGradient}
                    >
                        <View style={styles.weatherContent}>
                            <View>
                                <Text style={styles.weatherTemp}>22°C</Text>
                                <Text style={styles.weatherDesc}>Parcialmente Nublado</Text>
                                <Text style={styles.weatherLocation}>Lisboa, Portugal</Text>
                            </View>
                            <Text style={styles.weatherIcon}>⛅</Text>
                        </View>
                    </LinearGradient>
                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    header: {
        paddingTop: 50,
        paddingBottom: 30,
        paddingHorizontal: 20,
    },
    headerContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    greeting: {
        fontSize: 16,
        color: '#fff',
        opacity: 0.9,
    },
    userName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
        marginTop: 5,
    },
    profileButton: {
        padding: 4,
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#fff',
    },
    avatarText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
    },
    statsContainer: {
        padding: 20,
        marginTop: -20,
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 15,
    },
    statCard: {
        flex: 1,
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 20,
        marginHorizontal: 5,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        position: 'relative',
    },
    statNumber: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 5,
    },
    statLabel: {
        fontSize: 12,
        color: '#666',
        fontWeight: '500',
    },
    statIcon: {
        position: 'absolute',
        top: 15,
        right: 15,
        fontSize: 20,
        opacity: 0.7,
    },
    section: {
        paddingHorizontal: 20,
        marginBottom: 25,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
    },
    seeAllText: {
        color: '#1e88e5',
        fontSize: 14,
        fontWeight: '500',
    },
    quickActionsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    quickActionCard: {
        width: (width - 50) / 2,
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 20,
        marginBottom: 15,
        borderLeftWidth: 4,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        alignItems: 'center',
    },
    quickActionIcon: {
        fontSize: 30,
        marginBottom: 10,
    },
    quickActionName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        textAlign: 'center',
    },
    activityItem: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 15,
        marginBottom: 10,
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
    },
    activityIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#f5f5f5',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    activityContent: {
        flex: 1,
        justifyContent: 'center',
    },
    activityDescription: {
        fontSize: 14,
        fontWeight: '500',
        color: '#333',
        marginBottom: 5,
    },
    activityTime: {
        fontSize: 12,
        color: '#666',
    },
    weatherCard: {
        borderRadius: 12,
        overflow: 'hidden',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    weatherGradient: {
        padding: 20,
    },
    weatherContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    weatherTemp: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#fff',
    },
    weatherDesc: {
        fontSize: 14,
        color: '#fff',
        opacity: 0.9,
        marginTop: 5,
    },
    weatherLocation: {
        fontSize: 12,
        color: '#fff',
        opacity: 0.8,
        marginTop: 5,
    },
    weatherIcon: {
        fontSize: 50,
    },
});
