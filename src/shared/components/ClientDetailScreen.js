import React, { useState, useEffect } from 'react';
import {
    View, Text, ScrollView, TouchableOpacity, StyleSheet,
    Alert, StatusBar, Dimensions
} from 'react-native';
import { useApp } from '../context/AppContext';

const { width } = Dimensions.get('window');

export default function ClientDetailScreen({ clientId, onBack }) {
    const {
        dataManager,
        getAssetsByClient,
        getAnalysesByClient,
        getTasksByClient
    } = useApp();

    const [client, setClient] = useState(null);
    const [selectedModule, setSelectedModule] = useState('overview');
    const [moduleData, setModuleData] = useState({
        aqua: { assets: [], analyses: [], tasks: [] },
        verde: { assets: [], analyses: [], tasks: [] },
        phyto: { assets: [], analyses: [], tasks: [] }
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadClientData();
    }, [clientId]);

    const loadClientData = async () => {
        try {
            setLoading(true);

            // Carregar dados do cliente
            const clientData = await dataManager.getClientById(clientId);
            setClient(clientData);

            // Carregar dados de cada módulo ativo
            if (clientData) {
                const modules = ['aqua', 'verde', 'phyto'];
                const modulePromises = modules.map(async (module) => {
                    if (clientData.services[module]?.active) {
                        const [assets, analyses, tasks] = await Promise.all([
                            getAssetsByClient(clientId, module),
                            getAnalysesByClient(clientId, module),
                            getTasksByClient(clientId, module)
                        ]);

                        return { module, assets, analyses, tasks };
                    }
                    return { module, assets: [], analyses: [], tasks: [] };
                });

                const results = await Promise.all(modulePromises);
                const newModuleData = {};

                results.forEach(({ module, assets, analyses, tasks }) => {
                    newModuleData[module] = { assets, analyses, tasks };
                });

                setModuleData(newModuleData);
            }
        } catch (error) {
            Alert.alert('Erro', 'Não foi possível carregar os dados do cliente');
        } finally {
            setLoading(false);
        }
    };

    const getModuleConfig = (module) => {
        const configs = {
            aqua: {
                name: 'Piscinas',
                icon: '💧',
                color: '#1e88e5',
                assetName: 'Piscinas'
            },
            verde: {
                name: 'Jardins',
                icon: '🌱',
                color: '#4caf50',
                assetName: 'Jardins'
            },
            phyto: {
                name: 'Culturas',
                icon: '🧪',
                color: '#ff9800',
                assetName: 'Culturas'
            }
        };
        return configs[module];
    };

    const renderOverview = () => {
        if (!client) return null;

        const activeModules = Object.keys(client.services || {}).filter(
            module => client.services?.[module]?.active
        );

        return (
            <View style={styles.overviewContainer}>
                {/* Informações básicas do cliente */}
                <View style={styles.clientInfoCard}>
                    <View style={styles.clientHeader}>
                        <View style={styles.clientAvatar}>
                            <Text style={styles.clientAvatarText}>
                                {client.personalInfo.name[0].toUpperCase()}
                            </Text>
                        </View>
                        <View style={styles.clientInfo}>
                            <Text style={styles.clientName}>{client.personalInfo.name}</Text>
                            <Text style={styles.clientEmail}>{client.personalInfo.email}</Text>
                            <Text style={styles.clientPhone}>{client.personalInfo.phone}</Text>
                        </View>
                    </View>

                    <View style={styles.clientAddress}>
                        <Text style={styles.addressLabel}>Morada:</Text>
                        <Text style={styles.addressText}>
                            {client.address.street}, {client.address.city}
                        </Text>
                        <Text style={styles.addressText}>{client.address.postalCode}</Text>
                    </View>
                </View>

                {/* Módulos ativos */}
                <Text style={styles.sectionTitle}>Serviços Ativos</Text>
                {activeModules.map(module => {
                    const config = getModuleConfig(module);
                    const data = moduleData[module];

                    return (
                        <TouchableOpacity
                            key={module}
                            style={[styles.moduleOverviewCard, { borderLeftColor: config.color }]}
                            onPress={() => setSelectedModule(module)}
                        >
                            <View style={styles.moduleOverviewHeader}>
                                <Text style={styles.moduleIcon}>{config.icon}</Text>
                                <View style={styles.moduleOverviewInfo}>
                                    <Text style={styles.moduleOverviewName}>{config.name}</Text>
                                    <Text style={styles.moduleOverviewStats}>
                                        {data.assets.length} {config.assetName} • {data.analyses.length} Análises
                                    </Text>
                                </View>
                                <Text style={styles.moduleArrow}>›</Text>
                            </View>
                        </TouchableOpacity>
                    );
                })}
            </View>
        );
    };

    const renderModuleDetail = (module) => {
        const config = getModuleConfig(module);
        const data = moduleData[module];

        return (
            <View style={styles.moduleDetailContainer}>
                {/* Assets */}
                <View style={styles.moduleSection}>
                    <Text style={styles.moduleSectionTitle}>{config.assetName}</Text>
                    {data.assets.length > 0 ? (
                        data.assets.map((asset, index) => (
                            <View key={index} style={styles.assetCard}>
                                <Text style={styles.assetName}>{asset.basicInfo?.name || 'Asset'}</Text>
                                <Text style={styles.assetDetails}>
                                    {module === 'aqua' && `Volume: ${asset.basicInfo?.volume}m³`}
                                    {module === 'verde' && `Área: ${asset.basicInfo?.area}m²`}
                                    {module === 'phyto' && `Área: ${asset.basicInfo?.area}ha`}
                                </Text>
                            </View>
                        ))
                    ) : (
                        <Text style={styles.emptyText}>Nenhum {config.assetName.toLowerCase()} registado</Text>
                    )}
                </View>

                {/* Análises recentes */}
                <View style={styles.moduleSection}>
                    <Text style={styles.moduleSectionTitle}>Análises Recentes</Text>
                    {data.analyses.slice(0, 3).map((analysis, index) => (
                        <View key={index} style={styles.analysisCard}>
                            <View style={styles.analysisHeader}>
                                <Text style={styles.analysisDate}>
                                    {analysis.sampleInfo?.collectionDate?.toDate().toLocaleDateString('pt-PT')}
                                </Text>
                                <View style={[
                                    styles.analysisStatus,
                                    { backgroundColor: getStatusColor(analysis.results?.status) }
                                ]}>
                                    <Text style={styles.analysisStatusText}>
                                        {getStatusText(analysis.results?.status)}
                                    </Text>
                                </View>
                            </View>
                            <Text style={styles.analysisTarget}>
                                {getAssetName(analysis.targetId, data.assets)}
                            </Text>
                        </View>
                    ))}
                    {data.analyses.length === 0 && (
                        <Text style={styles.emptyText}>Nenhuma análise disponível</Text>
                    )}
                </View>

                {/* Tarefas pendentes */}
                <View style={styles.moduleSection}>
                    <Text style={styles.moduleSectionTitle}>Tarefas Pendentes</Text>
                    {data.tasks.filter(task => task.basicInfo?.status === 'pending').map((task, index) => (
                        <View key={index} style={styles.taskCard}>
                            <Text style={styles.taskTitle}>{task.basicInfo?.title}</Text>
                            <Text style={styles.taskDate}>
                                Agendado: {task.scheduling?.scheduledDate}
                            </Text>
                            <View style={[
                                styles.taskPriority,
                                { backgroundColor: getPriorityColor(task.basicInfo?.priority) }
                            ]}>
                                <Text style={styles.taskPriorityText}>
                                    {getPriorityText(task.basicInfo?.priority)}
                                </Text>
                            </View>
                        </View>
                    ))}
                    {data.tasks.filter(task => task.basicInfo?.status === 'pending').length === 0 && (
                        <Text style={styles.emptyText}>Nenhuma tarefa pendente</Text>
                    )}
                </View>
            </View>
        );
    };

    const getStatusColor = (status) => {
        const colors = {
            excellent: '#4caf50',
            good: '#8bc34a',
            warning: '#ff9800',
            critical: '#f44336'
        };
        return colors[status] || '#9e9e9e';
    };

    const getStatusText = (status) => {
        const texts = {
            excellent: 'Excelente',
            good: 'Bom',
            warning: 'Atenção',
            critical: 'Crítico'
        };
        return texts[status] || 'N/A';
    };

    const getPriorityColor = (priority) => {
        const colors = {
            low: '#2196f3',
            medium: '#ff9800',
            high: '#f44336',
            urgent: '#9c27b0'
        };
        return colors[priority] || '#9e9e9e';
    };

    const getPriorityText = (priority) => {
        const texts = {
            low: 'Baixa',
            medium: 'Média',
            high: 'Alta',
            urgent: 'Urgente'
        };
        return texts[priority] || 'N/A';
    };

    const getAssetName = (assetId, assets) => {
        const asset = assets.find(a => a.id === assetId);
        return asset?.basicInfo?.name || 'Asset não encontrado';
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Carregando dados do cliente...</Text>
            </View>
        );
    }

    if (!client) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorText}>Cliente não encontrado</Text>
                <TouchableOpacity style={styles.backButton} onPress={onBack}>
                    <Text style={styles.backButtonText}>Voltar</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const activeModules = Object.keys(client?.services || {}).filter(
        module => client?.services?.[module]?.active
    );

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#1565C0" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.headerBackButton} onPress={onBack}>
                    <Text style={styles.headerBackIcon}>‹</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{client.personalInfo.name}</Text>
                <View style={styles.headerPlaceholder} />
            </View>

            {/* Tabs */}
            <View style={styles.tabsContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <TouchableOpacity
                        style={[
                            styles.tab,
                            selectedModule === 'overview' && styles.activeTab
                        ]}
                        onPress={() => setSelectedModule('overview')}
                    >
                        <Text style={[
                            styles.tabText,
                            selectedModule === 'overview' && styles.activeTabText
                        ]}>
                            📊 Resumo
                        </Text>
                    </TouchableOpacity>

                    {activeModules.map(module => {
                        const config = getModuleConfig(module);
                        return (
                            <TouchableOpacity
                                key={module}
                                style={[
                                    styles.tab,
                                    selectedModule === module && styles.activeTab
                                ]}
                                onPress={() => setSelectedModule(module)}
                            >
                                <Text style={[
                                    styles.tabText,
                                    selectedModule === module && styles.activeTabText
                                ]}>
                                    {config.icon} {config.name}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>
            </View>

            {/* Conteúdo */}
            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {selectedModule === 'overview'
                    ? renderOverview()
                    : renderModuleDetail(selectedModule)
                }
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
    headerBackButton: {
        padding: 8,
    },
    headerBackIcon: {
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
    headerPlaceholder: {
        width: 40,
    },
    tabsContainer: {
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    tab: {
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
    },
    activeTab: {
        borderBottomColor: '#1e88e5',
    },
    tabText: {
        fontSize: 14,
        color: '#666',
        fontWeight: '500',
    },
    activeTabText: {
        color: '#1e88e5',
        fontWeight: 'bold',
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
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f8f9fa',
        padding: 20,
    },
    errorText: {
        fontSize: 18,
        color: '#f44336',
        marginBottom: 20,
        textAlign: 'center',
    },
    backButton: {
        backgroundColor: '#1e88e5',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 8,
    },
    backButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    overviewContainer: {
        padding: 20,
    },
    clientInfoCard: {
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
    clientHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
    },
    clientAvatar: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#1e88e5',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    clientAvatarText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
    },
    clientInfo: {
        flex: 1,
    },
    clientName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 5,
    },
    clientEmail: {
        fontSize: 14,
        color: '#666',
        marginBottom: 3,
    },
    clientPhone: {
        fontSize: 14,
        color: '#666',
    },
    clientAddress: {
        borderTopWidth: 1,
        borderTopColor: '#eee',
        paddingTop: 15,
    },
    addressLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: '#666',
        marginBottom: 5,
    },
    addressText: {
        fontSize: 14,
        color: '#333',
        marginBottom: 2,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 15,
    },
    moduleOverviewCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        marginBottom: 10,
        borderLeftWidth: 4,
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
    },
    moduleOverviewHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
    },
    moduleIcon: {
        fontSize: 24,
        marginRight: 15,
    },
    moduleOverviewInfo: {
        flex: 1,
    },
    moduleOverviewName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 5,
    },
    moduleOverviewStats: {
        fontSize: 12,
        color: '#666',
    },
    moduleArrow: {
        fontSize: 20,
        color: '#ccc',
        fontWeight: 'bold',
    },
    moduleDetailContainer: {
        padding: 20,
    },
    moduleSection: {
        marginBottom: 25,
    },
    moduleSectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 10,
    },
    assetCard: {
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 15,
        marginBottom: 8,
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
    },
    assetName: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 5,
    },
    assetDetails: {
        fontSize: 12,
        color: '#666',
    },
    analysisCard: {
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 15,
        marginBottom: 8,
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
    },
    analysisHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 5,
    },
    analysisDate: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#333',
    },
    analysisStatus: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    analysisStatusText: {
        fontSize: 10,
        color: '#fff',
        fontWeight: 'bold',
    },
    analysisTarget: {
        fontSize: 12,
        color: '#666',
    },
    taskCard: {
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 15,
        marginBottom: 8,
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        position: 'relative',
    },
    taskTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 5,
    },
    taskDate: {
        fontSize: 12,
        color: '#666',
    },
    taskPriority: {
        position: 'absolute',
        top: 10,
        right: 10,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    taskPriorityText: {
        fontSize: 10,
        color: '#fff',
        fontWeight: 'bold',
    },
    emptyText: {
        fontSize: 14,
        color: '#999',
        fontStyle: 'italic',
        textAlign: 'center',
        paddingVertical: 20,
    },
});
