import React, { useState, useEffect } from 'react';
import {
    View, Text, ScrollView, TouchableOpacity, StyleSheet,
    StatusBar, RefreshControl, Alert
} from 'react-native';
import { useApp } from '../shared/context/AppContext';

export default function NotificationsScreen({ user, onBack, onNavigate }) {
    const {
        activities,
        loadActivities,
        markActivityAsRead,
        loading
    } = useApp();

    const [selectedFilter, setSelectedFilter] = useState('all');
    const [refreshing, setRefreshing] = useState(false);
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        loadNotifications();
    }, [activities]);

    const loadNotifications = () => {
        // Converter atividades em notificações
        const notificationsList = [
            // Notificações do sistema
            {
                id: 'sys_1',
                type: 'system',
                title: 'Atualização do Sistema',
                message: 'Nova versão disponível com melhorias de performance',
                timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2h atrás
                read: false,
                priority: 'medium',
                icon: '🔄',
                action: 'update'
            },
            {
                id: 'sys_2',
                type: 'system',
                title: 'Backup Automático',
                message: 'Backup dos dados realizado com sucesso',
                timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6h atrás
                read: true,
                priority: 'low',
                icon: '💾',
                action: null
            },
            // Notificações de clientes
            {
                id: 'client_1',
                type: 'client',
                title: 'Novo Cliente Registado',
                message: 'Maria Silva foi adicionada ao sistema',
                timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30min atrás
                read: false,
                priority: 'high',
                icon: '👤',
                action: 'view_client',
                data: { clientId: 'client_123' }
            },
            {
                id: 'client_2',
                type: 'client',
                title: 'Cliente Inativo',
                message: 'João Santos não teve atividade nos últimos 30 dias',
                timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12h atrás
                read: false,
                priority: 'medium',
                icon: '⚠️',
                action: 'contact_client',
                data: { clientId: 'client_456' }
            },
            // Notificações de módulos
            {
                id: 'aqua_1',
                type: 'aqua',
                title: 'Análise Aqua Completada',
                message: 'Análise da piscina de António Costa foi finalizada',
                timestamp: new Date(Date.now() - 45 * 60 * 1000), // 45min atrás
                read: false,
                priority: 'high',
                icon: '💧',
                action: 'view_analysis',
                data: { analysisId: 'analysis_789' }
            },
            {
                id: 'verde_1',
                type: 'verde',
                title: 'Alerta Verde',
                message: 'Pragas detetadas no jardim de Ana Ferreira',
                timestamp: new Date(Date.now() - 90 * 60 * 1000), // 1.5h atrás
                read: true,
                priority: 'high',
                icon: '🌱',
                action: 'view_alert',
                data: { alertId: 'alert_456' }
            },
            {
                id: 'phyto_1',
                type: 'phyto',
                title: 'Relatório Phyto',
                message: 'Relatório mensal de fitossanitários disponível',
                timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 24h atrás
                read: false,
                priority: 'medium',
                icon: '🧪',
                action: 'view_report',
                data: { reportId: 'report_123' }
            },
            // Notificações de tarefas
            {
                id: 'task_1',
                type: 'task',
                title: 'Tarefa Pendente',
                message: 'Visita agendada para amanhã às 14:00',
                timestamp: new Date(Date.now() - 20 * 60 * 1000), // 20min atrás
                read: false,
                priority: 'high',
                icon: '📋',
                action: 'view_task',
                data: { taskId: 'task_789' }
            }
        ];

        setNotifications(notificationsList);
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadActivities();
        loadNotifications();
        setRefreshing(false);
    };

    const filteredNotifications = notifications.filter(notification => {
        if (selectedFilter === 'all') return true;
        if (selectedFilter === 'unread') return !notification.read;
        return notification.type === selectedFilter;
    });

    const unreadCount = notifications.filter(n => !n.read).length;

    const handleNotificationPress = async (notification) => {
        if (!notification.read) {
            // Marcar como lida
            setNotifications(prev =>
                prev.map(n =>
                    n.id === notification.id ? { ...n, read: true } : n
                )
            );
        }

        // Executar ação baseada no tipo
        switch (notification.action) {
            case 'view_client':
                Alert.alert('Navegar', 'Navegar para detalhes do cliente');
                break;
            case 'view_analysis':
                Alert.alert('Navegar', 'Navegar para análise');
                break;
            case 'view_alert':
                Alert.alert('Navegar', 'Navegar para alerta');
                break;
            case 'view_report':
                Alert.alert('Navegar', 'Navegar para relatório');
                break;
            case 'view_task':
                Alert.alert('Navegar', 'Navegar para tarefa');
                break;
            case 'update':
                Alert.alert('Atualização', 'Iniciar atualização do sistema?');
                break;
            default:
                // Sem ação específica
                break;
        }
    };

    const handleMarkAllAsRead = () => {
        setNotifications(prev =>
            prev.map(n => ({ ...n, read: true }))
        );
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'high': return '#f44336';
            case 'medium': return '#ff9800';
            case 'low': return '#4caf50';
            default: return '#666';
        }
    };

    const getTypeColor = (type) => {
        switch (type) {
            case 'aqua': return '#1e88e5';
            case 'verde': return '#4caf50';
            case 'phyto': return '#ff9800';
            case 'client': return '#9c27b0';
            case 'task': return '#673ab7';
            case 'system': return '#607d8b';
            default: return '#666';
        }
    };

    const formatTimestamp = (timestamp) => {
        const now = new Date();
        const diff = now - timestamp;
        const minutes = Math.floor(diff / (1000 * 60));
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));

        if (minutes < 60) {
            return `${minutes}min atrás`;
        } else if (hours < 24) {
            return `${hours}h atrás`;
        } else {
            return `${days}d atrás`;
        }
    };

    const renderNotification = (notification) => (
        <TouchableOpacity
            key={notification.id}
            style={[
                styles.notificationCard,
                !notification.read && styles.notificationUnread
            ]}
            onPress={() => handleNotificationPress(notification)}
        >
            <View style={styles.notificationHeader}>
                <View style={styles.notificationIcon}>
                    <Text style={styles.iconText}>{notification.icon}</Text>
                </View>
                <View style={styles.notificationContent}>
                    <Text style={styles.notificationTitle}>{notification.title}</Text>
                    <Text style={styles.notificationMessage}>{notification.message}</Text>
                    <Text style={styles.notificationTime}>
                        {formatTimestamp(notification.timestamp)}
                    </Text>
                </View>
                <View style={styles.notificationMeta}>
                    <View style={[
                        styles.priorityDot,
                        { backgroundColor: getPriorityColor(notification.priority) }
                    ]} />
                    {!notification.read && <View style={styles.unreadDot} />}
                </View>
            </View>

            {notification.action && (
                <View style={styles.notificationActions}>
                    <TouchableOpacity
                        style={[
                            styles.actionButton,
                            { backgroundColor: `${getTypeColor(notification.type)}20` }
                        ]}
                        onPress={() => handleNotificationPress(notification)}
                    >
                        <Text style={[
                            styles.actionButtonText,
                            { color: getTypeColor(notification.type) }
                        ]}>
                            {notification.action === 'view_client' && 'Ver Cliente'}
                            {notification.action === 'view_analysis' && 'Ver Análise'}
                            {notification.action === 'view_alert' && 'Ver Alerta'}
                            {notification.action === 'view_report' && 'Ver Relatório'}
                            {notification.action === 'view_task' && 'Ver Tarefa'}
                            {notification.action === 'update' && 'Atualizar'}
                            {!['view_client', 'view_analysis', 'view_alert', 'view_report', 'view_task', 'update'].includes(notification.action) && 'Ver Detalhes'}
                        </Text>
                    </TouchableOpacity>
                </View>
            )}
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#1565C0" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={onBack}>
                    <Text style={styles.backIcon}>‹</Text>
                </TouchableOpacity>
                <View style={styles.headerCenter}>
                    <Text style={styles.headerTitle}>Notificações</Text>
                    {unreadCount > 0 && (
                        <View style={styles.badgeContainer}>
                            <Text style={styles.badgeText}>{unreadCount}</Text>
                        </View>
                    )}
                </View>
                <TouchableOpacity
                    style={styles.markAllButton}
                    onPress={handleMarkAllAsRead}
                >
                    <Text style={styles.markAllText}>✓</Text>
                </TouchableOpacity>
            </View>

            {/* Filters */}
            <View style={styles.filtersContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {[
                        { id: 'all', label: 'Todas', icon: '📋' },
                        { id: 'unread', label: 'Não Lidas', icon: '🔴' },
                        { id: 'system', label: 'Sistema', icon: '⚙️' },
                        { id: 'client', label: 'Clientes', icon: '👤' },
                        { id: 'aqua', label: 'Aqua', icon: '💧' },
                        { id: 'verde', label: 'Verde', icon: '🌱' },
                        { id: 'phyto', label: 'Phyto', icon: '🧪' },
                        { id: 'task', label: 'Tarefas', icon: '📋' }
                    ].map((filter) => (
                        <TouchableOpacity
                            key={filter.id}
                            style={[
                                styles.filterChip,
                                selectedFilter === filter.id && styles.filterChipActive
                            ]}
                            onPress={() => setSelectedFilter(filter.id)}
                        >
                            <Text style={styles.filterIcon}>{filter.icon}</Text>
                            <Text style={[
                                styles.filterText,
                                selectedFilter === filter.id && styles.filterTextActive
                            ]}>
                                {filter.label}
                            </Text>
                            {filter.id === 'unread' && unreadCount > 0 && (
                                <View style={styles.filterBadge}>
                                    <Text style={styles.filterBadgeText}>{unreadCount}</Text>
                                </View>
                            )}
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {/* Notifications List */}
            <ScrollView
                style={styles.notificationsList}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
                showsVerticalScrollIndicator={false}
            >
                {filteredNotifications.length > 0 ? (
                    filteredNotifications.map(renderNotification)
                ) : (
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyIcon}>🔔</Text>
                        <Text style={styles.emptyTitle}>Nenhuma notificação</Text>
                        <Text style={styles.emptyText}>
                            {selectedFilter === 'unread'
                                ? 'Todas as notificações foram lidas'
                                : 'Não há notificações para mostrar'
                            }
                        </Text>
                    </View>
                )}
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
    headerCenter: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
    },
    badgeContainer: {
        backgroundColor: '#f44336',
        borderRadius: 10,
        paddingHorizontal: 6,
        paddingVertical: 2,
        marginLeft: 8,
        minWidth: 20,
        alignItems: 'center',
    },
    badgeText: {
        fontSize: 12,
        color: '#fff',
        fontWeight: 'bold',
    },
    markAllButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    markAllText: {
        fontSize: 16,
        color: '#fff',
        fontWeight: 'bold',
    },
    filtersContainer: {
        backgroundColor: '#fff',
        paddingVertical: 15,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    filterChip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        marginRight: 10,
    },
    filterChipActive: {
        backgroundColor: '#1e88e5',
    },
    filterIcon: {
        fontSize: 12,
        marginRight: 5,
    },
    filterText: {
        fontSize: 12,
        color: '#666',
        fontWeight: '500',
    },
    filterTextActive: {
        color: '#fff',
    },
    filterBadge: {
        backgroundColor: '#f44336',
        borderRadius: 8,
        paddingHorizontal: 4,
        paddingVertical: 1,
        marginLeft: 5,
        minWidth: 16,
        alignItems: 'center',
    },
    filterBadgeText: {
        fontSize: 10,
        color: '#fff',
        fontWeight: 'bold',
    },
    notificationsList: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 15,
    },
    notificationCard: {
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
    notificationUnread: {
        borderLeftWidth: 4,
        borderLeftColor: '#1e88e5',
        backgroundColor: '#f8f9ff',
    },
    notificationHeader: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    notificationIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#f5f5f5',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    iconText: {
        fontSize: 16,
    },
    notificationContent: {
        flex: 1,
    },
    notificationTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 5,
    },
    notificationMessage: {
        fontSize: 12,
        color: '#666',
        lineHeight: 16,
        marginBottom: 5,
    },
    notificationTime: {
        fontSize: 10,
        color: '#999',
    },
    notificationMeta: {
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 40,
    },
    priorityDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    unreadDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#1e88e5',
        marginTop: 5,
    },
    notificationActions: {
        marginTop: 10,
        paddingTop: 10,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
    },
    actionButton: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 6,
        alignSelf: 'flex-start',
    },
    actionButtonText: {
        fontSize: 12,
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
        lineHeight: 20,
    },
});
