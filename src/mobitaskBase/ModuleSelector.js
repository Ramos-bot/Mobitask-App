import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
    Alert
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function ModuleSelector({ user, onModuleSelect, onBack }) {
    const [availableModules, setAvailableModules] = useState([]);
    const [userSubscription, setUserSubscription] = useState('basic');

    // Módulos disponíveis na plataforma
    const allModules = [
        {
            id: 'aqua',
            name: 'MobiTask Aqua',
            description: 'Gestão completa de piscinas e tratamento de água',
            icon: '🏊‍♂️',
            color: ['#4FC3F7', '#29B6F6'],
            requiredPlan: 'basic',
            isActive: true
        },
        {
            id: 'farm',
            name: 'MobiTask Farm',
            description: 'Gestão agrícola e monitoramento de cultivos',
            icon: '🌾',
            color: ['#66BB6A', '#4CAF50'],
            requiredPlan: 'pro',
            isActive: false // Ainda não implementado
        },
        {
            id: 'clean',
            name: 'MobiTask Clean',
            description: 'Gestão de serviços de limpeza e manutenção',
            icon: '🧽',
            color: ['#AB47BC', '#9C27B0'],
            requiredPlan: 'premium',
            isActive: false // Ainda não implementado
        }
    ];

    useEffect(() => {
        // Filtrar módulos baseado na assinatura do usuário
        filterModulesBySubscription();
    }, [userSubscription]);

    const filterModulesBySubscription = () => {
        const planHierarchy = {
            'basic': ['basic'],
            'pro': ['basic', 'pro'],
            'premium': ['basic', 'pro', 'premium']
        };

        const userAllowedPlans = planHierarchy[userSubscription] || ['basic'];
        const filtered = allModules.filter(module =>
            userAllowedPlans.includes(module.requiredPlan)
        );

        setAvailableModules(filtered);
    };

    const handleModuleSelect = (module) => {
        if (!module.isActive) {
            Alert.alert(
                'Módulo em Desenvolvimento',
                `${module.name} estará disponível em breve!`,
                [{ text: 'OK' }]
            );
            return;
        }

        if (module.requiredPlan === 'pro' && userSubscription === 'basic') {
            Alert.alert(
                'Upgrade Necessário',
                'Este módulo requer um plano Pro. Deseja fazer upgrade?',
                [
                    { text: 'Cancelar', style: 'cancel' },
                    { text: 'Upgrade', onPress: () => handleUpgrade() }
                ]
            );
            return;
        }

        if (module.requiredPlan === 'premium' && ['basic', 'pro'].includes(userSubscription)) {
            Alert.alert(
                'Upgrade Necessário',
                'Este módulo requer um plano Premium. Deseja fazer upgrade?',
                [
                    { text: 'Cancelar', style: 'cancel' },
                    { text: 'Upgrade', onPress: () => handleUpgrade() }
                ]
            );
            return;
        }

        onModuleSelect(module.id);
    };

    const handleUpgrade = () => {
        // Navegar para tela de assinatura
        Alert.alert('Info', 'Redirecionando para opções de upgrade...');
    };

    const getPlanBadgeColor = (plan) => {
        switch (plan) {
            case 'basic': return '#4CAF50';
            case 'pro': return '#FF9800';
            case 'premium': return '#9C27B0';
            default: return '#757575';
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={onBack} style={styles.backButton}>
                    <Text style={styles.backText}>← Voltar</Text>
                </TouchableOpacity>
                <Text style={styles.title}>Selecionar Módulo</Text>
                <Text style={styles.subtitle}>
                    Escolha o módulo que deseja acessar
                </Text>
            </View>

            <ScrollView style={styles.modulesList} showsVerticalScrollIndicator={false}>
                {availableModules.map((module) => (
                    <TouchableOpacity
                        key={module.id}
                        style={[
                            styles.moduleCard,
                            !module.isActive && styles.moduleCardDisabled
                        ]}
                        onPress={() => handleModuleSelect(module)}
                        activeOpacity={0.8}
                    >
                        <LinearGradient
                            colors={module.isActive ? module.color : ['#E0E0E0', '#BDBDBD']}
                            style={styles.moduleGradient}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                        >
                            <View style={styles.moduleContent}>
                                <View style={styles.moduleIcon}>
                                    <Text style={styles.iconText}>{module.icon}</Text>
                                </View>

                                <View style={styles.moduleInfo}>
                                    <Text style={styles.moduleName}>{module.name}</Text>
                                    <Text style={styles.moduleDescription}>
                                        {module.description}
                                    </Text>

                                    <View style={styles.planBadge}>
                                        <View style={[
                                            styles.planIndicator,
                                            { backgroundColor: getPlanBadgeColor(module.requiredPlan) }
                                        ]}>
                                            <Text style={styles.planText}>
                                                {module.requiredPlan.toUpperCase()}
                                            </Text>
                                        </View>

                                        {!module.isActive && (
                                            <View style={styles.comingSoonBadge}>
                                                <Text style={styles.comingSoonText}>
                                                    Em Breve
                                                </Text>
                                            </View>
                                        )}
                                    </View>
                                </View>

                                <View style={styles.moduleArrow}>
                                    <Text style={styles.arrowText}>→</Text>
                                </View>
                            </View>
                        </LinearGradient>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            <View style={styles.footer}>
                <Text style={styles.footerText}>
                    Plano atual: {userSubscription.toUpperCase()}
                </Text>
                <TouchableOpacity
                    style={styles.upgradeButton}
                    onPress={handleUpgrade}
                >
                    <Text style={styles.upgradeText}>Gerenciar Assinatura</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    header: {
        backgroundColor: '#2196F3',
        paddingTop: 60,
        paddingBottom: 30,
        paddingHorizontal: 20,
    },
    backButton: {
        marginBottom: 10,
    },
    backText: {
        color: 'white',
        fontSize: 16,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: 'white',
        marginBottom: 5,
    },
    subtitle: {
        fontSize: 16,
        color: 'rgba(255,255,255,0.9)',
    },
    modulesList: {
        flex: 1,
        padding: 20,
    },
    moduleCard: {
        marginBottom: 15,
        borderRadius: 15,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    moduleCardDisabled: {
        opacity: 0.7,
    },
    moduleGradient: {
        borderRadius: 15,
        padding: 20,
    },
    moduleContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    moduleIcon: {
        width: 60,
        height: 60,
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    iconText: {
        fontSize: 30,
    },
    moduleInfo: {
        flex: 1,
    },
    moduleName: {
        fontSize: 20,
        fontWeight: 'bold',
        color: 'white',
        marginBottom: 5,
    },
    moduleDescription: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.9)',
        marginBottom: 10,
    },
    planBadge: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    planIndicator: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        marginRight: 8,
    },
    planText: {
        color: 'white',
        fontSize: 10,
        fontWeight: 'bold',
    },
    comingSoonBadge: {
        backgroundColor: 'rgba(255,255,255,0.3)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    comingSoonText: {
        color: 'white',
        fontSize: 10,
        fontWeight: 'bold',
    },
    moduleArrow: {
        width: 30,
        height: 30,
        justifyContent: 'center',
        alignItems: 'center',
    },
    arrowText: {
        color: 'white',
        fontSize: 20,
        fontWeight: 'bold',
    },
    footer: {
        backgroundColor: 'white',
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: '#E0E0E0',
        alignItems: 'center',
    },
    footerText: {
        fontSize: 14,
        color: '#757575',
        marginBottom: 10,
    },
    upgradeButton: {
        backgroundColor: '#2196F3',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 25,
    },
    upgradeText: {
        color: 'white',
        fontSize: 14,
        fontWeight: 'bold',
    },
});
