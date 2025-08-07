import React, { useState, useEffect } from 'react';
import {
    View, Text, ScrollView, TouchableOpacity, StyleSheet,
    StatusBar, Alert, Modal, Dimensions
} from 'react-native';
import { useApp } from '../shared/context/AppContext';
import { useLicenseManager } from '../core/licensing/LicenseManager';
import { MODULE_CONFIG, SUBSCRIPTION_PLANS } from '../config/modules.config';

const { width } = Dimensions.get('window');

export default function MarketplaceScreen({ user, onBack, onNavigate }) {
    const { userSubscription } = useApp();
    const {
        getUnlicensedModules,
        getSubscriptionInfo,
        simulateUpgrade,
        getCurrentMonthlyCost
    } = useLicenseManager(userSubscription);

    const [selectedTab, setSelectedTab] = useState('modules');
    const [selectedModule, setSelectedModule] = useState(null);
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [showPurchaseModal, setShowPurchaseModal] = useState(false);
    const [purchaseType, setPurchaseType] = useState('module'); // 'module' or 'plan'

    const unlicensedModules = getUnlicensedModules();
    const subscriptionInfo = getSubscriptionInfo();
    const currentCost = getCurrentMonthlyCost();

    const handleModulePurchase = (module) => {
        setSelectedModule(module);
        setPurchaseType('module');
        setShowPurchaseModal(true);
    };

    const handlePlanUpgrade = (plan) => {
        setSelectedPlan(plan);
        setPurchaseType('plan');
        setShowPurchaseModal(true);
    };

    const confirmPurchase = () => {
        if (purchaseType === 'module' && selectedModule) {
            Alert.alert(
                'Confirmar Compra',
                `Deseja adicionar ${selectedModule.name} por €${selectedModule.price}/mês?`,
                [
                    { text: 'Cancelar', style: 'cancel' },
                    {
                        text: 'Comprar',
                        onPress: () => {
                            // Aqui integraria com sistema de pagamento
                            Alert.alert('Sucesso', 'Módulo adicionado com sucesso!');
                            setShowPurchaseModal(false);
                        }
                    }
                ]
            );
        } else if (purchaseType === 'plan' && selectedPlan) {
            const simulation = simulateUpgrade(selectedPlan.id);
            Alert.alert(
                'Confirmar Upgrade',
                `Deseja fazer upgrade para ${selectedPlan.name}?\n\nNovo valor: €${simulation.totalCost}/mês\nEconomia: €${simulation.savings}/mês`,
                [
                    { text: 'Cancelar', style: 'cancel' },
                    {
                        text: 'Upgrade',
                        onPress: () => {
                            Alert.alert('Sucesso', 'Plano alterado com sucesso!');
                            setShowPurchaseModal(false);
                        }
                    }
                ]
            );
        }
    };

    const renderModuleCard = (module) => (
        <View key={module.id} style={[styles.moduleCard, { borderLeftColor: module.color }]}>
            <View style={styles.moduleHeader}>
                <View style={[styles.moduleIcon, { backgroundColor: `${module.color}20` }]}>
                    <Text style={styles.moduleIconText}>{module.icon}</Text>
                </View>
                <View style={styles.moduleInfo}>
                    <Text style={styles.moduleName}>{module.name}</Text>
                    <Text style={styles.moduleDescription}>{module.description}</Text>
                </View>
                <View style={styles.modulePrice}>
                    <Text style={[styles.priceText, { color: module.color }]}>
                        €{module.price}
                    </Text>
                    <Text style={styles.priceUnit}>/mês</Text>
                </View>
            </View>

            <View style={styles.moduleFeatures}>
                <Text style={styles.featuresTitle}>Funcionalidades incluídas:</Text>
                {module.features.slice(0, 3).map((feature, index) => (
                    <Text key={index} style={styles.featureItem}>
                        ✓ {feature}
                    </Text>
                ))}
                {module.features.length > 3 && (
                    <Text style={styles.moreFeatures}>
                        +{module.features.length - 3} mais funcionalidades
                    </Text>
                )}
            </View>

            <View style={styles.moduleActions}>
                <TouchableOpacity
                    style={styles.detailsButton}
                    onPress={() => setSelectedModule(module)}
                >
                    <Text style={styles.detailsButtonText}>Ver Detalhes</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.purchaseButton, { backgroundColor: module.color }]}
                    onPress={() => handleModulePurchase(module)}
                >
                    <Text style={styles.purchaseButtonText}>Comprar</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    const renderPlanCard = (plan) => {
        const isCurrentPlan = subscriptionInfo.plan === plan.id;
        const simulation = simulateUpgrade(plan.id);

        return (
            <View
                key={plan.id}
                style={[
                    styles.planCard,
                    plan.popular && styles.popularPlan,
                    isCurrentPlan && styles.currentPlan
                ]}
            >
                {plan.popular && (
                    <View style={styles.popularBadge}>
                        <Text style={styles.popularText}>Mais Popular</Text>
                    </View>
                )}

                <Text style={styles.planName}>{plan.name}</Text>
                <Text style={styles.planPrice}>
                    €{plan.price}
                    <Text style={styles.planPriceUnit}>/mês</Text>
                </Text>

                <Text style={styles.planDescription}>{plan.description}</Text>

                <View style={styles.planFeatures}>
                    {plan.features.slice(0, 4).map((feature, index) => (
                        <Text key={index} style={styles.planFeature}>
                            ✓ {feature}
                        </Text>
                    ))}
                    {plan.features.length > 4 && (
                        <Text style={styles.morePlanFeatures}>
                            +{plan.features.length - 4} mais...
                        </Text>
                    )}
                </View>

                <View style={styles.planModules}>
                    <Text style={styles.planModulesTitle}>Módulos incluídos:</Text>
                    <View style={styles.modulesList}>
                        {plan.includedModules.map((moduleId, index) => {
                            const module = MODULE_CONFIG[moduleId];
                            return module ? (
                                <Text key={index} style={styles.includedModule}>
                                    {module.icon} {module.name}
                                </Text>
                            ) : null;
                        })}
                        {plan.moduleAllowance === 'unlimited' && (
                            <Text style={styles.includedModule}>
                                🎯 Todos os módulos
                            </Text>
                        )}
                        {typeof plan.moduleAllowance === 'number' && (
                            <Text style={styles.moduleAllowance}>
                                + {plan.moduleAllowance} módulo{plan.moduleAllowance > 1 ? 's' : ''} à escolha
                            </Text>
                        )}
                    </View>
                </View>

                <View style={styles.planAction}>
                    {isCurrentPlan ? (
                        <View style={styles.currentPlanButton}>
                            <Text style={styles.currentPlanButtonText}>Plano Atual</Text>
                        </View>
                    ) : (
                        <TouchableOpacity
                            style={styles.upgradePlanButton}
                            onPress={() => handlePlanUpgrade(plan)}
                        >
                            <Text style={styles.upgradePlanButtonText}>
                                {plan.price > currentCost ? 'Fazer Upgrade' : 'Alterar Plano'}
                            </Text>
                            {simulation && simulation.savings > 0 && (
                                <Text style={styles.savingsText}>
                                    Economize €{simulation.savings}/mês
                                </Text>
                            )}
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        );
    };

    const renderPurchaseModal = () => (
        <Modal
            visible={showPurchaseModal}
            animationType="slide"
            transparent={true}
            onRequestClose={() => setShowPurchaseModal(false)}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>
                            {purchaseType === 'module' ? 'Comprar Módulo' : 'Alterar Plano'}
                        </Text>
                        <TouchableOpacity
                            style={styles.modalCloseButton}
                            onPress={() => setShowPurchaseModal(false)}
                        >
                            <Text style={styles.modalCloseText}>✕</Text>
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.modalBody}>
                        {purchaseType === 'module' && selectedModule && (
                            <View>
                                <View style={styles.modalModuleHeader}>
                                    <Text style={styles.modalModuleIcon}>{selectedModule.icon}</Text>
                                    <Text style={styles.modalModuleName}>{selectedModule.name}</Text>
                                </View>

                                <Text style={styles.modalPrice}>
                                    €{selectedModule.price}/mês
                                </Text>

                                <Text style={styles.modalDescription}>
                                    {selectedModule.description}
                                </Text>

                                <View style={styles.modalFeatures}>
                                    <Text style={styles.modalFeaturesTitle}>Funcionalidades:</Text>
                                    {selectedModule.features.map((feature, index) => (
                                        <Text key={index} style={styles.modalFeature}>
                                            ✓ {feature}
                                        </Text>
                                    ))}
                                </View>

                                <View style={styles.modalLimits}>
                                    <Text style={styles.modalLimitsTitle}>Limites:</Text>
                                    {Object.entries(selectedModule.limits).map(([key, value]) => (
                                        <Text key={key} style={styles.modalLimit}>
                                            • {key}: {value}
                                        </Text>
                                    ))}
                                </View>
                            </View>
                        )}

                        {purchaseType === 'plan' && selectedPlan && (
                            <View>
                                <Text style={styles.modalPlanName}>{selectedPlan.name}</Text>
                                <Text style={styles.modalPrice}>
                                    €{selectedPlan.price}/mês
                                </Text>

                                <Text style={styles.modalDescription}>
                                    {selectedPlan.description}
                                </Text>

                                <View style={styles.modalFeatures}>
                                    <Text style={styles.modalFeaturesTitle}>Incluído no plano:</Text>
                                    {selectedPlan.features.map((feature, index) => (
                                        <Text key={index} style={styles.modalFeature}>
                                            ✓ {feature}
                                        </Text>
                                    ))}
                                </View>
                            </View>
                        )}
                    </ScrollView>

                    <View style={styles.modalActions}>
                        <TouchableOpacity
                            style={styles.modalCancelButton}
                            onPress={() => setShowPurchaseModal(false)}
                        >
                            <Text style={styles.modalCancelText}>Cancelar</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.modalConfirmButton}
                            onPress={confirmPurchase}
                        >
                            <Text style={styles.modalConfirmText}>
                                {purchaseType === 'module' ? 'Comprar' : 'Alterar'}
                            </Text>
                        </TouchableOpacity>
                    </View>
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
                <Text style={styles.headerTitle}>Marketplace</Text>
                <View style={styles.headerRight} />
            </View>

            {/* Current Subscription Info */}
            <View style={styles.subscriptionInfo}>
                <Text style={styles.subscriptionTitle}>Subscrição Atual</Text>
                <Text style={styles.subscriptionPlan}>
                    {subscriptionInfo.planInfo?.name || 'Nenhuma'}
                </Text>
                <Text style={styles.subscriptionCost}>
                    €{currentCost}/mês
                </Text>
            </View>

            {/* Tabs */}
            <View style={styles.tabsContainer}>
                <TouchableOpacity
                    style={[styles.tab, selectedTab === 'modules' && styles.tabActive]}
                    onPress={() => setSelectedTab('modules')}
                >
                    <Text style={[styles.tabText, selectedTab === 'modules' && styles.tabTextActive]}>
                        Módulos
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, selectedTab === 'plans' && styles.tabActive]}
                    onPress={() => setSelectedTab('plans')}
                >
                    <Text style={[styles.tabText, selectedTab === 'plans' && styles.tabTextActive]}>
                        Planos
                    </Text>
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {selectedTab === 'modules' && (
                    <View style={styles.modulesSection}>
                        {unlicensedModules.length > 0 ? (
                            <>
                                <Text style={styles.sectionTitle}>Módulos Disponíveis</Text>
                                <Text style={styles.sectionDescription}>
                                    Adicione funcionalidades especializadas à sua subscrição
                                </Text>
                                {unlicensedModules.map(renderModuleCard)}
                            </>
                        ) : (
                            <View style={styles.emptyState}>
                                <Text style={styles.emptyIcon}>🎉</Text>
                                <Text style={styles.emptyTitle}>Todos os módulos ativos!</Text>
                                <Text style={styles.emptyText}>
                                    Você já tem acesso a todos os módulos disponíveis.
                                </Text>
                            </View>
                        )}
                    </View>
                )}

                {selectedTab === 'plans' && (
                    <View style={styles.plansSection}>
                        <Text style={styles.sectionTitle}>Planos de Subscrição</Text>
                        <Text style={styles.sectionDescription}>
                            Escolha o plano que melhor se adapta às suas necessidades
                        </Text>
                        {Object.values(SUBSCRIPTION_PLANS).map(renderPlanCard)}
                    </View>
                )}
            </ScrollView>

            {renderPurchaseModal()}
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
    subscriptionInfo: {
        backgroundColor: '#fff',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        alignItems: 'center',
    },
    subscriptionTitle: {
        fontSize: 14,
        color: '#666',
        marginBottom: 5,
    },
    subscriptionPlan: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 5,
    },
    subscriptionCost: {
        fontSize: 16,
        color: '#1e88e5',
        fontWeight: '600',
    },
    tabsContainer: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    tab: {
        flex: 1,
        paddingVertical: 15,
        alignItems: 'center',
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
    },
    tabActive: {
        borderBottomColor: '#1e88e5',
    },
    tabText: {
        fontSize: 14,
        color: '#666',
        fontWeight: '500',
    },
    tabTextActive: {
        color: '#1e88e5',
        fontWeight: 'bold',
    },
    content: {
        flex: 1,
        padding: 20,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 10,
    },
    sectionDescription: {
        fontSize: 14,
        color: '#666',
        marginBottom: 20,
        lineHeight: 20,
    },
    modulesSection: {
        marginBottom: 20,
    },
    moduleCard: {
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
    },
    moduleHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
    },
    moduleIcon: {
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    moduleIconText: {
        fontSize: 20,
    },
    moduleInfo: {
        flex: 1,
    },
    moduleName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 5,
    },
    moduleDescription: {
        fontSize: 12,
        color: '#666',
        lineHeight: 16,
    },
    modulePrice: {
        alignItems: 'flex-end',
    },
    priceText: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    priceUnit: {
        fontSize: 12,
        color: '#666',
    },
    moduleFeatures: {
        marginBottom: 15,
    },
    featuresTitle: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 8,
    },
    featureItem: {
        fontSize: 11,
        color: '#666',
        marginBottom: 3,
        lineHeight: 16,
    },
    moreFeatures: {
        fontSize: 10,
        color: '#999',
        fontStyle: 'italic',
        marginTop: 5,
    },
    moduleActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    detailsButton: {
        flex: 1,
        backgroundColor: '#f5f5f5',
        paddingVertical: 10,
        borderRadius: 8,
        marginRight: 10,
        alignItems: 'center',
    },
    detailsButtonText: {
        fontSize: 12,
        color: '#666',
        fontWeight: '600',
    },
    purchaseButton: {
        flex: 1,
        paddingVertical: 10,
        borderRadius: 8,
        marginLeft: 10,
        alignItems: 'center',
    },
    purchaseButtonText: {
        fontSize: 12,
        color: '#fff',
        fontWeight: '600',
    },
    plansSection: {
        marginBottom: 20,
    },
    planCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 20,
        marginBottom: 15,
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
    currentPlan: {
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
    planName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 10,
        marginTop: 10,
    },
    planPrice: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1e88e5',
        marginBottom: 10,
    },
    planPriceUnit: {
        fontSize: 14,
        color: '#666',
    },
    planDescription: {
        fontSize: 12,
        color: '#666',
        marginBottom: 15,
        lineHeight: 16,
    },
    planFeatures: {
        marginBottom: 15,
    },
    planFeature: {
        fontSize: 12,
        color: '#333',
        marginBottom: 5,
        lineHeight: 18,
    },
    morePlanFeatures: {
        fontSize: 10,
        color: '#999',
        fontStyle: 'italic',
    },
    planModules: {
        marginBottom: 20,
    },
    planModulesTitle: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 8,
    },
    modulesList: {
        gap: 5,
    },
    includedModule: {
        fontSize: 11,
        color: '#666',
        lineHeight: 16,
    },
    moduleAllowance: {
        fontSize: 11,
        color: '#1e88e5',
        fontWeight: '600',
        lineHeight: 16,
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
    upgradePlanButton: {
        backgroundColor: '#1e88e5',
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    upgradePlanButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
    savingsText: {
        color: '#fff',
        fontSize: 10,
        marginTop: 2,
        opacity: 0.8,
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
    },
    emptyIcon: {
        fontSize: 60,
        marginBottom: 20,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 10,
    },
    emptyText: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        lineHeight: 20,
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
        maxHeight: 400,
    },
    modalModuleHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
    },
    modalModuleIcon: {
        fontSize: 30,
        marginRight: 15,
    },
    modalModuleName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        flex: 1,
    },
    modalPlanName: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        textAlign: 'center',
        marginBottom: 15,
    },
    modalPrice: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1e88e5',
        textAlign: 'center',
        marginBottom: 15,
    },
    modalDescription: {
        fontSize: 14,
        color: '#666',
        marginBottom: 20,
        lineHeight: 20,
    },
    modalFeatures: {
        marginBottom: 20,
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
    modalLimits: {
        marginBottom: 20,
    },
    modalLimitsTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 10,
    },
    modalLimit: {
        fontSize: 14,
        color: '#666',
        marginBottom: 5,
        lineHeight: 20,
    },
    modalActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderTopWidth: 1,
        borderTopColor: '#eee',
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
        backgroundColor: '#1e88e5',
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
