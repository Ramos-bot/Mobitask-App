import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import { db } from '../firebaseConfig';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import PesquisaCliente from './PesquisaCliente';

export default function HistoricoAnalises({ setEcrã, setAnaliseSelecionada, setEcrãDetalhes }) {
    const [registos, setRegistos] = useState([]);
    const [registosFiltrados, setRegistosFiltrados] = useState([]);
    const [termoPesquisa, setTermoPesquisa] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            const q = query(collection(db, 'analisesPiscina'), orderBy('data', 'desc'));
            const snapshot = await getDocs(q);
            const dados = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
            setRegistos(dados);
            setRegistosFiltrados(dados);
        };

        fetchData();
    }, []);

    const handlePesquisar = (termo) => {
        setTermoPesquisa(termo);
        if (termo.trim() === '') {
            setRegistosFiltrados(registos);
        } else {
            const filtrados = registos.filter(analise =>
                analise.cliente &&
                analise.cliente.toLowerCase().includes(termo.toLowerCase())
            );
            setRegistosFiltrados(filtrados);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.header}>📖 Histórico de Análises</Text>

            <PesquisaCliente onPesquisar={handlePesquisar} />

            {termoPesquisa && (
                <Text style={styles.resultadoPesquisa}>
                    {registosFiltrados.length} resultado(s) para "{termoPesquisa}"
                </Text>
            )}

            <ScrollView>
                {registosFiltrados.map((a) => (
                    <View key={a.id} style={styles.card}>
                        <Text style={styles.data}>📅 {a.data?.toDate().toLocaleDateString() || 'Data desconhecida'}</Text>
                        {a.cliente && <Text style={styles.cliente}>👤 Cliente: {a.cliente}</Text>}
                        {a.imageUrl && (
                            <Image source={{ uri: a.imageUrl }} style={styles.imagem} />
                        )}
                        <Text>💧 Cloro: {a.cloroAtual} ppm</Text>
                        <Text>🧪 pH: {a.phAtual}</Text>
                        <Text>📦 Volume: {a.volume} m³</Text>
                        <Text>🧮 Dose Cloro: {a.cloroDose} g</Text>
                        <Text>🧮 Dose pH: {a.phDose} g</Text>

                        <TouchableOpacity
                            style={styles.botaoDetalhes}
                            onPress={() => {
                                setAnaliseSelecionada(a);
                                setEcrãDetalhes();
                            }}
                        >
                            <Text style={styles.textoBotao}>📋 Ver Detalhes</Text>
                        </TouchableOpacity>
                    </View>
                ))}
            </ScrollView>

            <View style={{ padding: 20, alignItems: 'center' }}>
                <TouchableOpacity
                    style={styles.botaoVoltar}
                    onPress={() => setEcrã('dashboard')}
                >
                    <Text style={styles.textoBotaoVoltar}>← Voltar ao Dashboard</Text>
                </TouchableOpacity>
            </View>
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
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 15,
        marginBottom: 15,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    data: {
        fontWeight: 'bold',
        marginBottom: 5,
        color: '#555',
    },
    cliente: {
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#2e7d32',
    },
    imagem: {
        width: '100%',
        height: 150,
        borderRadius: 10,
        marginBottom: 10,
        resizeMode: 'cover',
    },
    botaoDetalhes: {
        backgroundColor: '#1e88e5',
        borderRadius: 8,
        padding: 12,
        marginTop: 10,
        alignItems: 'center',
    },
    textoBotao: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 14,
    },
    resultadoPesquisa: {
        fontSize: 14,
        color: '#666',
        fontStyle: 'italic',
        marginBottom: 15,
        textAlign: 'center',
    },
    botaoVoltar: {
        backgroundColor: '#666',
        borderRadius: 8,
        padding: 12,
        minWidth: 200,
        alignItems: 'center',
    },
    textoBotaoVoltar: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 14,
    },
});