import React, { useState, useContext } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    StatusBar,
    Alert
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AppContext } from '../shared/context/AppContext';
import ModuleProtection from '../shared/components/ModuleProtection';

/**
 * MOBITASK VERDE - Módulo de Gestão de Jardins e Espaços Verdes
 * 
 * Funcionalidades:
 * - Gestão de jardins e plantas
 * - Sistema de rega inteligente
 * - Monitorização de crescimento
 * - Calendário de manutenção
 * - Alertas meteorológicos
 * - Gestão de equipamentos
 */
export default function MobitaskVerde({ onBack }) {
    const { user, moduleAccess } = useContext(AppContext);
    const [currentSection, setCurrentSection] = useState('dashboard');

    const sections = [
        {
            id: 'dashboard',
            title: 'Dashboard Verde',
            icon: '🌱',
            color: '#4caf50',
            description: 'Visão geral dos seus jardins'
        },
        {
            id: 'gardens',
            title: 'Gestão de Jardins',
            icon: '🏡',
            color: '#66bb6a',
            description: 'Gerir jardins e espaços verdes'
        },
        {
            id: 'irrigation',
            title: 'Sistema de Rega',
            icon: '💧',
            color: '#42a5f5',
            description: 'Controlo automático de irrigação'
        },
        {
            id: 'plants',
            title: 'Catálogo de Plantas',
            icon: '🌿',
            color: '#8bc34a',
            description: 'Base de dados de plantas'
        },
        {
            id: 'maintenance',
            title: 'Manutenção',
            icon: '🔧',
            color: '#ff9800',
            description: 'Calendário de tarefas'
        },
        {
            id: 'weather',
            title: 'Meteorologia',
            icon: '🌤️',
            color: '#03a9f4',
            description: 'Condições climáticas'
        },
        {
            id: 'equipment',
            title: 'Equipamentos',
            icon: '⚙️',
            color: '#607d8b',
            description: 'Gestão de ferramentas'
        },
        {
            id: 'reports',
            title: 'Relatórios',
            icon: '📊',
            color: '#9c27b0',
            description: 'Análises e estatísticas'
        }
    ];

    const mockStats = {
        activeGardens: 12,
        healthyPlants: 156,
        scheduledIrrigation: 8,
        maintenanceTasks: 5,
        waterSaved: '2.3k L',
        growthRate: '+15%'
    };

    const renderDashboard = () => (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Estatísticas Principais */}
            <View style={styles.statsContainer}>
                <View style={[styles.statCard, { backgroundColor: '#e8f5e8' }]}>
                    <Text style={styles.statNumber}>{mockStats.activeGardens}</Text>
                    <Text style={styles.statLabel}>Jardins Ativos</Text>
                    <Text style={styles.statIcon}>🏡</Text>
                </View>
                <View style={[styles.statCard, { backgroundColor: '#f3e5f5' }]}>
                    <Text style={styles.statNumber}>{mockStats.healthyPlants}</Text>
                    <Text style={styles.statLabel}>Plantas Saudáveis</Text>
                    <Text style={styles.statIcon}>🌱</Text>
                </View>
                <View style={[styles.statCard, { backgroundColor: '#e3f2fd' }]}>
                    <Text style={styles.statNumber}>{mockStats.scheduledIrrigation}</Text>
                    <Text style={styles.statLabel}>Regas Agendadas</Text>
                    <Text style={styles.statIcon}>💧</Text>
                </View>
                <View style={[styles.statCard, { backgroundColor: '#fff3e0' }]}>
                    <Text style={styles.statNumber}>{mockStats.maintenanceTasks}</Text>
                    <Text style={styles.statLabel}>Tarefas Pendentes</Text>
                    <Text style={styles.statIcon}>🔧</Text>
                </View>
            </View>

            {/* Métricas de Performance */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Performance Ambiental</Text>
                <View style={styles.metricsContainer}>
                    <View style={styles.metricCard}>
                        <Text style={styles.metricValue}>{mockStats.waterSaved}</Text>
                        <Text style={styles.metricLabel}>Água Poupada</Text>
                        <Text style={styles.metricTrend}>💧 -12% vs mês anterior</Text>
                    </View>
                    <View style={styles.metricCard}>
                        <Text style={styles.metricValue}>{mockStats.growthRate}</Text>
                        <Text style={styles.metricLabel}>Taxa de Crescimento</Text>
                        <Text style={styles.metricTrend}>📈 Acima da média</Text>
                    </View>
                </View>
            </View>

            {/* Ações Rápidas */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Ações Rápidas</Text>
                <View style={styles.quickActionsGrid}>
                    <TouchableOpacity style={styles.quickAction}>
                        <Text style={styles.quickActionIcon}>💧</Text>
                        <Text style={styles.quickActionText}>Rega Manual</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.quickAction}>
                        <Text style={styles.quickActionIcon}>📷</Text>
                        <Text style={styles.quickActionText}>Scan Planta</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.quickAction}>
                        <Text style={styles.quickActionIcon}>📝</Text>
                        <Text style={styles.quickActionText}>Nova Tarefa</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.quickAction}>
                        <Text style={styles.quickActionIcon}>📊</Text>
                        <Text style={styles.quickActionText}>Relatório</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Alertas Recentes */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Alertas & Notificações</Text>
                <View style={styles.alertCard}>
                    <Text style={styles.alertIcon}>🌧️</Text>
                    <View style={styles.alertContent}>
                        <Text style={styles.alertTitle}>Chuva Prevista</Text>
                        <Text style={styles.alertMessage}>
                            Adiada rega automática para amanhã devido à previsão de chuva
                        </Text>
                        <Text style={styles.alertTime}>há 2 horas</Text>
                    </View>
                </View>
                <View style={styles.alertCard}>
                    <Text style={styles.alertIcon}>🌱</Text>
                    <View style={styles.alertContent}>
                        <Text style={styles.alertTitle}>Crescimento Detectado</Text>
                        <Text style={styles.alertMessage}>
                            Roseiras no jardim principal cresceram 5cm esta semana
                        </Text>
                        <Text style={styles.alertTime}>há 1 dia</Text>
                    </View>
                </View>
            </View>
        </ScrollView>
    );

    const renderSection = () => {
        const section = sections.find(s => s.id === currentSection);

        return (
            <View style={styles.content}>
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionHeaderTitle}>
                        {section?.icon} {section?.title}
                    </Text>
                    <Text style={styles.sectionHeaderDesc}>
                        {section?.description}
                    </Text>
                </View>

                <View style={styles.comingSoon}>
                    <Text style={styles.comingSoonIcon}>🚧</Text>
                    <Text style={styles.comingSoonTitle}>Em Desenvolvimento</Text>
                    <Text style={styles.comingSoonText}>
                        Esta funcionalidade estará disponível na próxima versão do Mobitask Verde.
                    </Text>
                    <TouchableOpacity
                        style={styles.backToDashboard}
                        onPress={() => setCurrentSection('dashboard')}
                    >
                        <Text style={styles.backToDashboardText}>Voltar ao Dashboard</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    return (
        <ModuleProtection moduleId="verde">
            <View style={styles.container}>
                <StatusBar barStyle="light-content" backgroundColor="#4caf50" />

                {/* Header */}
                <LinearGradient
                    colors={['#4caf50', '#66bb6a', '#8bc34a']}
                    style={styles.header}
                >
                    <View style={styles.headerContent}>
                        <TouchableOpacity onPress={onBack} style={styles.backButton}>
                            <Text style={styles.backButtonText}>← Base</Text>
                        </TouchableOpacity>
                        <View style={styles.headerTitle}>
                            <Text style={styles.headerTitleText}>🌱 Mobitask Verde</Text>
                            <Text style={styles.headerSubtitle}>Gestão Inteligente de Jardins</Text>
                        </View>
                        <View style={styles.headerActions}>
                            <TouchableOpacity style={styles.headerAction}>
                                <Text style={styles.headerActionText}>🔔</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </LinearGradient>

                {/* Navigation */}
                <View style={styles.navigation}>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.navContent}
                    >
                        {sections.map((section) => (
                            <TouchableOpacity
                                key={section.id}
                                style={[
                                    styles.navItem,
                                    currentSection === section.id && styles.navItemActive
                                ]}
                                onPress={() => setCurrentSection(section.id)}
                            >
                                <Text style={[
                                    styles.navItemText,
                                    currentSection === section.id && styles.navItemTextActive
                                ]}>
                                    {section.icon} {section.title}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                {/* Content */}
                {currentSection === 'dashboard' ? renderDashboard() : renderSection()}
            </View>
        </ModuleProtection>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    header: {
        paddingTop: 40,
        paddingBottom: 20,
        paddingHorizontal: 20,
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    backButton: {
        padding: 8,
    },
    backButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    headerTitle: {
        flex: 1,
        alignItems: 'center',
    },
    headerTitleText: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
    },
    headerSubtitle: {
        color: '#e8f5e8',
        fontSize: 12,
        marginTop: 2,
    },
    headerActions: {
        flexDirection: 'row',
    },
    headerAction: {
        padding: 8,
    },
    headerActionText: {
        fontSize: 20,
    },
    navigation: {
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    navContent: {
        paddingHorizontal: 10,
    },
    navItem: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        marginHorizontal: 4,
        borderRadius: 20,
    },
    navItemActive: {
        backgroundColor: '#4caf50',
    },
    navItemText: {
        fontSize: 12,
        color: '#666',
        fontWeight: '500',
    },
    navItemTextActive: {
        color: '#fff',
    },
    content: {
        flex: 1,
    },
    statsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        padding: 15,
        justifyContent: 'space-between',
    },
    statCard: {
        width: '48%',
        padding: 15,
        borderRadius: 12,
        marginVertical: 5,
        alignItems: 'center',
        position: 'relative',
    },
    statNumber: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
    },
    statLabel: {
        fontSize: 12,
        color: '#666',
        marginTop: 5,
        textAlign: 'center',
    },
    statIcon: {
        position: 'absolute',
        top: 10,
        right: 10,
        fontSize: 20,
        opacity: 0.7,
    },
    section: {
        margin: 15,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        marginBottom: 15,
    },
    metricsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    metricCard: {
        flex: 1,
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 12,
        marginHorizontal: 5,
        alignItems: 'center',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    metricValue: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#4caf50',
    },
    metricLabel: {
        fontSize: 12,
        color: '#666',
        marginTop: 5,
        textAlign: 'center',
    },
    metricTrend: {
        fontSize: 10,
        color: '#888',
        marginTop: 3,
        textAlign: 'center',
    },
    quickActionsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    quickAction: {
        width: '48%',
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 12,
        alignItems: 'center',
        marginVertical: 5,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    quickActionIcon: {
        fontSize: 24,
        marginBottom: 8,
    },
    quickActionText: {
        fontSize: 12,
        color: '#333',
        fontWeight: '500',
        textAlign: 'center',
    },
    alertCard: {
        backgroundColor: '#fff',
        flexDirection: 'row',
        padding: 15,
        borderRadius: 12,
        marginVertical: 5,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    alertIcon: {
        fontSize: 24,
        marginRight: 15,
    },
    alertContent: {
        flex: 1,
    },
    alertTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginBottom: 3,
    },
    alertMessage: {
        fontSize: 12,
        color: '#666',
        lineHeight: 16,
        marginBottom: 5,
    },
    alertTime: {
        fontSize: 10,
        color: '#999',
    },
    sectionHeader: {
        padding: 20,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    sectionHeaderTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 5,
    },
    sectionHeaderDesc: {
        fontSize: 14,
        color: '#666',
    },
    comingSoon: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
    },
    comingSoonIcon: {
        fontSize: 60,
        marginBottom: 20,
    },
    comingSoonTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 10,
    },
    comingSoonText: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: 30,
    },
    backToDashboard: {
        backgroundColor: '#4caf50',
        paddingHorizontal: 30,
        paddingVertical: 12,
        borderRadius: 25,
    },
    backToDashboardText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});
