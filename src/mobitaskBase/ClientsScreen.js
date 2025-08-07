import React, { useState, useEffect } from 'react';
import {
    View, Text, ScrollView, TouchableOpacity, StyleSheet,
    TextInput, StatusBar, Alert, RefreshControl
} from 'react-native';
import { useApp } from '../shared/context/AppContext';
import ClientDetailScreen from '../shared/components/ClientDetailScreen';

export default function ClientsScreen({ user, onBack, onNavigate }) {
    const {
        clients,
        loadClients,
        createClient,
        loading,
        error
    } = useApp();

    const [searchText, setSearchText] = useState('');
    const [selectedClient, setSelectedClient] = useState(null);
    const [showAddForm, setShowAddForm] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [filterModule, setFilterModule] = useState('all');

    useEffect(() => {
        loadClients();
    }, []);

    const onRefresh = async () => {
        setRefreshing(true);
        await loadClients();
        setRefreshing(false);
    };

    const filteredClients = clients.filter(client => {
        const matchesSearch = client.personalInfo.name
            .toLowerCase()
            .includes(searchText.toLowerCase()) ||
            client.personalInfo.email
                .toLowerCase()
                .includes(searchText.toLowerCase());

        const matchesModule = filterModule === 'all' ||
            client.services[filterModule]?.active;

        return matchesSearch && matchesModule;
    });

    const getClientModules = (client) => {
        const activeModules = [];
        if (client.services?.aqua?.active) activeModules.push({ name: 'Aqua', icon: '💧', color: '#1e88e5' });
        if (client.services?.verde?.active) activeModules.push({ name: 'Verde', icon: '🌱', color: '#4caf50' });
        if (client.services?.phyto?.active) activeModules.push({ name: 'Phyto', icon: '🧪', color: '#ff9800' });
        return activeModules;
    };

    const renderClient = (client) => {
        const modules = getClientModules(client);

        return (
            <TouchableOpacity
                key={client.id}
                style={styles.clientCard}
                onPress={() => setSelectedClient(client)}
            >
                <View style={styles.clientHeader}>
                    <View style={styles.clientAvatar}>
                        <Text style={styles.clientAvatarText}>
                            {client.personalInfo.name[0].toUpperCase()}
                        </Text>
                    </View>
                    <View style={styles.clientInfo}>
                        <Text style={styles.clientName}>{client.personalInfo.name}</Text>
                        <Text style={styles.clientEmail}>{client.personalInfo.email}</Text>
                        <Text style={styles.clientLocation}>
                            {client.address.city}, {client.address.postalCode}
                        </Text>
                    </View>
                    <View style={styles.clientStatus}>
                        <View style={[
                            styles.statusDot,
                            { backgroundColor: client.status === 'active' ? '#4caf50' : '#f44336' }
                        ]} />
                    </View>
                </View>

                {modules.length > 0 && (
                    <View style={styles.clientModules}>
                        {modules.map((module, index) => (
                            <View
                                key={index}
                                style={[styles.moduleChip, { backgroundColor: `${module.color}20` }]}
                            >
                                <Text style={styles.moduleChipIcon}>{module.icon}</Text>
                                <Text style={[styles.moduleChipText, { color: module.color }]}>
                                    {module.name}
                                </Text>
                            </View>
                        ))}
                    </View>
                )}
            </TouchableOpacity>
        );
    };

    if (selectedClient) {
        return (
            <ClientDetailScreen
                clientId={selectedClient.id}
                onBack={() => setSelectedClient(null)}
            />
        );
    }

    if (showAddForm) {
        return (
            <AddClientForm
                onBack={() => setShowAddForm(false)}
                onSave={async (clientData) => {
                    const newClient = await createClient(clientData);
                    if (newClient) {
                        setShowAddForm(false);
                        Alert.alert('Sucesso', 'Cliente criado com sucesso!');
                    }
                }}
            />
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
                <Text style={styles.headerTitle}>Clientes</Text>
                <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => setShowAddForm(true)}
                >
                    <Text style={styles.addIcon}>+</Text>
                </TouchableOpacity>
            </View>

            {/* Search and Filters */}
            <View style={styles.searchSection}>
                <View style={styles.searchContainer}>
                    <Text style={styles.searchIcon}>🔍</Text>
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Pesquisar clientes..."
                        value={searchText}
                        onChangeText={setSearchText}
                    />
                </View>

                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.filtersContainer}
                >
                    <TouchableOpacity
                        style={[styles.filterChip, filterModule === 'all' && styles.filterChipActive]}
                        onPress={() => setFilterModule('all')}
                    >
                        <Text style={[styles.filterText, filterModule === 'all' && styles.filterTextActive]}>
                            Todos
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.filterChip, filterModule === 'aqua' && styles.filterChipActive]}
                        onPress={() => setFilterModule('aqua')}
                    >
                        <Text style={[styles.filterText, filterModule === 'aqua' && styles.filterTextActive]}>
                            💧 Aqua
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.filterChip, filterModule === 'verde' && styles.filterChipActive]}
                        onPress={() => setFilterModule('verde')}
                    >
                        <Text style={[styles.filterText, filterModule === 'verde' && styles.filterTextActive]}>
                            🌱 Verde
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.filterChip, filterModule === 'phyto' && styles.filterChipActive]}
                        onPress={() => setFilterModule('phyto')}
                    >
                        <Text style={[styles.filterText, filterModule === 'phyto' && styles.filterTextActive]}>
                            🧪 Phyto
                        </Text>
                    </TouchableOpacity>
                </ScrollView>
            </View>

            {/* Stats */}
            <View style={styles.statsContainer}>
                <View style={styles.statItem}>
                    <Text style={styles.statNumber}>{clients.length}</Text>
                    <Text style={styles.statLabel}>Total</Text>
                </View>
                <View style={styles.statItem}>
                    <Text style={styles.statNumber}>
                        {clients.filter(c => c.status === 'active').length}
                    </Text>
                    <Text style={styles.statLabel}>Ativos</Text>
                </View>
                <View style={styles.statItem}>
                    <Text style={styles.statNumber}>{filteredClients.length}</Text>
                    <Text style={styles.statLabel}>Filtrados</Text>
                </View>
            </View>

            {/* Clients List */}
            <ScrollView
                style={styles.clientsList}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
                showsVerticalScrollIndicator={false}
            >
                {filteredClients.length > 0 ? (
                    filteredClients.map(renderClient)
                ) : (
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyIcon}>👥</Text>
                        <Text style={styles.emptyTitle}>Nenhum cliente encontrado</Text>
                        <Text style={styles.emptyText}>
                            {searchText
                                ? 'Tente ajustar os filtros de pesquisa'
                                : 'Adicione o primeiro cliente para começar'
                            }
                        </Text>
                        {!searchText && (
                            <TouchableOpacity
                                style={styles.emptyButton}
                                onPress={() => setShowAddForm(true)}
                            >
                                <Text style={styles.emptyButtonText}>Adicionar Cliente</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                )}
            </ScrollView>
        </View>
    );
}

