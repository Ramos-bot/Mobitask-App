import React, { useContext, useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { AppContext } from '../context/AppContext';
import { MODULE_CONFIG } from '../../config/modules.config';

/**
 * Componente para proteger acesso a módulos baseado em licenças
 * Verifica se o usuário tem acesso ao módulo antes de renderizar o conteúdo
 */
export default function ModuleProtection({
    moduleId,
    children,
    fallbackComponent = null,
    showTrialOption = true,
    customMessage = null
}) {
    const {
        moduleAccess,
        userSubscription,
        checkModuleAccess,
        startTrial,
        loading
    } = useContext(AppContext);

    const [hasAccess, setHasAccess] = useState(false);
    const [checking, setChecking] = useState(true);

    const moduleInfo = MODULE_CONFIG.modules[moduleId];

    useEffect(() => {
        verifyAccess();
    }, [moduleId, moduleAccess]);

    const verifyAccess = async () => {
        try {
            setChecking(true);

            // Verificar primeiro no estado local
            if (moduleAccess[moduleId]) {
                setHasAccess(true);
                setChecking(false);
                return;
            }

            // Verificar com o LicenseManager
            const access = await checkModuleAccess(moduleId);
            setHasAccess(access);
        } catch (error) {
            console.error('Erro ao verificar acesso ao módulo:', error);
            setHasAccess(false);
        } finally {
            setChecking(false);
        }
    };

    const handleStartTrial = () => {
        Alert.alert(
            'Iniciar Trial Gratuito',
            `Deseja iniciar um trial gratuito de 7 dias para o ${moduleInfo?.name}?`,
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Iniciar Trial',
                    onPress: () => startTrial(moduleId)
                }
            ]
        );
    };

    const handleUpgrade = () => {
        Alert.alert(
            'Atualizar Subscrição',
            `Para acessar o ${moduleInfo?.name}, você precisa de uma subscrição ativa.`,
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Ver Planos',
                    onPress: () => {
                        // Navegar para marketplace ou subscrições
                        console.log('Navegar para planos');
                    }
                }
            ]
        );
    };

    // Se ainda está verificando
    if (checking) {
        return (
            <View style={styles.container}>
                <Text style={styles.loadingText}>Verificando acesso...</Text>
            </View>
        );
    }

    // Se tem acesso, renderizar o conteúdo
    if (hasAccess) {
        return children;
    }

    // Se não tem acesso, renderizar fallback personalizado
    if (fallbackComponent) {
        return fallbackComponent;
    }

    // Renderizar tela padrão de sem acesso
    return (
        <View style={styles.noAccessContainer}>
            <View style={styles.lockIcon}>
                <Text style={styles.lockEmoji}>🔒</Text>
            </View>

            <Text style={styles.noAccessTitle}>
                {moduleInfo?.name || 'Módulo Protegido'}
            </Text>

            <Text style={styles.noAccessMessage}>
                {customMessage || `Este módulo requer uma subscrição ativa. 
                Escolha uma das opções abaixo para continuar.`}
            </Text>

            <View style={styles.optionsContainer}>
                {showTrialOption && (
                    <TouchableOpacity
                        style={[styles.button, styles.trialButton]}
                        onPress={handleStartTrial}
                        disabled={loading}
                    >
                        <Text style={styles.trialButtonText}>
                            🎁 Trial Gratuito (7 dias)
                        </Text>
                    </TouchableOpacity>
                )}

                <TouchableOpacity
                    style={[styles.button, styles.upgradeButton]}
                    onPress={handleUpgrade}
                    disabled={loading}
                >
                    <Text style={styles.upgradeButtonText}>
                        ⭐ Ver Planos de Subscrição
                    </Text>
                </TouchableOpacity>
            </View>

            {moduleInfo && (
                <View style={styles.moduleInfoContainer}>
                    <Text style={styles.moduleInfoTitle}>Sobre este módulo:</Text>
                    <Text style={styles.moduleInfoDescription}>
                        {moduleInfo.description}
                    </Text>
                    <Text style={styles.modulePrice}>
                        A partir de €{moduleInfo.price}/mês
                    </Text>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    loadingText: {
        fontSize: 16,
        color: '#666',
    },
    noAccessContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#f5f5f5',
    },
    lockIcon: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    lockEmoji: {
        fontSize: 40,
    },
    noAccessTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 10,
        textAlign: 'center',
    },
    noAccessMessage: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginBottom: 30,
        lineHeight: 24,
    },
    optionsContainer: {
        width: '100%',
        maxWidth: 300,
    },
    button: {
        paddingVertical: 15,
        paddingHorizontal: 20,
        borderRadius: 12,
        marginVertical: 8,
        alignItems: 'center',
    },
    trialButton: {
        backgroundColor: '#4caf50',
    },
    trialButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    upgradeButton: {
        backgroundColor: '#1565C0',
    },
    upgradeButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    moduleInfoContainer: {
        marginTop: 30,
        padding: 20,
        backgroundColor: '#fff',
        borderRadius: 12,
        width: '100%',
        maxWidth: 300,
    },
    moduleInfoTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 8,
    },
    moduleInfoDescription: {
        fontSize: 14,
        color: '#666',
        lineHeight: 20,
        marginBottom: 12,
    },
    modulePrice: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1565C0',
        textAlign: 'center',
    },
});
