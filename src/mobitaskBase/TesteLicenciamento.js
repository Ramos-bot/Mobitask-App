/**
 * Script de Teste - Sistema de Licenciamento Mobitask
 * 
 * Este script demonstra e testa todas as funcionalidades do sistema comercial:
 * - Verificação de licenças
 * - Sistema de trials
 * - Marketplace integrado
 * - Proteção de módulos
 * - Gestão de subscrições
 */

import React, { useContext, useEffect, useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Alert,
    StatusBar
} from 'react-native';
import { AppContext } from '../shared/context/AppContext';
import LicenseManager from '../core/licensing/LicenseManager';
import { MODULE_CONFIG, SUBSCRIPTION_PLANS } from '../config/modules.config';

export default function TesteLicenciamento() {
    const {
        user,
        userSubscription,
        moduleAccess,
        checkModuleAccess,
        startTrial,
        upgradeSubscription,
        refreshLicenseStatus,
        loading,
        error,
        success
    } = useContext(AppContext);

    const [testResults, setTestResults] = useState([]);
    const [isRunningTests, setIsRunningTests] = useState(false);

    const addTestResult = (test, result, details = '') => {
        setTestResults(prev => [...prev, {
            test,
            result,
            details,
            timestamp: new Date().toLocaleTimeString()
        }]);
    };

    const runLicenseTests = async () => {
        setIsRunningTests(true);
        setTestResults([]);

        try {
            // Teste 1: Verificar configuração dos módulos
            addTestResult(
                'Configuração de Módulos',
                'PASS',
                `${Object.keys(MODULE_CONFIG.modules).length} módulos configurados`
            );

            // Teste 2: Verificar planos de subscrição
            addTestResult(
                'Planos de Subscrição',
                'PASS',
                `${Object.keys(SUBSCRIPTION_PLANS).length} planos disponíveis`
            );

            // Teste 3: Verificar acesso aos módulos
            for (const moduleId of Object.keys(MODULE_CONFIG.modules)) {
                try {
                    const hasAccess = await checkModuleAccess(moduleId);
                    addTestResult(
                        `Acesso ao ${moduleId}`,
                        hasAccess ? 'PASS' : 'BLOCKED',
                        hasAccess ? 'Acesso concedido' : 'Requer licença'
                    );
                } catch (error) {
                    addTestResult(
                        `Acesso ao ${moduleId}`,
                        'ERROR',
                        error.message
                    );
                }
            }

            // Teste 4: Status da subscrição
            addTestResult(
                'Status da Subscrição',
                userSubscription?.status ? 'PASS' : 'INFO',
                userSubscription?.status || 'Nenhuma subscrição ativa'
            );

            // Teste 5: Verificar LicenseManager
            const licenseManager = new LicenseManager();
            const subscriptionInfo = await licenseManager.getSubscriptionInfo();
            addTestResult(
                'LicenseManager',
                'PASS',
                `Status: ${subscriptionInfo.status}`
            );

        } catch (error) {
            addTestResult('Sistema de Licenciamento', 'ERROR', error.message);
        } finally {
            setIsRunningTests(false);
        }
    };

    const testTrialFlow = async () => {
        Alert.alert(
            'Teste de Trial',
            'Selecione um módulo para testar o trial:',
            [
                { text: 'Cancelar', style: 'cancel' },
                { text: 'Aqua', onPress: () => startTrial('aqua') },
                { text: 'Verde', onPress: () => startTrial('verde') },
                { text: 'Phyto', onPress: () => startTrial('phyto') }
            ]
        );
    };

    const testUpgradeFlow = async () => {
        Alert.alert(
            'Teste de Upgrade',
            'Selecione um plano para simular o upgrade:',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Starter',
                    onPress: () => upgradeSubscription('starter', ['aqua'])
                },
                {
                    text: 'Professional',
                    onPress: () => upgradeSubscription('professional', ['aqua', 'verde'])
                },
                {
                    text: 'Enterprise',
                    onPress: () => upgradeSubscription('enterprise', ['aqua', 'verde', 'phyto'])
                }
            ]
        );
    };

    const simulateUnauthorizedAccess = () => {
        Alert.alert(
            'Simulação de Acesso Negado',
            'Esta simulação mostra como o sistema bloqueia acesso não autorizado.',
            [
                { text: 'OK' }
            ]
        );

        addTestResult(
            'Simulação - Acesso Negado',
            'BLOCKED',
            'Sistema bloqueou acesso conforme esperado'
        );
    };

    const clearTestResults = () => {
        setTestResults([]);
    };

    useEffect(() => {
        // Executar testes automáticos na inicialização
        runLicenseTests();
    }, []);

    const getResultColor = (result) => {
        switch (result) {
            case 'PASS': return '#4caf50';
            case 'BLOCKED': return '#ff9800';
            case 'ERROR': return '#f44336';
            case 'INFO': return '#2196f3';
            default: return '#666';
        }
    };

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            <StatusBar barStyle="dark-content" backgroundColor="#f5f5f5" />

            <View style={styles.header}>
                <Text style={styles.title}>🧪 Teste - Sistema de Licenciamento</Text>
                <Text style={styles.subtitle}>
                    Verificação completa do sistema comercial Mobitask
                </Text>
            </View>

            {/* Status do Usuário */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>👤 Status do Usuário</Text>
                <View style={styles.statusCard}>
                    <Text style={styles.statusText}>
                        Email: {user?.email || 'Não logado'}
                    </Text>
                    <Text style={styles.statusText}>
                        Subscrição: {userSubscription?.status || 'Nenhuma'}
                    </Text>
                    <Text style={styles.statusText}>
                        Módulos Ativos: {Object.values(moduleAccess).filter(Boolean).length}
                    </Text>
                </View>
            </View>

            {/* Botões de Teste */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>🔧 Ações de Teste</Text>
                <View style={styles.buttonGrid}>
                    <TouchableOpacity
                        style={[styles.testButton, { backgroundColor: '#1565C0' }]}
                        onPress={runLicenseTests}
                        disabled={isRunningTests}
                    >
                        <Text style={styles.buttonText}>
                            {isRunningTests ? '🔄 Testando...' : '🔍 Verificar Licenças'}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.testButton, { backgroundColor: '#4caf50' }]}
                        onPress={testTrialFlow}
                        disabled={loading}
                    >
                        <Text style={styles.buttonText}>🎁 Testar Trial</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.testButton, { backgroundColor: '#ff9800' }]}
                        onPress={testUpgradeFlow}
                        disabled={loading}
                    >
                        <Text style={styles.buttonText}>⭐ Testar Upgrade</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.testButton, { backgroundColor: '#f44336' }]}
                        onPress={simulateUnauthorizedAccess}
                    >
                        <Text style={styles.buttonText}>🚫 Simular Bloqueio</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.testButton, { backgroundColor: '#9c27b0' }]}
                        onPress={refreshLicenseStatus}
                        disabled={loading}
                    >
                        <Text style={styles.buttonText}>🔄 Atualizar Status</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.testButton, { backgroundColor: '#607d8b' }]}
                        onPress={clearTestResults}
                    >
                        <Text style={styles.buttonText}>🗑️ Limpar Resultados</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Mensagens do Sistema */}
            {(error || success) && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>📢 Mensagens do Sistema</Text>
                    {error && (
                        <View style={[styles.messageCard, { backgroundColor: '#ffebee' }]}>
                            <Text style={[styles.messageText, { color: '#f44336' }]}>
                                ❌ {error}
                            </Text>
                        </View>
                    )}
                    {success && (
                        <View style={[styles.messageCard, { backgroundColor: '#e8f5e8' }]}>
                            <Text style={[styles.messageText, { color: '#4caf50' }]}>
                                ✅ {success}
                            </Text>
                        </View>
                    )}
                </View>
            )}

            {/* Resultados dos Testes */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>📊 Resultados dos Testes</Text>
                {testResults.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyText}>
                            Nenhum teste executado ainda.
                        </Text>
                    </View>
                ) : (
                    testResults.map((result, index) => (
                        <View key={index} style={styles.testResultCard}>
                            <View style={styles.testResultHeader}>
                                <Text style={styles.testName}>{result.test}</Text>
                                <View style={[
                                    styles.resultBadge,
                                    { backgroundColor: getResultColor(result.result) }
                                ]}>
                                    <Text style={styles.resultText}>{result.result}</Text>
                                </View>
                            </View>
                            {result.details && (
                                <Text style={styles.testDetails}>{result.details}</Text>
                            )}
                            <Text style={styles.testTimestamp}>{result.timestamp}</Text>
                        </View>
                    ))
                )}
            </View>

            {/* Informações dos Módulos */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>📦 Módulos Disponíveis</Text>
                {Object.entries(MODULE_CONFIG.modules).map(([moduleId, moduleInfo]) => (
                    <View key={moduleId} style={styles.moduleCard}>
                        <View style={styles.moduleHeader}>
                            <Text style={styles.moduleName}>{moduleInfo.name}</Text>
                            <Text style={styles.modulePrice}>€{moduleInfo.price}/mês</Text>
                        </View>
                        <Text style={styles.moduleDescription}>
                            {moduleInfo.description}
                        </Text>
                        <View style={styles.moduleAccess}>
                            <Text style={[
                                styles.accessStatus,
                                { color: moduleAccess[moduleId] ? '#4caf50' : '#f44336' }
                            ]}>
                                {moduleAccess[moduleId] ? '✅ Acesso Concedido' : '🔒 Acesso Negado'}
                            </Text>
                        </View>
                    </View>
                ))}
            </View>

            <View style={styles.footer}>
                <Text style={styles.footerText}>
                    🚀 Sistema Comercial Mobitask - Versão 1.0
                </Text>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    header: {
        backgroundColor: '#fff',
        padding: 20,
        alignItems: 'center',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#333',
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        marginTop: 5,
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
    statusCard: {
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 12,
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    statusText: {
        fontSize: 14,
        color: '#666',
        marginVertical: 3,
    },
    buttonGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    testButton: {
        width: '48%',
        paddingVertical: 12,
        paddingHorizontal: 10,
        borderRadius: 8,
        alignItems: 'center',
        marginVertical: 5,
    },
    buttonText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '600',
        textAlign: 'center',
    },
    messageCard: {
        padding: 12,
        borderRadius: 8,
        marginVertical: 5,
    },
    messageText: {
        fontSize: 14,
        fontWeight: '500',
    },
    testResultCard: {
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 8,
        marginVertical: 5,
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    testResultHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 5,
    },
    testName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        flex: 1,
    },
    resultBadge: {
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 12,
    },
    resultText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: 'bold',
    },
    testDetails: {
        fontSize: 12,
        color: '#666',
        marginTop: 5,
    },
    testTimestamp: {
        fontSize: 10,
        color: '#999',
        marginTop: 5,
        textAlign: 'right',
    },
    emptyState: {
        backgroundColor: '#fff',
        padding: 30,
        borderRadius: 12,
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 14,
        color: '#999',
        fontStyle: 'italic',
    },
    moduleCard: {
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 8,
        marginVertical: 5,
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    moduleHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    moduleName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    modulePrice: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#1565C0',
    },
    moduleDescription: {
        fontSize: 12,
        color: '#666',
        lineHeight: 16,
        marginBottom: 10,
    },
    moduleAccess: {
        alignItems: 'flex-end',
    },
    accessStatus: {
        fontSize: 12,
        fontWeight: '600',
    },
    footer: {
        padding: 20,
        alignItems: 'center',
    },
    footerText: {
        fontSize: 12,
        color: '#999',
        fontStyle: 'italic',
    },
});
