import React, { useState, useEffect } from 'react';
import {
    View, Text, ScrollView, TouchableOpacity, StyleSheet,
    StatusBar, Alert, RefreshControl, TextInput
} from 'react-native';
import { useApp } from '../shared/context/AppContext';

export default function TeamsScreen({ user, onBack, onNavigate }) {
    const {
        clients,
        activities,
        loading
    } = useApp();

    const [selectedTab, setSelectedTab] = useState('members');
    const [refreshing, setRefreshing] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [showAddForm, setShowAddForm] = useState(false);
    const [selectedMember, setSelectedMember] = useState(null);

    // Dados simulados da equipa
    const [teamData, setTeamData] = useState({
        members: [
            {
                id: 'member_1',
                name: 'João Silva',
                email: 'joao.silva@mobitask.pt',
                role: 'Administrador',
                department: 'Gestão',
                avatar: '👨‍💼',
                status: 'online',
                permissions: ['admin', 'aqua', 'verde', 'phyto'],
                joinDate: '2023-01-15',
                lastActive: new Date(),
                stats: {
                    clientsManaged: 25,
                    tasksCompleted: 142,
                    responseTime: 1.2
                }
            },
            {
                id: 'member_2',
                name: 'Maria Santos',
                email: 'maria.santos@mobitask.pt',
                role: 'Técnica Aqua',
                department: 'Aqua',
                avatar: '👩‍🔬',
                status: 'online',
                permissions: ['aqua'],
                joinDate: '2023-03-20',
                lastActive: new Date(Date.now() - 30 * 60 * 1000),
                stats: {
                    clientsManaged: 18,
                    tasksCompleted: 89,
                    responseTime: 0.8
                }
            },
            {
                id: 'member_3',
                name: 'Pedro Costa',
                email: 'pedro.costa@mobitask.pt',
                role: 'Especialista Verde',
                department: 'Verde',
                avatar: '👨‍🌾',
                status: 'away',
                permissions: ['verde'],
                joinDate: '2023-02-10',
                lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000),
                stats: {
                    clientsManaged: 22,
                    tasksCompleted: 156,
                    responseTime: 1.5
                }
            },
            {
                id: 'member_4',
                name: 'Ana Ferreira',
                email: 'ana.ferreira@mobitask.pt',
                role: 'Consultora Phyto',
                department: 'Phyto',
                avatar: '👩‍⚗️',
                status: 'offline',
                permissions: ['phyto'],
                joinDate: '2023-04-05',
                lastActive: new Date(Date.now() - 5 * 60 * 60 * 1000),
                stats: {
                    clientsManaged: 15,
                    tasksCompleted: 73,
                    responseTime: 2.1
                }
            },
            {
                id: 'member_5',
                name: 'Carlos Oliveira',
                email: 'carlos.oliveira@mobitask.pt',
                role: 'Suporte Técnico',
                department: 'Suporte',
                avatar: '👨‍💻',
                status: 'online',
                permissions: ['support'],
                joinDate: '2023-05-12',
                lastActive: new Date(Date.now() - 10 * 60 * 1000),
                stats: {
                    clientsManaged: 8,
                    tasksCompleted: 95,
                    responseTime: 0.5
                }
            }
        ],
        departments: [
            {
                id: 'management',
                name: 'Gestão',
                icon: '👨‍💼',
                color: '#1e88e5',
                memberCount: 1,
                description: 'Administração e coordenação'
            },
            {
                id: 'aqua',
                name: 'Aqua',
                icon: '💧',
                color: '#1e88e5',
                memberCount: 1,
                description: 'Gestão de piscinas e tratamento de águas'
            },
            {
                id: 'verde',
                name: 'Verde',
                icon: '🌱',
                color: '#4caf50',
                memberCount: 1,
                description: 'Jardinagem e espaços verdes'
            },
            {
                id: 'phyto',
                name: 'Phyto',
                icon: '🧪',
                color: '#ff9800',
                memberCount: 1,
                description: 'Produtos fitossanitários'
            },
            {
                id: 'support',
                name: 'Suporte',
                icon: '🛠️',
                color: '#9c27b0',
                memberCount: 1,
                description: 'Suporte técnico e manutenção'
            }
        ],
        permissions: [
            { id: 'admin', name: 'Administrador', description: 'Acesso total ao sistema' },
            { id: 'aqua', name: 'Mobitask Aqua', description: 'Gestão de piscinas' },
            { id: 'verde', name: 'Mobitask Verde', description: 'Gestão de jardins' },
            { id: 'phyto', name: 'Mobitask Phyto', description: 'Fitossanitários' },
            { id: 'support', name: 'Suporte', description: 'Suporte técnico' },
            { id: 'reports', name: 'Relatórios', description: 'Visualização de relatórios' },
            { id: 'billing', name: 'Faturação', description: 'Gestão financeira' }
        ]
    });

    const onRefresh = async () => {
        setRefreshing(true);
        // Simular carregamento
        setTimeout(() => {
            setRefreshing(false);
        }, 1000);
    };

    const filteredMembers = teamData.members.filter(member =>
        member.name.toLowerCase().includes(searchText.toLowerCase()) ||
        member.email.toLowerCase().includes(searchText.toLowerCase()) ||
        member.role.toLowerCase().includes(searchText.toLowerCase())
    );

    const getStatusColor = (status) => {
        switch (status) {
            case 'online': return '#4caf50';
            case 'away': return '#ff9800';
            case 'offline': return '#666';
            default: return '#666';
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'online': return 'Online';
            case 'away': return 'Ausente';
            case 'offline': return 'Offline';
            default: return 'Desconhecido';
        }
    };

    const getDepartmentColor = (department) => {
        const dept = teamData.departments.find(d => d.name === department);
        return dept ? dept.color : '#666';
    };

    const formatLastActive = (lastActive) => {
        const now = new Date();
        const diff = now - lastActive;
        const minutes = Math.floor(diff / (1000 * 60));
        const hours = Math.floor(diff / (1000 * 60 * 60));

        if (minutes < 60) {
            return `${minutes}min atrás`;
        } else {
            return `${hours}h atrás`;
        }
    };

    const handleMemberAction = (member, action) => {
        switch (action) {
            case 'view':
                setSelectedMember(member);
                break;
            case 'edit':
                Alert.alert('Editar', `Editar membro: ${member.name}`);
                break;
            case 'permissions':
                Alert.alert('Permissões', `Gerir permissões de: ${member.name}`);
                break;
            case 'deactivate':
                Alert.alert(
                    'Desativar Membro',
                    `Tem certeza que deseja desativar ${member.name}?`,
                    [
                        { text: 'Cancelar', style: 'cancel' },
                        { text: 'Desativar', style: 'destructive' }
                    ]
                );
                break;
            default:
                break;
        }
    };

    const renderMember = (member) => (
        <TouchableOpacity
            key={member.id}
            style={styles.memberCard}
            onPress={() => handleMemberAction(member, 'view')}
        >
            <View style={styles.memberHeader}>
                <View style={styles.memberAvatar}>
                    <Text style={styles.memberAvatarText}>{member.avatar}</Text>
                    <View style={[
                        styles.statusIndicator,
                        { backgroundColor: getStatusColor(member.status) }
                    ]} />
                </View>

                <View style={styles.memberInfo}>
                    <Text style={styles.memberName}>{member.name}</Text>
                    <Text style={styles.memberRole}>{member.role}</Text>
                    <Text style={styles.memberEmail}>{member.email}</Text>
                </View>

                <View style={styles.memberActions}>
                    <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => handleMemberAction(member, 'edit')}
                    >
                        <Text style={styles.actionIcon}>✏️</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.memberDetails}>
                <View style={styles.memberStats}>
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>{member.stats.clientsManaged}</Text>
                        <Text style={styles.statLabel}>Clientes</Text>
                    </View>
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>{member.stats.tasksCompleted}</Text>
                        <Text style={styles.statLabel}>Tarefas</Text>
                    </View>
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>{member.stats.responseTime}h</Text>
                        <Text style={styles.statLabel}>Resposta</Text>
                    </View>
                </View>

                <View style={styles.memberMeta}>
                    <View style={styles.memberDepartment}>
                        <View style={[
                            styles.departmentDot,
                            { backgroundColor: getDepartmentColor(member.department) }
                        ]} />
                        <Text style={styles.departmentText}>{member.department}</Text>
                    </View>
                    <Text style={styles.lastActive}>
                        {member.status === 'online' ? 'Online agora' : formatLastActive(member.lastActive)}
                    </Text>
                </View>
            </View>

            <View style={styles.memberPermissions}>
                {member.permissions.slice(0, 3).map((permission, index) => (
                    <View key={index} style={styles.permissionChip}>
                        <Text style={styles.permissionText}>{permission}</Text>
                    </View>
                ))}
                {member.permissions.length > 3 && (
                    <View style={styles.permissionChip}>
                        <Text style={styles.permissionText}>+{member.permissions.length - 3}</Text>
                    </View>
                )}
            </View>
        </TouchableOpacity>
    );

    const renderDepartment = (department) => (
        <TouchableOpacity key={department.id} style={styles.departmentCard}>
            <View style={styles.departmentHeader}>
                <View style={[styles.departmentIcon, { backgroundColor: `${department.color}20` }]}>
                    <Text style={styles.departmentIconText}>{department.icon}</Text>
                </View>
                <View style={styles.departmentInfo}>
                    <Text style={styles.departmentName}>{department.name}</Text>
                    <Text style={styles.departmentDescription}>{department.description}</Text>
                </View>
                <View style={styles.departmentStats}>
                    <Text style={styles.departmentCount}>{department.memberCount}</Text>
                    <Text style={styles.departmentLabel}>membros</Text>
                </View>
            </View>
        </TouchableOpacity>
    );

    const renderTabContent = () => {
        switch (selectedTab) {
            case 'members':
                return (
                    <View style={styles.tabContent}>
                        {/* Search */}
                        <View style={styles.searchContainer}>
                            <Text style={styles.searchIcon}>🔍</Text>
                            <TextInput
                                style={styles.searchInput}
                                placeholder="Pesquisar membros..."
                                value={searchText}
                                onChangeText={setSearchText}
                            />
                        </View>

                        {/* Members List */}
                        {filteredMembers.length > 0 ? (
                            filteredMembers.map(renderMember)
                        ) : (
                            <View style={styles.emptyState}>
                                <Text style={styles.emptyIcon}>👥</Text>
                                <Text style={styles.emptyTitle}>Nenhum membro encontrado</Text>
                                <Text style={styles.emptyText}>
                                    Tente ajustar os termos de pesquisa
                                </Text>
                            </View>
                        )}
                    </View>
                );

            case 'departments':
                return (
                    <View style={styles.tabContent}>
                        {teamData.departments.map(renderDepartment)}
                    </View>
                );

            case 'permissions':
                return (
                    <View style={styles.tabContent}>
                        {teamData.permissions.map((permission) => (
                            <View key={permission.id} style={styles.permissionCard}>
                                <Text style={styles.permissionName}>{permission.name}</Text>
                                <Text style={styles.permissionDescription}>{permission.description}</Text>
                            </View>
                        ))}
                    </View>
                );

            default:
                return null;
        }
    };

    if (selectedMember) {
        return (
            <MemberDetailScreen
                member={selectedMember}
                onBack={() => setSelectedMember(null)}
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
                <Text style={styles.headerTitle}>Equipas</Text>
                <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => setShowAddForm(true)}
                >
                    <Text style={styles.addIcon}>+</Text>
                </TouchableOpacity>
            </View>

            {/* Tabs */}
            <View style={styles.tabsContainer}>
                {[
                    { id: 'members', label: 'Membros', icon: '👥' },
                    { id: 'departments', label: 'Departamentos', icon: '🏢' },
                    { id: 'permissions', label: 'Permissões', icon: '🔐' }
                ].map((tab) => (
                    <TouchableOpacity
                        key={tab.id}
                        style={[
                            styles.tab,
                            selectedTab === tab.id && styles.tabActive
                        ]}
                        onPress={() => setSelectedTab(tab.id)}
                    >
                        <Text style={styles.tabIcon}>{tab.icon}</Text>
                        <Text style={[
                            styles.tabText,
                            selectedTab === tab.id && styles.tabTextActive
                        ]}>
                            {tab.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Stats */}
            <View style={styles.statsContainer}>
                <View style={styles.statCard}>
                    <Text style={styles.statNumber}>{teamData.members.length}</Text>
                    <Text style={styles.statLabel}>Total Membros</Text>
                </View>
                <View style={styles.statCard}>
                    <Text style={styles.statNumber}>
                        {teamData.members.filter(m => m.status === 'online').length}
                    </Text>
                    <Text style={styles.statLabel}>Online</Text>
                </View>
                <View style={styles.statCard}>
                    <Text style={styles.statNumber}>{teamData.departments.length}</Text>
                    <Text style={styles.statLabel}>Departamentos</Text>
                </View>
            </View>

            <ScrollView
                style={styles.content}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
                showsVerticalScrollIndicator={false}
            >
                {renderTabContent()}
            </ScrollView>
        </View>
    );
}

// Componente para detalhes do membro
function MemberDetailScreen({ member, onBack }) {
    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#1565C0" />

            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={onBack}>
                    <Text style={styles.backIcon}>‹</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Detalhes do Membro</Text>
                <View style={styles.headerRight} />
            </View>

            <ScrollView style={styles.content}>
                <View style={styles.memberDetailCard}>
                    <View style={styles.memberDetailHeader}>
                        <Text style={styles.memberDetailAvatar}>{member.avatar}</Text>
                        <Text style={styles.memberDetailName}>{member.name}</Text>
                        <Text style={styles.memberDetailRole}>{member.role}</Text>
                        <Text style={styles.memberDetailEmail}>{member.email}</Text>
                    </View>

                    <View style={styles.memberDetailStats}>
                        <View style={styles.detailStatItem}>
                            <Text style={styles.detailStatValue}>{member.stats.clientsManaged}</Text>
                            <Text style={styles.detailStatLabel}>Clientes Geridos</Text>
                        </View>
                        <View style={styles.detailStatItem}>
                            <Text style={styles.detailStatValue}>{member.stats.tasksCompleted}</Text>
                            <Text style={styles.detailStatLabel}>Tarefas Completadas</Text>
                        </View>
                        <View style={styles.detailStatItem}>
                            <Text style={styles.detailStatValue}>{member.stats.responseTime}h</Text>
                            <Text style={styles.detailStatLabel}>Tempo de Resposta</Text>
                        </View>
                    </View>

                    <View style={styles.memberDetailInfo}>
                        <Text style={styles.detailSectionTitle}>Informações</Text>
                        <Text style={styles.detailInfoText}>
                            Departamento: {member.department}
                        </Text>
                        <Text style={styles.detailInfoText}>
                            Data de Ingresso: {new Date(member.joinDate).toLocaleDateString('pt-PT')}
                        </Text>
                        <Text style={styles.detailInfoText}>
                            Status: {member.status === 'online' ? 'Online' :
                                member.status === 'away' ? 'Ausente' : 'Offline'}
                        </Text>
                    </View>

                    <View style={styles.memberDetailPermissions}>
                        <Text style={styles.detailSectionTitle}>Permissões</Text>
                        {member.permissions.map((permission, index) => (
                            <View key={index} style={styles.detailPermissionItem}>
                                <Text style={styles.detailPermissionText}>{permission}</Text>
                            </View>
                        ))}
                    </View>
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
    headerRight: {
        width: 40,
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
    tabsContainer: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    tab: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 15,
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
    },
    tabActive: {
        borderBottomColor: '#1e88e5',
    },
    tabIcon: {
        fontSize: 16,
        marginRight: 5,
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
    statsContainer: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    statCard: {
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
    content: {
        flex: 1,
        padding: 20,
    },
    tabContent: {
        flex: 1,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 12,
        paddingHorizontal: 15,
        marginBottom: 15,
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
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
    memberCard: {
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
    memberHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    memberAvatar: {
        position: 'relative',
        marginRight: 15,
    },
    memberAvatarText: {
        fontSize: 32,
    },
    statusIndicator: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 12,
        height: 12,
        borderRadius: 6,
        borderWidth: 2,
        borderColor: '#fff',
    },
    memberInfo: {
        flex: 1,
    },
    memberName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 3,
    },
    memberRole: {
        fontSize: 12,
        color: '#666',
        marginBottom: 3,
    },
    memberEmail: {
        fontSize: 10,
        color: '#999',
    },
    memberActions: {
        alignItems: 'center',
    },
    actionButton: {
        padding: 8,
    },
    actionIcon: {
        fontSize: 16,
    },
    memberDetails: {
        marginBottom: 10,
    },
    memberStats: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 10,
    },
    statItem: {
        alignItems: 'center',
    },
    statValue: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 3,
    },
    statLabel: {
        fontSize: 10,
        color: '#666',
    },
    memberMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    memberDepartment: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    departmentDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 5,
    },
    departmentText: {
        fontSize: 12,
        color: '#666',
        fontWeight: '500',
    },
    lastActive: {
        fontSize: 10,
        color: '#999',
    },
    memberPermissions: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 5,
    },
    permissionChip: {
        backgroundColor: '#f0f0f0',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 10,
    },
    permissionText: {
        fontSize: 10,
        color: '#666',
        fontWeight: '500',
    },
    departmentCard: {
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
    departmentHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    departmentIcon: {
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    departmentIconText: {
        fontSize: 20,
    },
    departmentInfo: {
        flex: 1,
    },
    departmentName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 5,
    },
    departmentDescription: {
        fontSize: 12,
        color: '#666',
        lineHeight: 16,
    },
    departmentStats: {
        alignItems: 'center',
    },
    departmentCount: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 3,
    },
    departmentLabel: {
        fontSize: 10,
        color: '#666',
    },
    permissionCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 15,
        marginBottom: 10,
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
    },
    permissionName: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 5,
    },
    permissionDescription: {
        fontSize: 12,
        color: '#666',
        lineHeight: 16,
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
        lineHeight: 20,
    },
    // Member Detail Styles
    memberDetailCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 20,
        margin: 20,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    memberDetailHeader: {
        alignItems: 'center',
        marginBottom: 20,
    },
    memberDetailAvatar: {
        fontSize: 60,
        marginBottom: 10,
    },
    memberDetailName: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 5,
    },
    memberDetailRole: {
        fontSize: 14,
        color: '#666',
        marginBottom: 5,
    },
    memberDetailEmail: {
        fontSize: 12,
        color: '#999',
    },
    memberDetailStats: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 20,
        paddingVertical: 15,
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: '#f0f0f0',
    },
    detailStatItem: {
        alignItems: 'center',
    },
    detailStatValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 5,
    },
    detailStatLabel: {
        fontSize: 10,
        color: '#666',
        textAlign: 'center',
    },
    memberDetailInfo: {
        marginBottom: 20,
    },
    detailSectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 10,
    },
    detailInfoText: {
        fontSize: 14,
        color: '#666',
        marginBottom: 5,
        lineHeight: 20,
    },
    memberDetailPermissions: {
        marginBottom: 20,
    },
    detailPermissionItem: {
        backgroundColor: '#f5f5f5',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        marginBottom: 5,
    },
    detailPermissionText: {
        fontSize: 12,
        color: '#333',
        fontWeight: '500',
    },
});
