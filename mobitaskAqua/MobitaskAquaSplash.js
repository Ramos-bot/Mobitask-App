import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';

export default function MobitaskAquaSplash({ onEntrar }) {
    return (
        <View style={styles.container}>
            <View style={styles.logoContainer}>
                <Text style={styles.logoEmoji}>💧</Text>
            </View>
            <Text style={styles.titulo}>Mobitask Aqua</Text>
            <Text style={styles.subtitulo}>Gestão inteligente de piscinas 💧</Text>
            <TouchableOpacity style={styles.botao} onPress={onEntrar}>
                <Text style={styles.botaoTexto}>Entrar</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#e3f2fd',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 30,
    },
    logoContainer: {
        width: 120,
        height: 120,
        backgroundColor: '#1e88e5',
        borderRadius: 60,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 30,
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowRadius: 10,
        elevation: 5,
    },
    logoEmoji: {
        fontSize: 60,
    },
    titulo: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#1e88e5',
        marginBottom: 10,
    },
    subtitulo: {
        fontSize: 16,
        color: '#555',
        marginBottom: 40,
        textAlign: 'center',
    },
    botao: {
        backgroundColor: '#1e88e5',
        paddingVertical: 12,
        paddingHorizontal: 40,
        borderRadius: 10,
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 3,
    },
    botaoTexto: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
