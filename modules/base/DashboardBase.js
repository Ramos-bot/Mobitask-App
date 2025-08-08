import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';

// Importar os screens dos módulos base
import ClientesScreen from './ClientesScreen';
import ColaboradoresScreen from './ColaboradoresScreen';
import FornecedoresScreen from './FornecedoresScreen';

const DashboardBase = ({ onBack }) => {
    const [activeModule, setActiveModule] = useState(null);

    // Configuração dos módulos base
    const baseModules = [
        {
            id: 'clientes',
            title: 'Clientes',
            subtitle: 'Gestão de clientes',
            color: '#2196F3',
            icon: '👥',
            component: ClientesScreen
        },
        {
            id: 'colaboradores',
            title: 'Colaboradores',
            subtitle: 'Gestão de equipe',
            color: '#4CAF50',
            icon: '👤',
            component: ColaboradoresScreen
        },
        {
            id: 'fornecedores',
            title: 'Fornecedores',
            subtitle: 'Gestão de fornecedores',
            color: '#FF9800',
            icon: '🏢',
            component: FornecedoresScreen
        }
    ];

    // Se um módulo está ativo, renderizar esse módulo
    if (activeModule) {
        const ModuleComponent = activeModule.component;
        return (
            <ModuleComponent
                onBack={() => setActiveModule(null)}
                moduleInfo={activeModule}
            />
        );
    }

    // Renderizar dashboard base
    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={onBack}>
                    <Text style={styles.backButtonText}>← Voltar</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Módulos Base</Text>
                <Text style={styles.headerSubtitle}>Gestão fundamental do sistema</Text>
            </View>

            <ScrollView style={styles.content}>
                <View style={styles.modulesGrid}>
                    {baseModules.map((module) => (
                        <TouchableOpacity
                            key={module.id}
                            style={[styles.moduleCard, { borderLeftColor: module.color }]}
                            onPress={() => setActiveModule(module)}
                        >
                            <View style={styles.moduleIcon}>
                                <Text style={styles.moduleIconText}>{module.icon}</Text>
                            </View>
                            <View style={styles.moduleInfo}>
                                <Text style={styles.moduleTitle}>{module.title}</Text>
                                <Text style={styles.moduleSubtitle}>{module.subtitle}</Text>
                            </View>
                            <View style={[styles.moduleIndicator, { backgroundColor: module.color }]} />
                        </TouchableOpacity>
                    ))}
                </View>

                <View style={styles.statsContainer}>
                    <Text style={styles.statsTitle}>Resumo dos Módulos Base</Text>
                    <View style={styles.statsGrid}>
                        <View style={styles.statCard}>
                            <Text style={styles.statNumber}>0</Text>
                            <Text style={styles.statLabel}>Clientes</Text>
                        </View>
                        <View style={styles.statCard}>
                            <Text style={styles.statNumber}>0</Text>
                            <Text style={styles.statLabel}>Colaboradores</Text>
                        </View>
                        <View style={styles.statCard}>
                            <Text style={styles.statNumber}>0</Text>
                            <Text style={styles.statLabel}>Fornecedores</Text>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    header: {
        backgroundColor: '#fff',
        padding: 20,
        paddingTop: 40,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    backButton: {
        marginBottom: 10,
    },
    backButtonText: {
        color: '#2196F3',
        fontSize: 16,
        fontWeight: '500',
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 5,
    },
    headerSubtitle: {
        fontSize: 16,
        color: '#666',
    },
    content: {
        flex: 1,
        padding: 20,
    },
    modulesGrid: {
        marginBottom: 30,
    },
    moduleCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 20,
        marginBottom: 15,
        flexDirection: 'row',
        alignItems: 'center',
        borderLeftWidth: 4,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    moduleIcon: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#f8f9fa',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    moduleIconText: {
        fontSize: 24,
    },
    moduleInfo: {
        flex: 1,
    },
    moduleTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 5,
    },
    moduleSubtitle: {
        fontSize: 14,
        color: '#666',
    },
    moduleIndicator: {
        width: 8,
        height: 40,
        borderRadius: 4,
    },
    statsContainer: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 20,
    },
    statsTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 15,
    },
    statsGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    statCard: {
        alignItems: 'center',
        flex: 1,
    },
    statNumber: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#2196F3',
        marginBottom: 5,
    },
    statLabel: {
        fontSize: 12,
        color: '#666',
        textAlign: 'center',
    },
});

export default DashboardBase;
