import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { db } from '../firebaseConfig';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';

export default function ResumoAlertas({ onVerDetalhes }) {
    const [alertas, setAlertas] = useState({
        clientesEmAtraso: 0,
        clientesCriticos: 0,
        loading: true
    });

    useEffect(() => {
        verificarAlertas();
    }, []);

    const verificarAlertas = async () => {
        try {
            const q = query(collection(db, 'analisesPiscina'), orderBy('data', 'desc'));
            const snapshot = await getDocs(q);
            const analises = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));

            // Agrupar por cliente
            const clientesMap = new Map();

            analises.forEach(analise => {
                if (analise.cliente) {
                    const clienteNome = analise.cliente.toLowerCase();

                    if (!clientesMap.has(clienteNome) ||
                        analise.data?.toDate() > clientesMap.get(clienteNome).ultimaAnalise) {

                        const diasAtraso = calcularDiasAtraso(analise.data?.toDate());
                        clientesMap.set(clienteNome, {
                            nome: analise.cliente,
                            ultimaAnalise: analise.data?.toDate(),
                            diasAtraso
                        });
                    }
                }
            });

            const clientes = Array.from(clientesMap.values());
            const emAtraso = clientes.filter(c => c.diasAtraso > 30).length;
            const criticos = clientes.filter(c => c.diasAtraso > 60).length;

            setAlertas({
                clientesEmAtraso: emAtraso,
                clientesCriticos: criticos,
                loading: false
            });

        } catch (error) {
            console.error('Erro ao verificar alertas:', error);
            setAlertas({
                clientesEmAtraso: 0,
                clientesCriticos: 0,
                loading: false
            });
        }
    };

    const calcularDiasAtraso = (dataAnalise) => {
        if (!dataAnalise) return 999;
        const hoje = new Date();
        const diferenca = hoje.getTime() - dataAnalise.getTime();
        return Math.floor(diferenca / (1000 * 60 * 60 * 24));
    };

    if (alertas.loading) {
        return (
            <View style={styles.container}>
                <Text style={styles.titulo}>🔔 Alertas</Text>
                <Text style={styles.loading}>Carregando...</Text>
            </View>
        );
    }

    if (alertas.clientesEmAtraso === 0) {
        return (
            <View style={[styles.container, styles.semAlertas]}>
                <Text style={styles.titulo}>✅ Alertas</Text>
                <Text style={styles.mensagemSucesso}>
                    Todos os clientes em dia!
                </Text>
            </View>
        );
    }

    return (
        <TouchableOpacity
            style={[styles.container, styles.comAlertas]}
            onPress={onVerDetalhes}
        >
            <View style={styles.header}>
                <Text style={styles.titulo}>🔔 Alertas</Text>
                {alertas.clientesCriticos > 0 && (
                    <View style={styles.badgeCritico}>
                        <Text style={styles.badgeTexto}>!</Text>
                    </View>
                )}
            </View>

            <View style={styles.conteudo}>
                <Text style={styles.numeroAlertas}>
                    {alertas.clientesEmAtraso}
                </Text>
                <Text style={styles.textoAlertas}>
                    cliente{alertas.clientesEmAtraso !== 1 ? 's' : ''} em atraso
                </Text>

                {alertas.clientesCriticos > 0 && (
                    <Text style={styles.textoCriticos}>
                        {alertas.clientesCriticos} crítico{alertas.clientesCriticos !== 1 ? 's' : ''} (+60 dias)
                    </Text>
                )}
            </View>

            <Text style={styles.verMais}>Tocar para ver detalhes →</Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#fff',
        borderRadius: 15,
        padding: 20,
        marginVertical: 10,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    semAlertas: {
        borderLeftWidth: 4,
        borderLeftColor: '#4caf50',
    },
    comAlertas: {
        borderLeftWidth: 4,
        borderLeftColor: '#ff9800',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    titulo: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    badgeCritico: {
        backgroundColor: '#f44336',
        borderRadius: 12,
        width: 24,
        height: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    badgeTexto: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
    },
    loading: {
        color: '#666',
        fontStyle: 'italic',
    },
    mensagemSucesso: {
        color: '#4caf50',
        fontSize: 16,
        fontWeight: '500',
    },
    conteudo: {
        alignItems: 'center',
    },
    numeroAlertas: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#ff9800',
        marginBottom: 5,
    },
    textoAlertas: {
        fontSize: 14,
        color: '#666',
        marginBottom: 10,
    },
    textoCriticos: {
        fontSize: 12,
        color: '#f44336',
        fontWeight: 'bold',
        backgroundColor: '#ffebee',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    verMais: {
        fontSize: 12,
        color: '#1e88e5',
        textAlign: 'center',
        marginTop: 10,
        fontStyle: 'italic',
    },
});
