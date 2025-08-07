import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { db } from '../firebaseConfig';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';

export default function AlertasClientes({ setEcrã }) {
    const [clientesEmAtraso, setClientesEmAtraso] = useState([]);
    const [estatisticas, setEstatisticas] = useState({
        totalClientes: 0,
        clientesEmAtraso: 0,
        clientesOk: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        verificarAtrasos();
    }, []);

    const verificarAtrasos = async () => {
        try {
            setLoading(true);

            // Buscar todas as análises
            const q = query(collection(db, 'analisesPiscina'), orderBy('data', 'desc'));
            const snapshot = await getDocs(q);
            const analises = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));

            // Agrupar por cliente e encontrar a análise mais recente
            const clientesMap = new Map();

            analises.forEach(analise => {
                if (analise.cliente) {
                    const clienteNome = analise.cliente.toLowerCase();

                    if (!clientesMap.has(clienteNome) ||
                        analise.data?.toDate() > clientesMap.get(clienteNome).ultimaAnalise) {
                        clientesMap.set(clienteNome, {
                            nome: analise.cliente,
                            ultimaAnalise: analise.data?.toDate(),
                            ultimaAnaliseId: analise.id,
                            diasAtraso: calcularDiasAtraso(analise.data?.toDate())
                        });
                    }
                }
            });

            // Filtrar clientes em atraso (mais de 30 dias)
            const clientes = Array.from(clientesMap.values());
            const emAtraso = clientes.filter(cliente => cliente.diasAtraso > 30);
            const emDia = clientes.filter(cliente => cliente.diasAtraso <= 30);

            setClientesEmAtraso(emAtraso.sort((a, b) => b.diasAtraso - a.diasAtraso));
            setEstatisticas({
                totalClientes: clientes.length,
                clientesEmAtraso: emAtraso.length,
                clientesOk: emDia.length
            });

        } catch (error) {
            console.error('Erro ao verificar atrasos:', error);
            Alert.alert('Erro', 'Falha ao carregar dados de clientes');
        } finally {
            setLoading(false);
        }
    };

    const calcularDiasAtraso = (dataAnalise) => {
        if (!dataAnalise) return 999; // Cliente sem análise

        const hoje = new Date();
        const diferenca = hoje.getTime() - dataAnalise.getTime();
        return Math.floor(diferenca / (1000 * 60 * 60 * 24));
    };

    const formatarDataUltimaAnalise = (data) => {
        if (!data) return 'Nunca';
        return data.toLocaleDateString();
    };

    const getCorPrioridade = (dias) => {
        if (dias > 60) return '#d32f2f'; // Vermelho - muito atrasado
        if (dias > 45) return '#f57c00'; // Laranja - atrasado
        if (dias > 30) return '#fbc02d'; // Amarelo - início do atraso
        return '#388e3c'; // Verde - em dia
    };

    const getIconePrioridade = (dias) => {
        if (dias > 60) return '🚨';
        if (dias > 45) return '⚠️';
        if (dias > 30) return '⏰';
        return '✅';
    };

    if (loading) {
        return (
            <View style={styles.container}>
                <Text style={styles.header}>🔔 Alertas de Clientes</Text>
                <Text style={styles.loading}>Carregando dados...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.header}>🔔 Alertas de Clientes</Text>

            {/* Resumo Estatísticas */}
            <View style={styles.estatisticasContainer}>
                <View style={styles.estatisticaItem}>
                    <Text style={styles.estatisticaNumero}>{estatisticas.totalClientes}</Text>
                    <Text style={styles.estatisticaLabel}>Total</Text>
                </View>
                <View style={[styles.estatisticaItem, { backgroundColor: '#ffebee' }]}>
                    <Text style={[styles.estatisticaNumero, { color: '#d32f2f' }]}>
                        {estatisticas.clientesEmAtraso}
                    </Text>
                    <Text style={styles.estatisticaLabel}>Em Atraso</Text>
                </View>
                <View style={[styles.estatisticaItem, { backgroundColor: '#e8f5e8' }]}>
                    <Text style={[styles.estatisticaNumero, { color: '#388e3c' }]}>
                        {estatisticas.clientesOk}
                    </Text>
                    <Text style={styles.estatisticaLabel}>Em Dia</Text>
                </View>
            </View>

            {clientesEmAtraso.length === 0 ? (
                <View style={styles.semAlertas}>
                    <Text style={styles.semAlertasTexto}>🎉 Parabéns!</Text>
                    <Text style={styles.semAlertasSubtexto}>
                        Todos os clientes estão com análises em dia!
                    </Text>
                </View>
            ) : (
                <ScrollView style={styles.listaAlertas}>
                    <Text style={styles.subHeader}>
                        ⚠️ Clientes que precisam de nova análise:
                    </Text>

                    {clientesEmAtraso.map((cliente, index) => (
                        <TouchableOpacity
                            key={index}
                            style={[
                                styles.alertaCard,
                                { borderLeftColor: getCorPrioridade(cliente.diasAtraso) }
                            ]}
                            onPress={() => {
                                Alert.alert(
                                    'Ação para Cliente',
                                    `${cliente.nome}\nÚltima análise: ${formatarDataUltimaAnalise(cliente.ultimaAnalise)}`,
                                    [
                                        { text: 'Cancelar', style: 'cancel' },
                                        {
                                            text: 'Nova Análise',
                                            onPress: () => {
                                                // Navegar para nova análise com cliente pré-preenchido
                                                if (navigation) {
                                                    // Implementar navegação para nova análise
                                                    console.log('Navegar para nova análise:', cliente.nome);
                                                }
                                            }
                                        }
                                    ]
                                );
                            }}
                        >
                            <View style={styles.alertaHeader}>
                                <Text style={styles.alertaIcon}>
                                    {getIconePrioridade(cliente.diasAtraso)}
                                </Text>
                                <Text style={styles.clienteNome}>{cliente.nome}</Text>
                            </View>

                            <Text style={styles.alertaDetalhes}>
                                Última análise: {formatarDataUltimaAnalise(cliente.ultimaAnalise)}
                            </Text>

                            <Text style={[
                                styles.alertaDias,
                                { color: getCorPrioridade(cliente.diasAtraso) }
                            ]}>
                                {cliente.diasAtraso} dias em atraso
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            )}

            <TouchableOpacity
                style={styles.botaoAtualizar}
                onPress={verificarAtrasos}
            >
                <Text style={styles.textoBotao}>🔄 Atualizar Alertas</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.botaoVoltar}
                onPress={() => setEcrã('dashboard')}
            >
                <Text style={styles.textoBotaoVoltar}>← Voltar ao Dashboard</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 60,
        paddingHorizontal: 20,
        backgroundColor: '#f0faff',
    },
    header: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1e88e5',
        marginBottom: 20,
        textAlign: 'center',
    },
    loading: {
        textAlign: 'center',
        fontSize: 16,
        color: '#666',
        marginTop: 50,
    },
    estatisticasContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 25,
    },
    estatisticaItem: {
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 15,
        alignItems: 'center',
        flex: 0.3,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    estatisticaNumero: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1e88e5',
    },
    estatisticaLabel: {
        fontSize: 12,
        color: '#666',
        marginTop: 5,
    },
    semAlertas: {
        backgroundColor: '#e8f5e8',
        borderRadius: 15,
        padding: 30,
        alignItems: 'center',
        marginTop: 50,
    },
    semAlertasTexto: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#388e3c',
        marginBottom: 10,
    },
    semAlertasSubtexto: {
        fontSize: 16,
        color: '#555',
        textAlign: 'center',
    },
    subHeader: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#555',
        marginBottom: 15,
    },
    listaAlertas: {
        flex: 1,
    },
    alertaCard: {
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 15,
        marginBottom: 10,
        borderLeftWidth: 4,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    alertaHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    alertaIcon: {
        fontSize: 20,
        marginRight: 10,
    },
    clienteNome: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        flex: 1,
    },
    alertaDetalhes: {
        fontSize: 14,
        color: '#666',
        marginBottom: 5,
    },
    alertaDias: {
        fontSize: 14,
        fontWeight: 'bold',
    },
    botaoAtualizar: {
        backgroundColor: '#1e88e5',
        borderRadius: 10,
        padding: 15,
        alignItems: 'center',
        marginTop: 15,
        marginBottom: 20,
    },
    textoBotao: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    botaoVoltar: {
        padding: 10,
        alignItems: 'center',
    },
    textoBotaoVoltar: {
        color: '#1e88e5',
        fontSize: 16,
    },
});