// Componente para adicionar cliente
function AddClientForm({ onBack, onSave }) {
    const [formData, setFormData] = useState({
        personalInfo: {
            name: '',
            email: '',
            phone: '',
            nif: ''
        },
        address: {
            street: '',
            city: '',
            postalCode: ''
        },
        services: {
            aqua: { active: false },
            verde: { active: false },
            phyto: { active: false }
        }
    });

    const updateField = (section, field, value) => {
        setFormData(prev => ({
            ...prev,
            [section]: {
                ...prev[section],
                [field]: value
            }
        }));
    };

    const toggleService = (service) => {
        setFormData(prev => ({
            ...prev,
            services: {
                ...prev.services,
                [service]: {
                    ...prev.services[service],
                    active: !prev.services[service].active
                }
            }
        }));
    };

    const handleSave = () => {
        if (!formData.personalInfo.name.trim() || !formData.personalInfo.email.trim()) {
            Alert.alert('Erro', 'Nome e email são obrigatórios');
            return;
        }

        onSave(formData);
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#1565C0" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={onBack}>
                    <Text style={styles.backIcon}>‹</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Novo Cliente</Text>
                <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                    <Text style={styles.saveText}>Guardar</Text>
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.formContainer}>
                {/* Informações Pessoais */}
                <View style={styles.formSection}>
                    <Text style={styles.sectionTitle}>Informações Pessoais</Text>

                    <View style={styles.fieldGroup}>
                        <Text style={styles.fieldLabel}>Nome *</Text>
                        <TextInput
                            style={styles.input}
                            value={formData.personalInfo.name}
                            onChangeText={(value) => updateField('personalInfo', 'name', value)}
                            placeholder="Nome completo"
                        />
                    </View>

                    <View style={styles.fieldGroup}>
                        <Text style={styles.fieldLabel}>Email *</Text>
                        <TextInput
                            style={styles.input}
                            value={formData.personalInfo.email}
                            onChangeText={(value) => updateField('personalInfo', 'email', value)}
                            placeholder="email@exemplo.com"
                            keyboardType="email-address"
                        />
                    </View>

                    <View style={styles.fieldGroup}>
                        <Text style={styles.fieldLabel}>Telefone</Text>
                        <TextInput
                            style={styles.input}
                            value={formData.personalInfo.phone}
                            onChangeText={(value) => updateField('personalInfo', 'phone', value)}
                            placeholder="+351 XXX XXX XXX"
                            keyboardType="phone-pad"
                        />
                    </View>
                </View>

                {/* Morada */}
                <View style={styles.formSection}>
                    <Text style={styles.sectionTitle}>Morada</Text>

                    <View style={styles.fieldGroup}>
                        <Text style={styles.fieldLabel}>Rua/Avenida</Text>
                        <TextInput
                            style={styles.input}
                            value={formData.address.street}
                            onChangeText={(value) => updateField('address', 'street', value)}
                            placeholder="Rua da Liberdade, 123"
                        />
                    </View>

                    <View style={styles.fieldGroup}>
                        <Text style={styles.fieldLabel}>Cidade</Text>
                        <TextInput
                            style={styles.input}
                            value={formData.address.city}
                            onChangeText={(value) => updateField('address', 'city', value)}
                            placeholder="Lisboa"
                        />
                    </View>

                    <View style={styles.fieldGroup}>
                        <Text style={styles.fieldLabel}>Código Postal</Text>
                        <TextInput
                            style={styles.input}
                            value={formData.address.postalCode}
                            onChangeText={(value) => updateField('address', 'postalCode', value)}
                            placeholder="1000-000"
                        />
                    </View>
                </View>

                {/* Serviços */}
                <View style={styles.formSection}>
                    <Text style={styles.sectionTitle}>Serviços</Text>

                    <TouchableOpacity
                        style={styles.serviceOption}
                        onPress={() => toggleService('aqua')}
                    >
                        <View style={styles.serviceInfo}>
                            <Text style={styles.serviceIcon}>💧</Text>
                            <Text style={styles.serviceName}>Mobitask Aqua</Text>
                        </View>
                        <View style={[
                            styles.serviceToggle,
                            formData.services.aqua.active && styles.serviceToggleActive
                        ]}>
                            {formData.services.aqua.active && <Text style={styles.serviceCheck}>✓</Text>}
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.serviceOption}
                        onPress={() => toggleService('verde')}
                    >
                        <View style={styles.serviceInfo}>
                            <Text style={styles.serviceIcon}>🌱</Text>
                            <Text style={styles.serviceName}>Mobitask Verde</Text>
                        </View>
                        <View style={[
                            styles.serviceToggle,
                            formData.services.verde.active && styles.serviceToggleActive
                        ]}>
                            {formData.services.verde.active && <Text style={styles.serviceCheck}>✓</Text>}
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.serviceOption}
                        onPress={() => toggleService('phyto')}
                    >
                        <View style={styles.serviceInfo}>
                            <Text style={styles.serviceIcon}>🧪</Text>
                            <Text style={styles.serviceName}>Mobitask Phyto</Text>
                        </View>
                        <View style={[
                            styles.serviceToggle,
                            formData.services.phyto.active && styles.serviceToggleActive
                        ]}>
                            {formData.services.phyto.active && <Text style={styles.serviceCheck}>✓</Text>}
                        </View>
                    </TouchableOpacity>
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
    addButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    addIcon: {
        fontSize: 20,
        color: '#fff',
        fontWeight: 'bold',
    },
    saveButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 20,
    },
    saveText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
    searchSection: {
        backgroundColor: '#fff',
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
        borderRadius: 12,
        paddingHorizontal: 15,
        marginBottom: 15,
    },
    searchIcon: {
        fontSize: 16,
        marginRight: 10,
    },
    searchInput: {
        flex: 1,
        paddingVertical: 12,
        fontSize: 16,
        color: '#333',
    },
    filtersContainer: {
        flexDirection: 'row',
    },
    filterChip: {
        backgroundColor: '#f5f5f5',
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 20,
        marginRight: 10,
    },
    filterChipActive: {
        backgroundColor: '#1e88e5',
    },
    filterText: {
        fontSize: 12,
        color: '#666',
        fontWeight: '500',
    },
    filterTextActive: {
        color: '#fff',
    },
    statsContainer: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
    },
    statNumber: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 5,
    },
    statLabel: {
        fontSize: 12,
        color: '#666',
        fontWeight: '500',
    },
    clientsList: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 15,
    },
    clientCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 15,
        marginBottom: 10,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    clientHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    clientAvatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#1e88e5',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    clientAvatarText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
    },
    clientInfo: {
        flex: 1,
    },
    clientName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 3,
    },
    clientEmail: {
        fontSize: 12,
        color: '#666',
        marginBottom: 3,
    },
    clientLocation: {
        fontSize: 12,
        color: '#999',
    },
    clientStatus: {
        alignItems: 'center',
    },
    statusDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
    },
    clientModules: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    moduleChip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 15,
    },
    moduleChipIcon: {
        fontSize: 12,
        marginRight: 5,
    },
    moduleChipText: {
        fontSize: 10,
        fontWeight: '600',
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
    },
    emptyIcon: {
        fontSize: 60,
        marginBottom: 20,
        opacity: 0.5,
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
        marginBottom: 20,
        lineHeight: 20,
    },
    emptyButton: {
        backgroundColor: '#1e88e5',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 8,
    },
    emptyButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
    formContainer: {
        flex: 1,
        padding: 20,
    },
    formSection: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 20,
        marginBottom: 15,
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 15,
    },
    fieldGroup: {
        marginBottom: 15,
    },
    fieldLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        fontSize: 14,
        color: '#333',
        backgroundColor: '#fff',
    },
    serviceOption: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#f5f5f5',
    },
    serviceInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    serviceIcon: {
        fontSize: 20,
        marginRight: 12,
    },
    serviceName: {
        fontSize: 14,
        fontWeight: '500',
        color: '#333',
    },
    serviceToggle: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#ddd',
        justifyContent: 'center',
        alignItems: 'center',
    },
    serviceToggleActive: {
        backgroundColor: '#1e88e5',
        borderColor: '#1e88e5',
    },
    serviceCheck: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
    },
});
