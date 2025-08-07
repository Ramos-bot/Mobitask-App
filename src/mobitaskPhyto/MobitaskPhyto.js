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
 * MOBITASK PHYTO - Módulo de Proteção Fitossanitária
 * 
 * Funcionalidades:
 * - Gestão de tratamentos fitossanitários
 * - Calendário de aplicações
 * - Controlo de pragas e doenças
 * - Gestão de produtos fitofarmacêuticos
 * - Registos de aplicação
 * - Análise de eficácia
 * - Compliance e certificações
 */
export default function MobitaskPhyto({ onBack }) {
    const { user, moduleAccess } = useContext(AppContext);
    const [currentSection, setCurrentSection] = useState('dashboard');

    const sections = [
        {
            id: 'dashboard',
            title: 'Dashboard Phyto',
            icon: '🧪',
            color: '#ff9800',
            description: 'Visão geral dos tratamentos'
        },
        {
            id: 'treatments',
            title: 'Tratamentos',
            icon: '💊',
            color: '#f57c00',
            description: 'Gestão de aplicações'
        },
        {
            id: 'products',
            title: 'Produtos',
            icon: '🍼',
            color: '#ef6c00',
            description: 'Inventário de fitofármacos'
        },
        {
            id: 'pests',
            title: 'Pragas & Doenças',
            icon: '🐛',
            color: '#e65100',
            description: 'Monitorização sanitária'
        },
        {
            id: 'calendar',
            title: 'Calendário',
            icon: '📅',
            color: '#bf360c',
            description: 'Planeamento de aplicações'
        },
        {
            id: 'records',
            title: 'Registos',
            icon: '📋',
            color: '#795548',
            description: 'Histórico de aplicações'
        },
        {
            id: 'compliance',
            title: 'Compliance',
            icon: '✅',
            color: '#4caf50',
            description: 'Certificações e normas'
        },
        {
            id: 'analytics',
            title: 'Análises',
            icon: '📊',
            color: '#9c27b0',
            description: 'Eficácia e relatórios'
        }
    ];

    const mockStats = {
        activeFields: 8,
        scheduledTreatments: 15,
        productsInStock: 42,
        complianceRate: '98%',
        costSavings: '€3.2k',
        efficacyRate: '94%'
    };

    const renderDashboard = () => (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Estatísticas Principais */}
            <View style={styles.statsContainer}>
                <View style={[styles.statCard, { backgroundColor: '#fff3e0' }]}>
                    <Text style={styles.statNumber}>{mockStats.activeFields}</Text>
                    <Text style={styles.statLabel}>Campos Ativos</Text>
                    <Text style={styles.statIcon}>🌾</Text>
                </View>
                <View style={[styles.statCard, { backgroundColor: '#fce4ec' }]}>
                    <Text style={styles.statNumber}>{mockStats.scheduledTreatments}</Text>
                    <Text style={styles.statLabel}>Tratamentos Agendados</Text>
                    <Text style={styles.statIcon}>💊</Text>
                </View>
                <View style={[styles.statCard, { backgroundColor: '#e8f5e8' }]}>
                    <Text style={styles.statNumber}>{mockStats.productsInStock}</Text>
                    <Text style={styles.statLabel}>Produtos em Stock</Text>
                    <Text style={styles.statIcon}>🍼</Text>
                </View>
                <View style={[styles.statCard, { backgroundColor: '#e3f2fd' }]}>
                    <Text style={styles.statNumber}>{mockStats.complianceRate}</Text>
                    <Text style={styles.statLabel}>Taxa Compliance</Text>
                    <Text style={styles.statIcon}>✅</Text>
                </View>
            </View>

            {/* Métricas de Performance */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Performance de Tratamentos</Text>
                <View style={styles.metricsContainer}>
                    <View style={styles.metricCard}>
                        <Text style={styles.metricValue}>{mockStats.costSavings}</Text>
                        <Text style={styles.metricLabel}>Poupança de Custos</Text>
                        <Text style={styles.metricTrend}>💰 -18% vs ano anterior</Text>
                    </View>
                    <View style={styles.metricCard}>
                        <Text style={styles.metricValue}>{mockStats.efficacyRate}</Text>
                        <Text style={styles.metricLabel}>Taxa de Eficácia</Text>
                        <Text style={styles.metricTrend}>📈 +5% vs trimestre anterior</Text>
                    </View>
                </View>
            </View>

            {/* Ações Rápidas */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Ações Rápidas</Text>
                <View style={styles.quickActionsGrid}>
                    <TouchableOpacity style={styles.quickAction}>
                        <Text style={styles.quickActionIcon}>💊</Text>
                        <Text style={styles.quickActionText}>Nova Aplicação</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.quickAction}>
                        <Text style={styles.quickActionIcon}>📷</Text>
                        <Text style={styles.quickActionText}>Scan Praga</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.quickAction}>
                        <Text style={styles.quickActionIcon}>📋</Text>
                        <Text style={styles.quickActionText}>Registar Aplicação</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.quickAction}>
                        <Text style={styles.quickActionIcon}>📊</Text>
                        <Text style={styles.quickActionText}>Relatório</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Alertas de Segurança */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Alertas & Segurança</Text>
                <View style={[styles.alertCard, { borderLeftColor: '#f44336' }]}>
                    <Text style={styles.alertIcon}>⚠️</Text>
                    <View style={styles.alertContent}>
                        <Text style={styles.alertTitle}>Intervalo de Segurança</Text>
                        <Text style={styles.alertMessage}>
                            Campo Norte: Aguardar mais 3 dias antes da próxima aplicação
                        </Text>
                        <Text style={styles.alertTime}>Crítico</Text>
                    </View>
                </View>
                <View style={[styles.alertCard, { borderLeftColor: '#ff9800' }]}>
                    <Text style={styles.alertIcon}>🍼</Text>
                    <View style={styles.alertContent}>
                        <Text style={styles.alertTitle}>Stock Baixo</Text>
                        <Text style={styles.alertMessage}>
                            Fungicida XYZ: Restam apenas 2 litros em stock
                        </Text>
                        <Text style={styles.alertTime}>Atenção</Text>
                    </View>
                </View>
                <View style={[styles.alertCard, { borderLeftColor: '#4caf50' }]}>
                    <Text style={styles.alertIcon}>✅</Text>
                    <View style={styles.alertContent}>
                        <Text style={styles.alertTitle}>Aplicação Concluída</Text>
                        <Text style={styles.alertMessage}>
                            Herbicida aplicado no Campo Sul conforme planeado
                        </Text>
                        <Text style={styles.alertTime}>Sucesso</Text>
                    </View>
                </View>
            </View>

            {/* Próximos Tratamentos */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Próximos Tratamentos</Text>
                <View style={styles.treatmentCard}>
                    <View style={styles.treatmentHeader}>
                        <Text style={styles.treatmentField}>Campo Norte</Text>
                        <Text style={styles.treatmentDate}>Amanhã, 08:00</Text>
                    </View>
                    <Text style={styles.treatmentProduct}>🧪 Inseticida ABC - 500ml/ha</Text>
                    <Text style={styles.treatmentTarget}>🐛 Alvo: Pulgão do trigo</Text>
                </View>
                <View style={styles.treatmentCard}>
                    <View style={styles.treatmentHeader}>
                        <Text style={styles.treatmentField}>Campo Sul</Text>
                        <Text style={styles.treatmentDate}>Sexta, 06:30</Text>
                    </View>
                    <Text style={styles.treatmentProduct}>🌿 Herbicida XYZ - 2L/ha</Text>
                    <Text style={styles.treatmentTarget}>🌱 Alvo: Ervas daninhas</Text>
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
                        Esta funcionalidade estará disponível na próxima versão do Mobitask Phyto.
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
        <ModuleProtection moduleId="phyto">
            <View style={styles.container}>
                <StatusBar barStyle="light-content" backgroundColor="#ff9800" />

                {/* Header */}
                <LinearGradient
                    colors={['#ff9800', '#f57c00', '#ef6c00']}
                    style={styles.header}
                >
                    <View style={styles.headerContent}>
                        <TouchableOpacity onPress={onBack} style={styles.backButton}>
                            <Text style={styles.backButtonText}>← Base</Text>
                        </TouchableOpacity>
                        <View style={styles.headerTitle}>
                            <Text style={styles.headerTitleText}>🧪 Mobitask Phyto</Text>
                            <Text style={styles.headerSubtitle}>Proteção Fitossanitária</Text>
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
        color: '#fff3e0',
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
        backgroundColor: '#ff9800',
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
        color: '#ff9800',
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
        borderLeftWidth: 4,
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
        fontWeight: '600',
        color: '#ff9800',
    },
    treatmentCard: {
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 12,
        marginVertical: 5,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    treatmentHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    treatmentField: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    treatmentDate: {
        fontSize: 12,
        color: '#ff9800',
        fontWeight: '600',
    },
    treatmentProduct: {
        fontSize: 12,
        color: '#666',
        marginBottom: 3,
    },
    treatmentTarget: {
        fontSize: 12,
        color: '#888',
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
        backgroundColor: '#ff9800',
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
