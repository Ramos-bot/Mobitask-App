import React, { useState } from 'react';
import { View, Text, Button, Image, StyleSheet, ScrollView, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

export default function AnalisePorImagem({ setEcrã }) {
    const [imagem, setImagem] = useState(null);
    const [resultado, setResultado] = useState(null);

    const escolherImagem = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            allowsEditing: true,
            quality: 1,
        });

        if (!result.canceled) {
            setImagem(result.assets[0].uri);

            // Simulação de análise
            setResultado({
                cloro: '0.7 ppm',
                ph: '6.9',
                cloroDose: '50 g',
                phDose: '20 g',
            });
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.header}>📸 Análise por Imagem</Text>

            <Button title="Selecionar Imagem da Tira de Teste" onPress={escolherImagem} color="#1e88e5" />

            {imagem && (
                <Image source={{ uri: imagem }} style={styles.imagem} />
            )}

            {resultado && (
                <View style={styles.resultado}>
                    <Text style={styles.resultadoTitulo}>📊 Resultado Simulado:</Text>
                    <Text>💧 Cloro: {resultado.cloro}</Text>
                    <Text>🧪 pH: {resultado.ph}</Text>
                    <Text>🧮 Dose Cloro: {resultado.cloroDose}</Text>
                    <Text>🧮 Dose pH: {resultado.phDose}</Text>
                </View>
            )}

            <View style={{ marginTop: 30, alignItems: 'center' }}>
                <Button
                    title="← Voltar ao Dashboard"
                    onPress={() => setEcrã('dashboard')}
                    color="#666"
                />
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingTop: 60,
        paddingHorizontal: 20,
        backgroundColor: '#f0faff',
        flexGrow: 1,
    },
    header: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#1e88e5',
    },
    imagem: {
        width: '100%',
        height: 200,
        resizeMode: 'contain',
        marginVertical: 20,
        borderRadius: 10,
    },
    resultado: {
        backgroundColor: '#e3f2fd',
        padding: 15,
        borderRadius: 10,
        marginTop: 10,
    },
    resultadoTitulo: {
        fontWeight: 'bold',
        marginBottom: 5,
    },
});
