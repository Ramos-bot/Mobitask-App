import React, { useState, useEffect } from 'react';
import {
    View, Text, ScrollView, TouchableOpacity, StyleSheet,
    StatusBar, Alert, RefreshControl, Modal
} from 'react-native';
import { useApp } from '../shared/context/AppContext';

export default function SubscriptionScreen({ user, onBack, onNavigate }) {
    const {
        clients,
        loading
    } = useApp();

    const [refreshing, setRefreshing] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
    const [subscriptionData, setSubscriptionData] = useState({
        current: {
            plan: 'professional',
            status: 'active',
            startDate: '2024-01-01',
            nextBilling: '2024-02-01',
            price: 149.99,
            currency: 'EUR',
            modules: ['aqua', 'verde', 'phyto'],
            limits: {
                clients: 100,
                storage: '50GB',
                users: 5,
                reports: 'unlimited'
            },
            features: [
                'Todos os módulos incluídos',
                'Suporte prioritário 24/7',
                'Relatórios avançados',
                'Backup automático',
                'API integração',
                'Personalização avançada'
            ]
        },
        usage: {
            clients: 45,
            storage: '32GB',
            users: 3,
            apiCalls: 1250
        },
        billing: [
            {
                id: 'bill_1',
                date: '2024-01-01',
                amount: 149.99,
                status: 'paid',
                description: 'Subscrição Mensal - Plano Professional'
            },
            {
                id: 'bill_2',
                date: '2023-12-01',
                amount: 149.99,
                status: 'paid',
                description: 'Subscrição Mensal - Plano Professional'
            },
            {
                id: 'bill_3',
                date: '2023-11-01',
                amount: 149.99,
                status: 'paid',
                description: 'Subscrição Mensal - Plano Professional'
            }
        ]
    });

    const plans = [
        {
            id: 'basic',
            name: 'Básico',
            price: 49.99,
            popular: false,
            modules: ['aqua'],
            limits: {
                clients: 25,
                storage: '10GB',
                users: 2,
                reports: '10/mês'
            },
            features: [
                'Módulo Aqua incluído',
                'Suporte por email',
                'Relatórios básicos',
                'Backup semanal'
            ],
            color: '#4caf50'
        },
        {
            id: 'professional',
            name: 'Professional',
            price: 149.99,
            popular: true,
            modules: ['aqua', 'verde', 'phyto'],
            limits: {
                clients: 100,
                storage: '50GB',
                users: 5,
                reports: 'ilimitados'
            },
            features: [
                'Todos os módulos incluídos',
                'Suporte prioritário 24/7',
                'Relatórios avançados',
                'Backup automático',
                'API integração',
                'Personalização avançada'
            ],
            color: '#1e88e5'
        },
        {
            id: 'enterprise',
            name: 'Enterprise',
            price: 299.99,
            popular: false,
            modules: ['aqua', 'verde', 'phyto', 'custom'],
            limits: {
                clients: 'ilimitados',
                storage: '200GB',
                users: 'ilimitados',
                reports: 'ilimitados'
            },
            features: [
                'Todos os módulos + customizações',
                'Gestor de conta dedicado',
                'Relatórios personalizados',
                'Backup em tempo real',
                'API premium',
                'White-label',
                'Integrações personalizadas',
                'Consultoria técnica'
            ],
            color: '#9c27b0'
        }
    ];

    const onRefresh = async () => {
        setRefreshing(true);
        // Simular carregamento
        setTimeout(() => {
            setRefreshing(false);
        }, 1000);
    };

    const getModuleIcon = (module) => {
        switch (module) {
            case 'aqua': return '💧';
            case 'verde': return '🌱';
            case 'phyto': return '🧪';
            case 'custom': return '🔧';
            default: return '📦';
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'active': return '#4caf50';
            case 'cancelled': return '#f44336';
            case 'pending': return '#ff9800';
            case 'expired': return '#666';
            default: return '#666';
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'active': return 'Ativa';
            case 'cancelled': return 'Cancelada';
            case 'pending': return 'Pendente';
            case 'expired': return 'Expirada';
            case 'paid': return 'Pago';
            default: return status;
        }
    };

    const calculateDaysUntilBilling = () => {
        const nextBilling = new Date(subscriptionData.current.nextBilling);
        const today = new Date();
        const diffTime = nextBilling - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    const getUsagePercentage = (used, limit) => {
        if (typeof limit === 'string' && limit.includes('ilimitado')) return 0;
        const numericLimit = parseInt(limit);
        const numericUsed = parseInt(used);
        return (numericUsed / numericLimit) * 100;
    };

    const handlePlanSelect = (plan) => {
        if (plan.id === subscriptionData.current.plan) {
            Alert.alert('Plano Atual', 'Este já é o seu plano atual.');
            return;
        }

        setSelectedPlan(plan);
        setShowUpgradeModal(true);
    };

    const handleUpgrade = () => {
        if (!selectedPlan) return;

        Alert.alert(
            'Confirmar Alteração',
            `Deseja alterar para o plano ${selectedPlan.name}?\n\nNovo valor: €${selectedPlan.price}/mês`,
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Confirmar',
                    onPress: () => {
                        // Simular upgrade
                        setSubscriptionData(prev => ({
                            ...prev,
                            current: {
                                ...prev.current,
                                plan: selectedPlan.id,
                                price: selectedPlan.price,
                                modules: selectedPlan.modules,
                                limits: selectedPlan.limits,
                                features: selectedPlan.features
                            }
                        }));
                        setShowUpgradeModal(false);
                        Alert.alert('Sucesso', 'Plano alterado com sucesso!');
                    }
                }
            ]
        );
    };

    const renderCurrentPlan = () => (
        <View style={styles.currentPlanCard}>
            <View style={styles.currentPlanHeader}>
                <Text style={styles.currentPlanTitle}>Plano Atual</Text>
                <View style={[
                    styles.statusBadge,
                    { backgroundColor: getStatusColor(subscriptionData.current.status) }
                ]}>
                    <Text style={styles.statusText}>
                        {getStatusText(subscriptionData.current.status)}
                    </Text>
                </View>
            </View>

            <Text style={styles.planName}>
                {plans.find(p => p.id === subscriptionData.current.plan)?.name || 'Professional'}
            </Text>

            <Text style={styles.planPrice}>
                €{subscriptionData.current.price}/mês
            </Text>

            <View style={styles.billingInfo}>
                <Text style={styles.billingText}>
                    Próxima faturação: {new Date(subscriptionData.current.nextBilling).toLocaleDateString('pt-PT')}
                </Text>
                <Text style={styles.billingDays}>
                    ({calculateDaysUntilBilling()} dias)
                </Text>
            </View>

            <View style={styles.modulesIncluded}>
                <Text style={styles.sectionSubtitle}>Módulos Incluídos:</Text>
                <View style={styles.modulesList}>
                    {subscriptionData.current.modules.map((module, index) => (
                        <View key={index} style={styles.moduleChip}>
                            <Text style={styles.moduleIcon}>{getModuleIcon(module)}</Text>
                            <Text style={styles.moduleText}>
                                {module.charAt(0).toUpperCase() + module.slice(1)}
                            </Text>
                        </View>
                    ))}
                </View>
            </View>
        </View>
    );

    const renderUsageStats = () => (
        <View style={styles.usageCard}>
            <Text style={styles.sectionTitle}>Utilização</Text>

            <View style={styles.usageItem}>
                <View style={styles.usageHeader}>
                    <Text style={styles.usageLabel}>Clientes</Text>
                    <Text style={styles.usageValue}>
                        {subscriptionData.usage.clients}/{subscriptionData.current.limits.clients}
                    </Text>
                </View>
                <View style={styles.progressBar}>
                    <View
                        style={[
                            styles.progressFill,
                            {
                                width: `${getUsagePercentage(
                                    subscriptionData.usage.clients,
                                    subscriptionData.current.limits.clients
                                )}%`
                            }
                        ]}
                    />
                </View>
            </View>

            <View style={styles.usageItem}>
                <View style={styles.usageHeader}>
                    <Text style={styles.usageLabel}>Armazenamento</Text>
                    <Text style={styles.usageValue}>
                        {subscriptionData.usage.storage}/{subscriptionData.current.limits.storage}
                    </Text>
                </View>
                <View style={styles.progressBar}>
                    <View
                        style={[
                            styles.progressFill,
                            {
                                width: `${getUsagePercentage(
                                    subscriptionData.usage.storage,
                                    subscriptionData.current.limits.storage
                                )}%`
                            }
                        ]}
                    />
                </View>
            </View>

            <View style={styles.usageItem}>
                <View style={styles.usageHeader}>
                    <Text style={styles.usageLabel}>Utilizadores</Text>
                    <Text style={styles.usageValue}>
                        {subscriptionData.usage.users}/{subscriptionData.current.limits.users}
                    </Text>
                </View>
                <View style={styles.progressBar}>
                    <View
                        style={[
                            styles.progressFill,
                            {
                                width: `${getUsagePercentage(
                                    subscriptionData.usage.users,
                                    subscriptionData.current.limits.users
                                )}%`
                            }
                        ]}
                    />
                </View>
            </View>
        </View>
    );

    const renderPlanCard = (plan) => {
        const isCurrentPlan = plan.id === subscriptionData.current.plan;

        return (
            <TouchableOpacity
                key={plan.id}
                style={[
                    styles.planCard,
                    plan.popular && styles.popularPlan,
                    isCurrentPlan && styles.currentPlanBorder
                ]}
                onPress={() => handlePlanSelect(plan)}
                disabled={isCurrentPlan}
            >
                {plan.popular && (
                    <View style={styles.popularBadge}>
                        <Text style={styles.popularText}>Mais Popular</Text>
                    </View>
                )}

                <Text style={styles.planCardName}>{plan.name}</Text>
                <Text style={[styles.planCardPrice, { color: plan.color }]}>
                    €{plan.price}
                    <Text style={styles.priceUnit}>/mês</Text>
                </Text>

                <View style={styles.planModules}>
                    {plan.modules.map((module, index) => (
                        <Text key={index} style={styles.planModuleIcon}>
                            {getModuleIcon(module)}
                        </Text>
                    ))}
                </View>

                <View style={styles.planLimits}>
                    <Text style={styles.limitText}>👥 {plan.limits.clients} clientes</Text>
                    <Text style={styles.limitText}>💾 {plan.limits.storage}</Text>
                    <Text style={styles.limitText}>👤 {plan.limits.users} utilizadores</Text>
                    <Text style={styles.limitText}>📊 {plan.limits.reports} relatórios</Text>
                </View>

                <View style={styles.planFeatures}>
                    {plan.features.slice(0, 3).map((feature, index) => (
                        <Text key={index} style={styles.featureText}>
                            ✓ {feature}
                        </Text>
                    ))}
                    {plan.features.length > 3 && (
                        <Text style={styles.moreFeatures}>
                            +{plan.features.length - 3} mais funcionalidades
                        </Text>
                    )}
                </View>

                <View style={styles.planAction}>
                    {isCurrentPlan ? (
                        <View style={styles.currentPlanButton}>
                            <Text style={styles.currentPlanButtonText}>Plano Atual</Text>
                        </View>
                    ) : (
                        <View style={[styles.selectPlanButton, { backgroundColor: plan.color }]}>
                            <Text style={styles.selectPlanButtonText}>
                                {plan.price > subscriptionData.current.price ? 'Upgrade' : 'Downgrade'}
                            </Text>
                        </View>
                    )}
                </View>
            </TouchableOpacity>
        );
    };

    const renderBillingHistory = () => (
        <View style={styles.billingCard}>
            <Text style={styles.sectionTitle}>Histórico de Faturação</Text>

            {subscriptionData.billing.map((bill) => (
                <View key={bill.id} style={styles.billItem}>
                    <View style={styles.billInfo}>
                        <Text style={styles.billDescription}>{bill.description}</Text>
                        <Text style={styles.billDate}>
                            {new Date(bill.date).toLocaleDateString('pt-PT')}
                        </Text>
                    </View>
                    <View style={styles.billAmount}>
                        <Text style={styles.billPrice}>€{bill.amount}</Text>
                        <View style={[
                            styles.billStatus,
                            { backgroundColor: getStatusColor(bill.status) }
                        ]}>
                            <Text style={styles.billStatusText}>
                                {getStatusText(bill.status)}
                            </Text>
                        </View>
                    </View>
                </View>
            ))}
        </View>
    );

    const renderUpgradeModal = () => (
        <Modal
            visible={showUpgradeModal}
            animationType="slide"
            transparent={true}
            onRequestClose={() => setShowUpgradeModal(false)}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Alterar Plano</Text>
                        <TouchableOpacity
                            style={styles.modalCloseButton}
                            onPress={() => setShowUpgradeModal(false)}
                        >
                            <Text style={styles.modalCloseText}>✕</Text>
                        </TouchableOpacity>
                    </View>

                    {selectedPlan && (
                        <View style={styles.modalBody}>
                            <Text style={styles.modalPlanName}>{selectedPlan.name}</Text>
                            <Text style={styles.modalPlanPrice}>€{selectedPlan.price}/mês</Text>

                            <View style={styles.modalFeatures}>
                                <Text style={styles.modalFeaturesTitle}>Funcionalidades incluídas:</Text>
                                {selectedPlan.features.map((feature, index) => (
                                    <Text key={index} style={styles.modalFeature}>
                                        ✓ {feature}
                                    </Text>
                                ))}
                            </View>

                            <View style={styles.modalActions}>
                                <TouchableOpacity
                                    style={styles.modalCancelButton}
                                    onPress={() => setShowUpgradeModal(false)}
                                >
                                    <Text style={styles.modalCancelText}>Cancelar</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.modalConfirmButton, { backgroundColor: selectedPlan.color }]}
                                    onPress={handleUpgrade}
                                >
                                    <Text style={styles.modalConfirmText}>Confirmar</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}
                </View>
            </View>
        </Modal>
    );

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#1565C0" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={onBack}>
                    <Text style={styles.backIcon}>‹</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Subscrições</Text>
                <View style={styles.headerRight} />
            </View>

            <ScrollView
                style={styles.content}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
                showsVerticalScrollIndicator={false}
            >
                {renderCurrentPlan()}
                {renderUsageStats()}

                <View style={styles.plansSection}>
                    <Text style={styles.sectionTitle}>Planos Disponíveis</Text>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        style={styles.plansScroll}
                    >
                        {plans.map(renderPlanCard)}
                    </ScrollView>
                </View>

                {renderBillingHistory()}
            </ScrollView>

            {renderUpgradeModal()}
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
        backgroundColor: '#1565C0',
    },
    backButton: {
        padding: 8,
    },
    backIcon: {
        fontSize: 24,
        color: '#fff',
        fontWeight: 'bold',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
        flex: 1,
        textAlign: 'center',
    },
    headerRight: {
        width: 40,
    },
    content: {
        flex: 1,
        padding: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 15,
    },
    sectionSubtitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#666',
        marginBottom: 10,
    },
    currentPlanCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 20,
        marginBottom: 20,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    currentPlanHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    currentPlanTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusText: {
        fontSize: 10,
        color: '#fff',
        fontWeight: 'bold',
    },
    planName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 5,
    },
    planPrice: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1e88e5',
        marginBottom: 15,
    },
    billingInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    billingText: {
        fontSize: 14,
        color: '#666',
    },
    billingDays: {
        fontSize: 12,
        color: '#999',
        marginLeft: 5,
    },
    modulesIncluded: {
        marginTop: 10,
    },
    modulesList: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    moduleChip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f0f0f0',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 15,
    },
    moduleIcon: {
        fontSize: 12,
        marginRight: 5,
    },
    moduleText: {
        fontSize: 12,
        color: '#333',
        fontWeight: '500',
    },
    usageCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 20,
        marginBottom: 20,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    usageItem: {
        marginBottom: 20,
    },
    usageHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    usageLabel: {
        fontSize: 14,
        color: '#666',
        fontWeight: '500',
    },
    usageValue: {
        fontSize: 14,
        color: '#333',
        fontWeight: 'bold',
    },
    progressBar: {
        height: 6,
        backgroundColor: '#f0f0f0',
        borderRadius: 3,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        backgroundColor: '#1e88e5',
        borderRadius: 3,
    },
    plansSection: {
        marginBottom: 20,
    },
    plansScroll: {
        paddingVertical: 10,
    },
    planCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 20,
        marginRight: 15,
        width: 280,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        position: 'relative',
    },
    popularPlan: {
        borderWidth: 2,
        borderColor: '#ff9800',
    },
    currentPlanBorder: {
        borderWidth: 2,
        borderColor: '#4caf50',
    },
    popularBadge: {
        position: 'absolute',
        top: -10,
        left: 20,
        backgroundColor: '#ff9800',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
    },
    popularText: {
        fontSize: 10,
        color: '#fff',
        fontWeight: 'bold',
    },
    planCardName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 10,
        marginTop: 10,
    },
    planCardPrice: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 15,
    },
    priceUnit: {
        fontSize: 14,
        fontWeight: 'normal',
        color: '#666',
    },
    planModules: {
        flexDirection: 'row',
        marginBottom: 15,
    },
    planModuleIcon: {
        fontSize: 20,
        marginRight: 8,
    },
    planLimits: {
        marginBottom: 15,
    },
    limitText: {
        fontSize: 12,
        color: '#666',
        marginBottom: 3,
    },
    planFeatures: {
        marginBottom: 20,
        flex: 1,
    },
    featureText: {
        fontSize: 12,
        color: '#333',
        marginBottom: 5,
        lineHeight: 16,
    },
    moreFeatures: {
        fontSize: 10,
        color: '#999',
        fontStyle: 'italic',
    },
    planAction: {
        marginTop: 'auto',
    },
    currentPlanButton: {
        backgroundColor: '#4caf50',
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    currentPlanButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
    selectPlanButton: {
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    selectPlanButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
    billingCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 20,
        marginBottom: 20,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    billItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    billInfo: {
        flex: 1,
    },
    billDescription: {
        fontSize: 14,
        color: '#333',
        marginBottom: 3,
    },
    billDate: {
        fontSize: 12,
        color: '#666',
    },
    billAmount: {
        alignItems: 'flex-end',
    },
    billPrice: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 5,
    },
    billStatus: {
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 8,
    },
    billStatusText: {
        fontSize: 8,
        color: '#fff',
        fontWeight: 'bold',
    },
    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderRadius: 12,
        margin: 20,
        maxHeight: '80%',
        width: '90%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    modalCloseButton: {
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: '#f5f5f5',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalCloseText: {
        fontSize: 16,
        color: '#666',
    },
    modalBody: {
        padding: 20,
    },
    modalPlanName: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        textAlign: 'center',
        marginBottom: 10,
    },
    modalPlanPrice: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1e88e5',
        textAlign: 'center',
        marginBottom: 20,
    },
    modalFeatures: {
        marginBottom: 30,
    },
    modalFeaturesTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 10,
    },
    modalFeature: {
        fontSize: 14,
        color: '#666',
        marginBottom: 5,
        lineHeight: 20,
    },
    modalActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    modalCancelButton: {
        flex: 1,
        backgroundColor: '#f5f5f5',
        paddingVertical: 12,
        borderRadius: 8,
        marginRight: 10,
        alignItems: 'center',
    },
    modalCancelText: {
        fontSize: 14,
        color: '#666',
        fontWeight: '600',
    },
    modalConfirmButton: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 8,
        marginLeft: 10,
        alignItems: 'center',
    },
    modalConfirmText: {
        fontSize: 14,
        color: '#fff',
        fontWeight: '600',
    },
});
