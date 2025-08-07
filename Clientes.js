import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';

const clientes = [
    { nome: 'Dona Adelaide', localidade: 'Lourinhã', tipo: 'Jardim e Piscina' },
    { nome: 'Sr. Rui', localidade: 'Praia da Areia Branca', tipo: 'Piscina' },
    { nome: 'Casa do Pinhal', localidade: 'Moita dos Ferreiros', tipo: 'Jardim' }
];

export default function Clientes() {
    return (
        <View style={styles.container}>
            <Text style={styles.header}>👥 Lista de Clientes</Text>

            <ScrollView>
                {clientes.map((cliente, index) => (
                    <View key={index} style={styles.card}>
                        <Text style={styles.nome}>{cliente.nome}</Text>
                        <Text style={styles.localidade}>📍 {cliente.localidade}</Text>
                        <Text style={styles.tipo}>🛠️ {cliente.tipo}</Text>
                    </View>
                ))}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 60,
        paddingHorizontal: 20,
        backgroundColor: '#f7f7f7',
    },
    header: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#2e7d32',
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
    nome: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    localidade: {
        fontSize: 14,
        color: '#555',
        marginTop: 5,
    },
    tipo: {
        fontSize: 14,
        color: '#2e7d32',
        marginTop: 3,
    },
});
