import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';

export default function PesquisaCliente({ onPesquisar }) {
    const [termoPesquisa, setTermoPesquisa] = useState('');

    const handlePesquisa = (texto) => {
        setTermoPesquisa(texto);
        onPesquisar(texto);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.label}>🔍 Pesquisar Cliente:</Text>
            <TextInput
                style={styles.input}
                value={termoPesquisa}
                onChangeText={handlePesquisa}
                placeholder="Digite o nome do cliente..."
                placeholderTextColor="#999"
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 20,
    },
    label: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#555',
        marginBottom: 8,
    },
    input: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#e1f5fe',
        borderRadius: 10,
        paddingHorizontal: 15,
        paddingVertical: 12,
        fontSize: 16,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
});
