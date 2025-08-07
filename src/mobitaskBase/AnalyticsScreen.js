import React, { useState, useEffect } from 'react';
import {
    View, Text, ScrollView, TouchableOpacity, StyleSheet,
    StatusBar, Dimensions, RefreshControl
} from 'react-native';
import { useApp } from '../shared/context/AppContext';

const { width } = Dimensions.get('window');

export default function AnalyticsScreen({ user, onBack, onNavigate }) {
    const {
        clients,
        loadClients,
        activities,
        loading
    } = useApp();

    const [selectedPeriod, setSelectedPeriod] = useState('month');
    const [selectedModule, setSelectedModule] = useState('all');
    const [refreshing, setRefreshing] = useState(false);
    const [analytics, setAnalytics] = useState({
        clients: {},
        revenue: {},
        activities: {},
        performance: {}
    });

    useEffect(() => {
        calculateAnalytics();
    }, [clients, activities, selectedPeriod, selectedModule]);

    const onRefresh = async () => {
        setRefreshing(true);
        await loadClients();
        calculateAnalytics();
        setRefreshing(false);
    };

    const calculateAnalytics = () => {
        const now = new Date();
        const periodData = getPeriodData(now, selectedPeriod);

        // Analytics de clientes
        const clientsAnalytics = {
            total: clients.length,
            active: clients.filter(c => c.status === 'active').length,
            byModule: {
                aqua: clients.filter(c => c.services?.aqua?.active).length,
                verde: clients.filter(c => c.services?.verde?.active).length,
                phyto: clients.filter(c => c.services?.phyto?.active).length
            },
            newThisPeriod: clients.filter(c =>
                new Date(c.createdAt) >= periodData.start
            ).length
        };

        // Analytics de receita (simulado)
        const revenueAnalytics = {
            total: clientsAnalytics.active * 150, // €150 por cliente ativo
            byModule: {
                aqua: clientsAnalytics.byModule.aqua * 80,
                verde: clientsAnalytics.byModule.verde * 60,
                phyto: clientsAnalytics.byModule.phyto * 120
            },
            growth: 12.5 // % crescimento
        };

        // Analytics de atividades
        const activitiesAnalytics = {
            total: activities.length,
            thisPeriod: activities.filter(a =>
                new Date(a.timestamp) >= periodData.start
            ).length,
            byType: activities.reduce((acc, activity) => {
                acc[activity.type] = (acc[activity.type] || 0) + 1;
                return acc;
            }, {}),
            byModule: activities.reduce((acc, activity) => {
                acc[activity.module] = (acc[activity.module] || 0) + 1;
                return acc;
            }, {})
        };

        // Analytics de performance
        const performanceAnalytics = {
            clientSatisfaction: 4.7, // Nota média
            responseTime: 2.3, // horas
            completionRate: 94.2, // %
            modulePerformance: {
                aqua: { satisfaction: 4.8, completion: 96 },
                verde: { satisfaction: 4.6, completion: 92 },
                phyto: { satisfaction: 4.7, completion: 95 }
            }
        };

        setAnalytics({
            clients: clientsAnalytics,
            revenue: revenueAnalytics,
            activities: activitiesAnalytics,
            performance: performanceAnalytics
        });
    };

    const getPeriodData = (date, period) => {
        const start = new Date(date);

        switch (period) {
            case 'week':
                start.setDate(date.getDate() - 7);
                break;
            case 'month':
                start.setMonth(date.getMonth() - 1);
                break;
            case 'quarter':
                start.setMonth(date.getMonth() - 3);
                break;
            case 'year':
                start.setFullYear(date.getFullYear() - 1);
                break;
            default:
                start.setMonth(date.getMonth() - 1);
        }

        return { start, end: date };
    };

    const renderKPICard = (title, value, change, icon, color) => (
        <View style={[styles.kpiCard, { borderLeftColor: color }]}>
            <View style={styles.kpiHeader}>
                <Text style={styles.kpiIcon}>{icon}</Text>
                <Text style={styles.kpiTitle}>{title}</Text>
            </View>
            <Text style={styles.kpiValue}>{value}</Text>
            {change !== undefined && (
                <Text style={[
                    styles.kpiChange,
                    { color: change >= 0 ? '#4caf50' : '#f44336' }
                ]}>
                    {change >= 0 ? '↗' : '↘'} {Math.abs(change)}%
                </Text>
            )}
        </View>
    );

    const renderChart = (title, data, type = 'bar') => (
        <View style={styles.chartCard}>
            <Text style={styles.chartTitle}>{title}</Text>
            <View style={styles.chartContainer}>
                {type === 'bar' && renderBarChart(data)}
                {type === 'pie' && renderPieChart(data)}
                {type === 'line' && renderLineChart(data)}
            </View>
        </View>
    );

    const renderBarChart = (data) => {
        const maxValue = Math.max(...Object.values(data));

        return (
            <View style={styles.barChart}>
                {Object.entries(data).map(([key, value], index) => (
                    <View key={index} style={styles.barItem}>
                        <View style={styles.barColumn}>
                            <View
                                style={[
                                    styles.bar,
                                    {
                                        height: `${(value / maxValue) * 100}%`,
                                        backgroundColor: getModuleColor(key)
                                    }
                                ]}
                            />
                        </View>
                        <Text style={styles.barLabel}>{key}</Text>
                        <Text style={styles.barValue}>{value}</Text>
                    </View>
                ))}
            </View>
        );
    };

    const renderPieChart = (data) => {
        const total = Object.values(data).reduce((sum, val) => sum + val, 0);

        return (
            <View style={styles.pieChart}>
                {Object.entries(data).map(([key, value], index) => {
                    const percentage = ((value / total) * 100).toFixed(1);

                    return (
                        <View key={index} style={styles.pieItem}>
                            <View style={[
                                styles.pieDot,
                                { backgroundColor: getModuleColor(key) }
                            ]} />
                            <Text style={styles.pieLabel}>{key}</Text>
                            <Text style={styles.pieValue}>{percentage}%</Text>
                        </View>
                    );
                })}
            </View>
        );
    };

    const renderLineChart = (data) => (
        <View style={styles.lineChart}>
            <Text style={styles.chartPlaceholder}>
                📈 Gráfico de linha será implementado
            </Text>
        </View>
    );

    const getModuleColor = (module) => {
        switch (module.toLowerCase()) {
            case 'aqua': return '#1e88e5';
            case 'verde': return '#4caf50';
            case 'phyto': return '#ff9800';
            default: return '#666';
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#1565C0" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={onBack}>
                    <Text style={styles.backIcon}>‹</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Analytics</Text>
                <View style={styles.headerRight} />
            </View>

            {/* Period Selector */}
            <View style={styles.periodSelector}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {['week', 'month', 'quarter', 'year'].map((period) => (
                        <TouchableOpacity
                            key={period}
                            style={[
                                styles.periodButton,
                                selectedPeriod === period && styles.periodButtonActive
                            ]}
                            onPress={() => setSelectedPeriod(period)}
                        >
                            <Text style={[
                                styles.periodText,
                                selectedPeriod === period && styles.periodTextActive
                            ]}>
                                {period === 'week' && 'Semana'}
                                {period === 'month' && 'Mês'}
                                {period === 'quarter' && 'Trimestre'}
                                {period === 'year' && 'Ano'}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            <ScrollView
                style={styles.content}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
                showsVerticalScrollIndicator={false}
            >
                {/* KPI Cards */}
                <View style={styles.kpiSection}>
                    <View style={styles.kpiRow}>
                        {renderKPICard(
                            'Clientes Ativos',
                            analytics.clients.active?.toString() || '0',
                            8.5,
                            '👥',
                            '#1e88e5'
                        )}
                        {renderKPICard(
                            'Receita Mensal',
                            `€${analytics.revenue.total?.toLocaleString() || '0'}`,
                            analytics.revenue.growth,
                            '💰',
                            '#4caf50'
                        )}
                    </View>
                    <View style={styles.kpiRow}>
                        {renderKPICard(
                            'Atividades',
                            analytics.activities.thisPeriod?.toString() || '0',
                            15.3,
                            '📊',
                            '#ff9800'
                        )}
                        {renderKPICard(
                            'Satisfação',
                            `${analytics.performance.clientSatisfaction || 0}/5`,
                            2.1,
                            '⭐',
                            '#9c27b0'
                        )}
                    </View>
                </View>

                {/* Charts Section */}
                <View style={styles.chartsSection}>
                    {renderChart(
                        'Clientes por Módulo',
                        analytics.clients.byModule || {},
                        'bar'
                    )}

                    {renderChart(
                        'Receita por Módulo',
                        analytics.revenue.byModule || {},
                        'pie'
                    )}

                    {renderChart(
                        'Atividades por Tipo',
                        analytics.activities.byType || {},
                        'bar'
                    )}
                </View>

                {/* Performance Metrics */}
                <View style={styles.performanceSection}>
                    <Text style={styles.sectionTitle}>Performance dos Módulos</Text>

                    {Object.entries(analytics.performance.modulePerformance || {}).map(([module, data]) => (
                        <View key={module} style={styles.modulePerformance}>
                            <View style={styles.moduleHeader}>
                                <Text style={styles.moduleIcon}>
                                    {module === 'aqua' && '💧'}
                                    {module === 'verde' && '🌱'}
                                    {module === 'phyto' && '🧪'}
                                </Text>
                                <Text style={styles.moduleName}>
                                    Mobitask {module.charAt(0).toUpperCase() + module.slice(1)}
                                </Text>
                            </View>

                            <View style={styles.moduleMetrics}>
                                <View style={styles.metric}>
                                    <Text style={styles.metricLabel}>Satisfação</Text>
                                    <Text style={styles.metricValue}>{data.satisfaction}/5</Text>
                                </View>
                                <View style={styles.metric}>
                                    <Text style={styles.metricLabel}>Conclusão</Text>
                                    <Text style={styles.metricValue}>{data.completion}%</Text>
                                </View>
                            </View>

                            <View style={styles.progressBar}>
                                <View
                                    style={[
                                        styles.progressFill,
                                        {
                                            width: `${data.completion}%`,
                                            backgroundColor: getModuleColor(module)
                                        }
                                    ]}
                                />
                            </View>
                        </View>
                    ))}
                </View>

                {/* Summary */}
                <View style={styles.summarySection}>
                    <Text style={styles.sectionTitle}>Resumo Executivo</Text>

                    <View style={styles.summaryCard}>
                        <Text style={styles.summaryText}>
                            📈 <Text style={styles.summaryBold}>Crescimento:</Text> A base de clientes
                            cresceu {analytics.clients.newThisPeriod} novos clientes este período.
                        </Text>

                        <Text style={styles.summaryText}>
                            💰 <Text style={styles.summaryBold}>Receita:</Text> Mobitask Aqua é o módulo
                            com maior receita (€{analytics.revenue.byModule?.aqua?.toLocaleString() || 0}).
                        </Text>

                        <Text style={styles.summaryText}>
                            ⚡ <Text style={styles.summaryBold}>Performance:</Text> Tempo médio de resposta
                            de {analytics.performance.responseTime}h com {analytics.performance.completionRate}%
                            de taxa de conclusão.
                        </Text>
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
    periodSelector: {
        backgroundColor: '#fff',
        paddingVertical: 15,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    periodButton: {
        paddingHorizontal: 20,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#f5f5f5',
        marginRight: 10,
    },
    periodButtonActive: {
        backgroundColor: '#1e88e5',
    },
    periodText: {
        fontSize: 14,
        color: '#666',
        fontWeight: '500',
    },
    periodTextActive: {
        color: '#fff',
    },
    content: {
        flex: 1,
        padding: 20,
    },
    kpiSection: {
        marginBottom: 20,
    },
    kpiRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 15,
    },
    kpiCard: {
        flex: 1,
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 15,
        marginHorizontal: 5,
        borderLeftWidth: 4,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    kpiHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    kpiIcon: {
        fontSize: 20,
        marginRight: 8,
    },
    kpiTitle: {
        fontSize: 12,
        color: '#666',
        fontWeight: '500',
        flex: 1,
    },
    kpiValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 5,
    },
    kpiChange: {
        fontSize: 12,
        fontWeight: '600',
    },
    chartsSection: {
        marginBottom: 20,
    },
    chartCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 20,
        marginBottom: 15,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    chartTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 15,
    },
    chartContainer: {
        height: 150,
    },
    barChart: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'space-around',
        height: '100%',
        paddingBottom: 30,
    },
    barItem: {
        alignItems: 'center',
        flex: 1,
    },
    barColumn: {
        flex: 1,
        width: 30,
        justifyContent: 'flex-end',
    },
    bar: {
        width: '100%',
        minHeight: 5,
        borderRadius: 2,
    },
    barLabel: {
        fontSize: 10,
        color: '#666',
        marginTop: 5,
        textAlign: 'center',
    },
    barValue: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#333',
        marginTop: 2,
    },
    pieChart: {
        flex: 1,
        justifyContent: 'center',
    },
    pieItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    pieDot: {
        width: 16,
        height: 16,
        borderRadius: 8,
        marginRight: 10,
    },
    pieLabel: {
        flex: 1,
        fontSize: 14,
        color: '#333',
        textTransform: 'capitalize',
    },
    pieValue: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#333',
    },
    lineChart: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    chartPlaceholder: {
        fontSize: 14,
        color: '#999',
        fontStyle: 'italic',
    },
    performanceSection: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 15,
    },
    modulePerformance: {
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
    moduleHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
    },
    moduleIcon: {
        fontSize: 20,
        marginRight: 10,
    },
    moduleName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        flex: 1,
    },
    moduleMetrics: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 15,
    },
    metric: {
        alignItems: 'center',
        flex: 1,
    },
    metricLabel: {
        fontSize: 12,
        color: '#666',
        marginBottom: 5,
    },
    metricValue: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    progressBar: {
        height: 6,
        backgroundColor: '#f0f0f0',
        borderRadius: 3,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        borderRadius: 3,
    },
    summarySection: {
        marginBottom: 30,
    },
    summaryCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 20,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    summaryText: {
        fontSize: 14,
        color: '#666',
        lineHeight: 22,
        marginBottom: 15,
    },
    summaryBold: {
        fontWeight: 'bold',
        color: '#333',
    },
});
