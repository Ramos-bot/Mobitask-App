import React, { useState, useEffect } from 'react';
import {
    View, Text, ScrollView, TouchableOpacity, StyleSheet,
    Alert, StatusBar, Switch, Modal, ActivityIndicator
} from 'react-native';
import BackupManager from '../shared/services/BackupManager';

export default function BackupScreen({ user, onBack }) {
    const [stats, setStats] = useState({});
    const [backups, setBackups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [backupInProgress, setBackupInProgress] = useState(false);
    const [restoreInProgress, setRestoreInProgress] = useState(false);
    const [showFrequencyModal, setShowFrequencyModal] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const backupStats = BackupManager.getStats();
            const localBackups = await BackupManager.listLocalBackups();

            setStats(backupStats);
            setBackups(localBackups);
        } catch (error) {
            console.error('Erro ao carregar dados:', error);
            Alert.alert('Erro', 'Não foi possível carregar os dados de backup');
        } finally {
            setLoading(false);
        }
    };

    const handleManualBackup = async () => {
        try {
            setBackupInProgress(true);

            const result = await BackupManager.createManualBackup();

            Alert.alert(
                'Backup Concluído',
                `Backup criado com sucesso!\n\nRegistros: ${result.recordCount}\nTamanho: ${formatFileSize(result.size)}`,
                [
                    { text: 'OK' },
                    {
                        text: 'Exportar',
                        onPress: () => handleExportBackup(result.filePath)
                    }
                ]
            );

            await loadData();
        } catch (error) {
            Alert.alert('Erro', 'Não foi possível criar o backup: ' + error.message);
        } finally {
            setBackupInProgress(false);
        }
    };

    const handleExportBackup = async (backupPath) => {
        try {
            await BackupManager.exportBackup(backupPath);
        } catch (error) {
            Alert.alert('Erro', 'Não foi possível exportar o backup: ' + error.message);
        }
    };

    const handleImportBackup = async () => {
        Alert.alert(
            'Importar Backup',
            'Esta ação irá substituir todos os dados atuais. Deseja continuar?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Continuar',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            setRestoreInProgress(true);

                            const result = await BackupManager.importBackup();

                            if (result) {
                                Alert.alert(
                                    'Restauração Concluída',
                                    `Dados restaurados com sucesso!\n\nRegistros: ${result.restoredRecords}\nData do backup: ${result.backupDate.toLocaleDateString('pt-PT')}`
                                );
                                await loadData();
                            }
                        } catch (error) {
                            Alert.alert('Erro', 'Não foi possível importar o backup: ' + error.message);
                        } finally {
                            setRestoreInProgress(false);
                        }
                    }
                }
            ]
        );
    };

    const handleRestoreLocal = async (backup) => {
        Alert.alert(
            'Restaurar Backup',
            `Restaurar backup de ${backup.modificationTime.toLocaleDateString('pt-PT')}?\n\nEsta ação irá substituir todos os dados atuais.`,
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Restaurar',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            setRestoreInProgress(true);

                            const backupContent = await FileSystem.readAsStringAsync(backup.path);
                            const backupData = JSON.parse(backupContent);

                            const result = await BackupManager.restoreFromBackup(backupData);

                            Alert.alert(
                                'Restauração Concluída',
                                `Dados restaurados com sucesso!\n\nRegistros: ${result.restoredRecords}`
                            );

                            await loadData();
                        } catch (error) {
                            Alert.alert('Erro', 'Não foi possível restaurar o backup: ' + error.message);
                        } finally {
                            setRestoreInProgress(false);
                        }
                    }
                }
            ]
        );
    };

    const handleDeleteBackup = async (backup) => {
        Alert.alert(
            'Remover Backup',
            `Remover backup de ${backup.modificationTime.toLocaleDateString('pt-PT')}?`,
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Remover',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await FileSystem.deleteAsync(backup.path);
                            await loadData();
                        } catch (error) {
                            Alert.alert('Erro', 'Não foi possível remover o backup');
                        }
                    }
                }
            ]
        );
    };

    const handleToggleAutoBackup = async (enabled) => {
        try {
            await BackupManager.setAutoBackup(enabled, stats.backupFrequency);
            await loadData();
        } catch (error) {
            Alert.alert('Erro', 'Não foi possível alterar a configuração');
        }
    };

    const handleChangeFrequency = async (frequency) => {
        try {
            await BackupManager.setAutoBackup(stats.autoBackupEnabled, frequency);
            setShowFrequencyModal(false);
            await loadData();
        } catch (error) {
            Alert.alert('Erro', 'Não foi possível alterar a frequência');
        }
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const getFrequencyText = (frequency) => {
        const texts = {
            daily: 'Diário',
            weekly: 'Semanal',
            monthly: 'Mensal'
        };
        return texts[frequency] || frequency;
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#1e88e5" />
                <Text style={styles.loadingText}>Carregando dados de backup...</Text>
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
                <Text style={styles.headerTitle}>Backup e Sincronização</Text>
                <View style={styles.placeholder} />
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Status */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Estado Atual</Text>
                    <View style={styles.statusCard}>
                        <View style={styles.statusRow}>
                            <Text style={styles.statusLabel}>Último Backup:</Text>
                            <Text style={styles.statusValue}>
                                {stats.lastBackupDate
                                    ? stats.lastBackupDate.toLocaleDateString('pt-PT') + ' às ' + stats.lastBackupDate.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })
                                    : 'Nunca'
                                }
                            </Text>
                        </View>
                        <View style={styles.statusRow}>
                            <Text style={styles.statusLabel}>Backup Automático:</Text>
                            <Text style={[
                                styles.statusValue,
                                { color: stats.autoBackupEnabled ? '#4caf50' : '#f44336' }
                            ]}>
                                {stats.autoBackupEnabled ? 'Ativo' : 'Inativo'}
                            </Text>
                        </View>
                        <View style={styles.statusRow}>
                            <Text style={styles.statusLabel}>Frequência:</Text>
                            <Text style={styles.statusValue}>
                                {getFrequencyText(stats.backupFrequency)}
                            </Text>
                        </View>
                        <View style={styles.statusRow}>
                            <Text style={styles.statusLabel}>Backups Locais:</Text>
                            <Text style={styles.statusValue}>{backups.length}</Text>
                        </View>
                    </View>
                </View>

                {/* Configurações */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Configurações</Text>
                    <View style={styles.settingsCard}>
                        <View style={styles.settingRow}>
                            <View style={styles.settingInfo}>
                                <Text style={styles.settingTitle}>Backup Automático</Text>
                                <Text style={styles.settingDescription}>
                                    Criar backups automaticamente
                                </Text>
                            </View>
                            <Switch
                                value={stats.autoBackupEnabled}
                                onValueChange={handleToggleAutoBackup}
                                trackColor={{ false: '#e0e0e0', true: '#1e88e5' }}
                                thumbColor={stats.autoBackupEnabled ? '#fff' : '#f4f3f4'}
                            />
                        </View>

                        <TouchableOpacity
                            style={styles.settingRow}
                            onPress={() => setShowFrequencyModal(true)}
                            disabled={!stats.autoBackupEnabled}
                        >
                            <View style={styles.settingInfo}>
                                <Text style={[
                                    styles.settingTitle,
                                    !stats.autoBackupEnabled && styles.settingDisabled
                                ]}>
                                    Frequência
                                </Text>
                                <Text style={[
                                    styles.settingDescription,
                                    !stats.autoBackupEnabled && styles.settingDisabled
                                ]}>
                                    {getFrequencyText(stats.backupFrequency)}
                                </Text>
                            </View>
                            <Text style={[
                                styles.settingArrow,
                                !stats.autoBackupEnabled && styles.settingDisabled
                            ]}>
                                ›
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Ações */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Ações</Text>
                    <View style={styles.actionsCard}>
                        <TouchableOpacity
                            style={styles.actionButton}
                            onPress={handleManualBackup}
                            disabled={backupInProgress}
                        >
                            <Text style={styles.actionIcon}>💾</Text>
                            <View style={styles.actionInfo}>
                                <Text style={styles.actionTitle}>Criar Backup Agora</Text>
                                <Text style={styles.actionDescription}>
                                    Fazer backup manual de todos os dados
                                </Text>
                            </View>
                            {backupInProgress ? (
                                <ActivityIndicator size="small" color="#1e88e5" />
                            ) : (
                                <Text style={styles.actionArrow}>›</Text>
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.actionButton}
                            onPress={handleImportBackup}
                            disabled={restoreInProgress}
                        >
                            <Text style={styles.actionIcon}>📥</Text>
                            <View style={styles.actionInfo}>
                                <Text style={styles.actionTitle}>Importar Backup</Text>
                                <Text style={styles.actionDescription}>
                                    Restaurar dados de um ficheiro de backup
                                </Text>
                            </View>
                            {restoreInProgress ? (
                                <ActivityIndicator size="small" color="#1e88e5" />
                            ) : (
                                <Text style={styles.actionArrow}>›</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Backups Locais */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Backups Locais ({backups.length})</Text>
                    {backups.length > 0 ? (
                        <View style={styles.backupsCard}>
                            {backups.map((backup, index) => (
                                <View key={backup.filename} style={styles.backupItem}>
                                    <View style={styles.backupIcon}>
                                        <Text style={styles.backupIconText}>
                                            {backup.isAutomatic ? '🤖' : '👤'}
                                        </Text>
                                    </View>
                                    <View style={styles.backupInfo}>
                                        <Text style={styles.backupDate}>
                                            {backup.modificationTime.toLocaleDateString('pt-PT')} às{' '}
                                            {backup.modificationTime.toLocaleTimeString('pt-PT', {
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </Text>
                                        <Text style={styles.backupDetails}>
                                            {backup.isAutomatic ? 'Automático' : 'Manual'} • {formatFileSize(backup.size)}
                                        </Text>
                                    </View>
                                    <View style={styles.backupActions}>
                                        <TouchableOpacity
                                            style={styles.backupActionButton}
                                            onPress={() => handleRestoreLocal(backup)}
                                        >
                                            <Text style={styles.backupActionText}>Restaurar</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={styles.backupActionButton}
                                            onPress={() => handleExportBackup(backup.path)}
                                        >
                                            <Text style={styles.backupActionText}>Exportar</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={[styles.backupActionButton, styles.deleteButton]}
                                            onPress={() => handleDeleteBackup(backup)}
                                        >
                                            <Text style={[styles.backupActionText, styles.deleteText]}>
                                                Remover
                                            </Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            ))}
                        </View>
                    ) : (
                        <View style={styles.emptyCard}>
                            <Text style={styles.emptyIcon}>📁</Text>
                            <Text style={styles.emptyTitle}>Nenhum backup local</Text>
                            <Text style={styles.emptyDescription}>
                                Crie um backup manual ou ative o backup automático
                            </Text>
                        </View>
                    )}
                </View>

                {/* Info */}
                <View style={styles.infoCard}>
                    <Text style={styles.infoText}>
                        Os backups incluem dados de clientes, análises, tarefas e configurações.
                        Os dados são criptografados localmente e podem ser exportados para partilha segura.
                    </Text>
                </View>
            </ScrollView>

            {/* Modal de Frequência */}
            <Modal
                visible={showFrequencyModal}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setShowFrequencyModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Frequência do Backup</Text>

                        {['daily', 'weekly', 'monthly'].map(frequency => (
                            <TouchableOpacity
                                key={frequency}
                                style={styles.modalOption}
                                onPress={() => handleChangeFrequency(frequency)}
                            >
                                <Text style={styles.modalOptionText}>
                                    {getFrequencyText(frequency)}
                                </Text>
                                {stats.backupFrequency === frequency && (
                                    <Text style={styles.modalCheck}>✓</Text>
                                )}
                            </TouchableOpacity>
                        ))}

                        <TouchableOpacity
                            style={styles.modalCancel}
                            onPress={() => setShowFrequencyModal(false)}
                        >
                            <Text style={styles.modalCancelText}>Cancelar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
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
        marginTop: 15,
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
    statusCard: {
        backgroundColor: '#fff',
        marginHorizontal: 20,
        borderRadius: 12,
        padding: 20,
    },
    statusRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    statusLabel: {
        fontSize: 14,
        color: '#666',
        fontWeight: '500',
    },
    statusValue: {
        fontSize: 14,
        color: '#333',
        fontWeight: '600',
    },
    settingsCard: {
        backgroundColor: '#fff',
        marginHorizontal: 20,
        borderRadius: 12,
    },
    settingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
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
    settingDescription: {
        fontSize: 12,
        color: '#666',
    },
    settingDisabled: {
        opacity: 0.5,
    },
    settingArrow: {
        fontSize: 18,
        color: '#ccc',
        fontWeight: 'bold',
    },
    actionsCard: {
        backgroundColor: '#fff',
        marginHorizontal: 20,
        borderRadius: 12,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    actionIcon: {
        fontSize: 24,
        marginRight: 15,
    },
    actionInfo: {
        flex: 1,
        marginRight: 15,
    },
    actionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 3,
    },
    actionDescription: {
        fontSize: 12,
        color: '#666',
    },
    actionArrow: {
        fontSize: 18,
        color: '#ccc',
        fontWeight: 'bold',
    },
    backupsCard: {
        backgroundColor: '#fff',
        marginHorizontal: 20,
        borderRadius: 12,
    },
    backupItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    backupIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#f5f5f5',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    backupIconText: {
        fontSize: 18,
    },
    backupInfo: {
        flex: 1,
        marginRight: 15,
    },
    backupDate: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginBottom: 3,
    },
    backupDetails: {
        fontSize: 12,
        color: '#666',
    },
    backupActions: {
        flexDirection: 'row',
        gap: 8,
    },
    backupActionButton: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        backgroundColor: '#f0f0f0',
        borderRadius: 6,
    },
    backupActionText: {
        fontSize: 12,
        color: '#333',
        fontWeight: '600',
    },
    deleteButton: {
        backgroundColor: '#ffebee',
    },
    deleteText: {
        color: '#f44336',
    },
    emptyCard: {
        backgroundColor: '#fff',
        marginHorizontal: 20,
        borderRadius: 12,
        padding: 40,
        alignItems: 'center',
    },
    emptyIcon: {
        fontSize: 48,
        marginBottom: 15,
    },
    emptyTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 8,
    },
    emptyDescription: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
    },
    infoCard: {
        backgroundColor: '#e3f2fd',
        marginHorizontal: 20,
        marginBottom: 20,
        borderRadius: 12,
        padding: 15,
    },
    infoText: {
        fontSize: 12,
        color: '#1565c0',
        textAlign: 'center',
        lineHeight: 18,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 20,
        minWidth: 250,
        maxWidth: 300,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        textAlign: 'center',
        marginBottom: 20,
    },
    modalOption: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    modalOptionText: {
        fontSize: 16,
        color: '#333',
    },
    modalCheck: {
        fontSize: 16,
        color: '#4caf50',
        fontWeight: 'bold',
    },
    modalCancel: {
        alignItems: 'center',
        paddingVertical: 15,
        marginTop: 10,
    },
    modalCancelText: {
        fontSize: 16,
        color: '#666',
        fontWeight: '600',
    },
});
