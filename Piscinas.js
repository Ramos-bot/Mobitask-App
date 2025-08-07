import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, KeyboardAvoidingView, ScrollView } from 'react-native';

export default function Piscinas() {
    const [volume, setVolume] = useState('');
    const [cloroAtual, setCloroAtual] = useState('');
    const [phAtual, setPhAtual] = useState('');
    const [doses, setDoses] = useState(null);

    const calcularDoses = () => {
        const vol = parseFloat(volume);
        const cl = parseFloat(cloroAtual);
        const ph = parseFloat(phAtual);

        if (isNaN(vol) || isNaN(cl) || isNaN(ph)) return;

        // Exemplo simples de cálculo:
        const cloroNecessario = cl < 1.5 ? (1.5 - cl) * vol * 1.5 : 0;
        const phNecessario = ph < 7.2 ? (7.2 - ph) * vol * 0.4 : ph > 7.6 ? (ph - 7.6) * vol * 0.6 : 0;

        setDoses({
            cloro: cloroNecessario.toFixed(1),
            ph: phNecessario.toFixed(1),
        });
    };

    return (
        <KeyboardAvoidingView style={styles.container} behavior="padding">
            <ScrollView>
                <Text style={styles.header}>💧 Análise da Piscina</Text>

                <Text style={styles.label}>Volume da piscina (m³):</Text>
                <TextInput
                    style={styles.input}
                    keyboardType="numeric"
                    value={volume}
                    onChangeText={setVolume}
                    placeholder="Ex: 45"
                />

                <Text style={styles.label}>Cloro livre atual (ppm):</Text>
                <TextInput
                    style={styles.input}
                    keyboardType="numeric"
                    value={cloroAtual}
                    onChangeText={setCloroAtual}
                    placeholder="Ex: 0.8"
                />

                <Text style={styles.label}>pH atual:</Text>
                <TextInput
                    style={styles.input}
                    keyboardType="numeric"
                    value={phAtual}
                    onChangeText={setPhAtual}
                    placeholder="Ex: 7.0"
                />

                <Button title="Calcular Doses" onPress={calcularDoses} color="#2e7d32" />

                {doses && (
                    <View style={styles.resultado}>
                        <Text style={styles.resultadoTexto}>🔬 Doses recomendadas:</Text>
                        <Text>• Cloro: {doses.cloro} g</Text>
                        <Text>• Correção pH: {doses.ph} g (ajustável)</Text>
                    </View>
                )}
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f7f7f7',
        paddingTop: 60,
        paddingHorizontal: 20,
    },
    header: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#2e7d32',
    },
    label: {
        marginTop: 15,
        fontWeight: 'bold',
    },
    input: {
        backgroundColor: '#fff',
        padding: 10,
        borderRadius: 8,
        marginTop: 5,
    },
    resultado: {
        backgroundColor: '#e8f5e9',
        padding: 15,
        marginTop: 20,
        borderRadius: 10,
    },
    resultadoTexto: {
        fontWeight: 'bold',
        marginBottom: 5,
    },
});
