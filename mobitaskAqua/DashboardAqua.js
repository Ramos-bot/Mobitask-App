import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import ResumoAlertas from './ResumoAlertas';

export default function DashboardAqua({ setEcrã }) {
    return (
        <View style={styles.container}>
            <Text style={styles.header}>💧 Mobitask Aqua</Text>
            <Text style={styles.subtitle}>Módulo de Gestão de Piscinas</Text>

            <ResumoAlertas onVerDetalhes={() => setEcrã('alertas')} />

            <TouchableOpacity style={styles.botao} onPress={() => setEcrã('nova')}>
                <Text style={styles.texto}>🧪 Nova Análise Manual</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.botao} onPress={() => setEcrã('imagem')}>
                <Text style={styles.texto}>📸 Análise por Imagem</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.botao} onPress={() => setEcrã('historico')}>
                <Text style={styles.texto}>📖 Ver Histórico</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.botao, styles.botaoAlertas]} onPress={() => setEcrã('alertas')}>
                <Text style={styles.texto}>🔔 Gestão de Alertas</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingTop: 80,
        paddingHorizontal: 20,
        backgroundColor: '#f0faff',
        flex: 1,
        alignItems: 'center',
    },
    header: {
        fontSize: 26,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#1e88e5',
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        marginBottom: 30,
        color: '#555',
        textAlign: 'center',
    },
    botao: {
        backgroundColor: '#1e88e5',
        padding: 15,
        width: '100%',
        borderRadius: 10,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    botaoAlertas: {
        backgroundColor: '#ff9800',
    },
    texto: {
        color: '#fff',
        fontSize: 16,
        textAlign: 'center',
        fontWeight: 'bold',
    },
});
