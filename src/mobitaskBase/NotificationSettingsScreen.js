import React, { useState, useEffect } from 'react';
import {
    View, Text, ScrollView, TouchableOpacity, StyleSheet,
    Switch, Alert, StatusBar
} from 'react-native';
import NotificationManager from '../shared/services/NotificationManager';

export default function NotificationSettingsScreen({ user, onBack }) {
    const [settings, setSettings] = useState({
        enabled: true,
        sound: true,
        vibration: true,
        badge: true,
        types: {
            system: true,
            client: true,
            analysis: true,
            tasks: true,
            alerts: true
        },
        quiet_hours: {
            enabled: false,
            start: '22:00',
            end: '08:00'
        }
    });

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            const currentSettings = NotificationManager.getSettings();
            setSettings(currentSettings);
        } catch (error) {
            console.error('Erro ao carregar configurações:', error);
        } finally {
            setLoading(false);
        }
    };

    const updateSetting = async (key, value) => {
        try {
            const newSettings = { ...settings };

            if (key.includes('.')) {
                const [parent, child] = key.split('.');
                newSettings[parent][child] = value;
            } else {
                newSettings[key] = value;
            }

            setSettings(newSettings);
            await NotificationManager.saveSettings(newSettings);

            // Se desabilitar notificações, cancelar todas as agendadas
            if (key === 'enabled' && !value) {
                Alert.alert(
                    'Notificações Desabilitadas',
                    'Todas as notificações agendadas foram canceladas',
                    [
                        {
                            text: 'OK',
                            onPress: () => NotificationManager.cancelAllNotifications()
                        }
                    ]
                );
            }

        } catch (error) {
            Alert.alert('Erro', 'Não foi possível salvar as configurações');
            console.error('Erro ao salvar configurações:', error);
        }
    };

    const handleTestNotification = async () => {
        try {
            await NotificationManager.sendImmediateNotification({
                title: '🧪 Teste de Notificação',
                body: 'Esta é uma notificação de teste do Mobitask',
                data: { type: 'system' },
                priority: 'medium'
            });
            Alert.alert('Sucesso', 'Notificação de teste enviada!');
        } catch (error) {
            Alert.alert('Erro', 'Não foi possível enviar a notificação de teste');
        }
    };

    const renderSettingItem = ({ title, description, value, onValueChange, disabled = false }) => (
        <View style={[styles.settingItem, disabled && styles.settingItemDisabled]}>
            <View style={styles.settingInfo}>
                <Text style={[styles.settingTitle, disabled && styles.settingTitleDisabled]}>
                    {title}
                </Text>
                {description && (
                    <Text style={[styles.settingDescription, disabled && styles.settingDescriptionDisabled]}>
                        {description}
                    </Text>
                )}
            </View>
            <Switch
                value={value}
                onValueChange={onValueChange}
                disabled={disabled}
                trackColor={{ false: '#e0e0e0', true: '#1e88e5' }}
                thumbColor={value ? '#fff' : '#f4f3f4'}
            />
        </View>
    );

    const renderTypeItem = ({ type, title, icon, description }) => (
        <View key={type} style={styles.typeItem}>
            <View style={styles.typeIcon}>
                <Text style={styles.typeIconText}>{icon}</Text>
            </View>
            <View style={styles.typeInfo}>
                <Text style={styles.typeTitle}>{title}</Text>
                <Text style={styles.typeDescription}>{description}</Text>
            </View>
            <Switch
                value={settings.types[type]}
                onValueChange={(value) => updateSetting(`types.${type}`, value)}
                disabled={!settings.enabled}
                trackColor={{ false: '#e0e0e0', true: '#1e88e5' }}
                thumbColor={settings.types[type] ? '#fff' : '#f4f3f4'}
            />
        </View>
    );

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Carregando configurações...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#1565C0" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={onBack}>
                    <Text style={styles.backIcon}>‹</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Configurações de Notificações</Text>
                <View style={styles.placeholder} />
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Configurações Gerais */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Geral</Text>
                    <View style={styles.sectionContent}>
                        {renderSettingItem({
                            title: 'Ativar Notificações',
                            description: 'Receber notificações do Mobitask',
                            value: settings.enabled,
                            onValueChange: (value) => updateSetting('enabled', value)
                        })}

                        {renderSettingItem({
                            title: 'Som',
                            description: 'Reproduzir som ao receber notificações',
                            value: settings.sound,
                            onValueChange: (value) => updateSetting('sound', value),
                            disabled: !settings.enabled
                        })}

                        {renderSettingItem({
                            title: 'Vibração',
                            description: 'Vibrar ao receber notificações',
                            value: settings.vibration,
                            onValueChange: (value) => updateSetting('vibration', value),
                            disabled: !settings.enabled
                        })}

                        {renderSettingItem({
                            title: 'Badge no Ícone',
                            description: 'Mostrar contador no ícone da app',
                            value: settings.badge,
                            onValueChange: (value) => updateSetting('badge', value),
                            disabled: !settings.enabled
                        })}
                    </View>
                </View>

                {/* Tipos de Notificação */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Tipos de Notificação</Text>
                    <View style={styles.sectionContent}>
                        {renderTypeItem({
                            type: 'system',
                            title: 'Sistema',
                            icon: '⚙️',
                            description: 'Atualizações, backups e manutenção'
                        })}

                        {renderTypeItem({
                            type: 'client',
                            title: 'Clientes',
                            icon: '👤',
                            description: 'Novos clientes e alterações'
                        })}

                        {renderTypeItem({
                            type: 'analysis',
                            title: 'Análises',
                            icon: '🧪',
                            description: 'Resultados de análises concluídas'
                        })}

                        {renderTypeItem({
                            type: 'tasks',
                            title: 'Tarefas',
                            icon: '📋',
                            description: 'Lembretes e tarefas pendentes'
                        })}

                        {renderTypeItem({
                            type: 'alerts',
                            title: 'Alertas',
                            icon: '⚠️',
                            description: 'Alertas críticos e urgentes'
                        })}
                    </View>
                </View>

                {/* Horário Silencioso */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Horário Silencioso</Text>
                    <View style={styles.sectionContent}>
                        {renderSettingItem({
                            title: 'Ativar Horário Silencioso',
                            description: 'Silenciar notificações durante determinadas horas',
                            value: settings.quiet_hours?.enabled || false,
                            onValueChange: (value) => updateSetting('quiet_hours.enabled', value),
                            disabled: !settings.enabled
                        })}

                        {settings.quiet_hours?.enabled && (
                            <View style={styles.quietHoursContainer}>
                                <Text style={styles.quietHoursText}>
                                    Das {settings.quiet_hours.start} às {settings.quiet_hours.end}
                                </Text>
                                <TouchableOpacity
                                    style={styles.quietHoursButton}
                                    onPress={() => Alert.alert('Em breve', 'Configuração de horários em desenvolvimento')}
                                >
                                    <Text style={styles.quietHoursButtonText}>Alterar Horários</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                </View>

                {/* Ações */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Ações</Text>
                    <View style={styles.sectionContent}>
                        <TouchableOpacity
                            style={styles.actionButton}
                            onPress={handleTestNotification}
                            disabled={!settings.enabled}
                        >
                            <Text style={styles.actionButtonIcon}>🧪</Text>
                            <View style={styles.actionButtonInfo}>
                                <Text style={styles.actionButtonTitle}>Enviar Teste</Text>
                                <Text style={styles.actionButtonDescription}>
                                    Enviar uma notificação de teste
                                </Text>
                            </View>
                            <Text style={styles.actionButtonArrow}>›</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.actionButton}
                            onPress={() => {
                                Alert.alert(
                                    'Limpar Notificações',
                                    'Cancelar todas as notificações agendadas?',
                                    [
                                        { text: 'Cancelar', style: 'cancel' },
                                        {
                                            text: 'Confirmar',
                                            style: 'destructive',
                                            onPress: () => {
                                                NotificationManager.cancelAllNotifications();
                                                Alert.alert('Sucesso', 'Notificações canceladas');
                                            }
                                        }
                                    ]
                                );
                            }}
                        >
                            <Text style={styles.actionButtonIcon}>🗑️</Text>
                            <View style={styles.actionButtonInfo}>
                                <Text style={styles.actionButtonTitle}>Limpar Agendadas</Text>
                                <Text style={styles.actionButtonDescription}>
                                    Cancelar todas as notificações agendadas
                                </Text>
                            </View>
                            <Text style={styles.actionButtonArrow}>›</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Info */}
                <View style={styles.infoSection}>
                    <Text style={styles.infoText}>
                        As configurações de notificação são salvas localmente no seu dispositivo.
                        Algumas configurações podem requerer reinicialização da aplicação.
                    </Text>
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
    placeholder: {
        width: 40,
    },
    content: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f8f9fa',
    },
    loadingText: {
        fontSize: 16,
        color: '#666',
    },
    section: {
        marginBottom: 25,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        paddingHorizontal: 20,
        marginBottom: 10,
    },
    sectionContent: {
        backgroundColor: '#fff',
    },
    settingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    settingItemDisabled: {
        opacity: 0.5,
    },
    settingInfo: {
        flex: 1,
        marginRight: 15,
    },
    settingTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 3,
    },
    settingTitleDisabled: {
        color: '#999',
    },
    settingDescription: {
        fontSize: 12,
        color: '#666',
    },
    settingDescriptionDisabled: {
        color: '#999',
    },
    typeItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    typeIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#f5f5f5',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    typeIconText: {
        fontSize: 18,
    },
    typeInfo: {
        flex: 1,
        marginRight: 15,
    },
    typeTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 3,
    },
    typeDescription: {
        fontSize: 12,
        color: '#666',
    },
    quietHoursContainer: {
        paddingHorizontal: 20,
        paddingVertical: 15,
        backgroundColor: '#f8f9fa',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    quietHoursText: {
        fontSize: 14,
        color: '#666',
    },
    quietHoursButton: {
        backgroundColor: '#1e88e5',
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 6,
    },
    quietHoursButtonText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '600',
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    actionButtonIcon: {
        fontSize: 20,
        marginRight: 15,
    },
    actionButtonInfo: {
        flex: 1,
        marginRight: 15,
    },
    actionButtonTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 3,
    },
    actionButtonDescription: {
        fontSize: 12,
        color: '#666',
    },
    actionButtonArrow: {
        fontSize: 18,
        color: '#ccc',
        fontWeight: 'bold',
    },
    infoSection: {
        paddingHorizontal: 20,
        paddingVertical: 20,
    },
    infoText: {
        fontSize: 12,
        color: '#999',
        textAlign: 'center',
        lineHeight: 18,
    },
});
