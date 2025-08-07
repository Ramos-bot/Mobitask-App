import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';

export default function MobitaskBase({ user, onModuleSelect, onLogout }) {
    const modules = [
        {
            id: 'aqua',
            name: 'Mobitask Aqua',
            icon: '💧',
            description: 'Gestão e Análise de Piscinas',
            color: '#1e88e5',
            status: 'active' // active, beta, coming_soon
        },
        {
            id: 'verde',
            name: 'Mobitask Verde',
            icon: '🌱',
            description: 'Gestão de Jardins e Espaços Verdes',
            color: '#4caf50',
            status: 'beta'
        },
        {
            id: 'phyto',
            name: 'Mobitask Phyto',
            icon: '🧪',
            description: 'Gestão de Fitofármacos',
            color: '#ff9800',
            status: 'coming_soon'
        }
    ];

    const renderModule = (module) => {
        const isDisabled = module.status === 'coming_soon';

        return (
            <TouchableOpacity
                key={module.id}
                style={[
                    styles.moduleCard,
                    { borderLeftColor: module.color },
                    isDisabled && styles.moduleDisabled
                ]}
                onPress={() => !isDisabled && onModuleSelect(module.id)}
                disabled={isDisabled}
            >
                <View style={styles.moduleHeader}>
                    <Text style={styles.moduleIcon}>{module.icon}</Text>
                    <View style={styles.moduleInfo}>
                        <Text style={styles.moduleName}>{module.name}</Text>
                        <Text style={styles.moduleDescription}>{module.description}</Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(module.status) }]}>
                        <Text style={styles.statusText}>{getStatusText(module.status)}</Text>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'active': return '#4caf50';
            case 'beta': return '#ff9800';
            case 'coming_soon': return '#9e9e9e';
            default: return '#9e9e9e';
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'active': return 'Ativo';
            case 'beta': return 'Beta';
            case 'coming_soon': return 'Em Breve';
            default: return '';
        }
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>🏢 Mobitask</Text>
                <Text style={styles.subtitle}>Plataforma de Gestão Profissional</Text>
                <Text style={styles.welcome}>Bem-vindo, {user?.email || 'Utilizador'}!</Text>
            </View>

            <View style={styles.modulesSection}>
                <Text style={styles.sectionTitle}>Módulos Disponíveis</Text>
                {modules.map(renderModule)}
            </View>

            <View style={styles.footer}>
                <TouchableOpacity style={styles.logoutButton} onPress={onLogout}>
                    <Text style={styles.logoutText}>🚪 Terminar Sessão</Text>
                </TouchableOpacity>
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
        padding: 30,
        paddingTop: 60,
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 5,
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        marginBottom: 15,
    },
    welcome: {
        fontSize: 18,
        color: '#1e88e5',
        fontWeight: '500',
    },
    modulesSection: {
        padding: 20,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 15,
    },
    moduleCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        marginBottom: 15,
        borderLeftWidth: 4,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    moduleDisabled: {
        opacity: 0.5,
    },
    moduleHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
    },
    moduleIcon: {
        fontSize: 40,
        marginRight: 15,
    },
    moduleInfo: {
        flex: 1,
    },
    moduleName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 5,
    },
    moduleDescription: {
        fontSize: 14,
        color: '#666',
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    statusText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
    },
    footer: {
        padding: 20,
        alignItems: 'center',
    },
    logoutButton: {
        backgroundColor: '#f44336',
        paddingHorizontal: 30,
        paddingVertical: 15,
        borderRadius: 8,
    },
    logoutText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
