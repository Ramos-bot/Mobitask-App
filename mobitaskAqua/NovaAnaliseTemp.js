import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ScrollView, Alert, Image, TouchableOpacity } from 'react-native';
import { db } from '../firebaseConfig';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
// Comentado temporariamente até Storage estar ativo
// import { storage } from '../firebaseConfig';
// import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import * as ImagePicker from 'expo-image-picker';

export default function NovaAnaliseTemp() {
    const [volume, setVolume] = useState('');
    const [cloroAtual, setCloroAtual] = useState('');
    const [phAtual, setPhAtual] = useState('');
    const [nomeCliente, setNomeCliente] = useState('');
    const [imagemUri, setImagemUri] = useState(null);
    const [doses, setDoses] = useState(null);
    const [uploading, setUploading] = useState(false);

    const calcularDoses = () => {
        const vol = parseFloat(volume);
        const cl = parseFloat(cloroAtual);
        const ph = parseFloat(phAtual);

        if (isNaN(vol) || isNaN(cl) || isNaN(ph)) {
            Alert.alert('Erro', 'Preenche todos os campos corretamente.');
            return;
        }

        const cloroDose = cl < 1.5 ? (1.5 - cl) * vol * 1.5 : 0;
        const phDose = ph < 7.2 ? (7.2 - ph) * vol * 0.4 : ph > 7.6 ? (ph - 7.6) * vol * 0.6 : 0;

        setDoses({
            cloro: cloroDose.toFixed(1),
            ph: phDose.toFixed(1),
        });
    };

    const selecionarImagem = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.8,
        });

        if (!result.cancelled && result.assets && result.assets[0]) {
            setImagemUri(result.assets[0].uri);
        }
    };

    const guardarAnalise = async () => {
        if (!nomeCliente.trim()) {
            Alert.alert('Erro', 'Nome do cliente é obrigatório');
            return;
        }

        try {
            setUploading(true);

            // Por agora, guarda sem imagem até Storage estar ativo
            await addDoc(collection(db, "analisesPiscina"), {
                data: Timestamp.now(),
                nomeCliente: nomeCliente.trim(),
                volume,
                cloroAtual,
                phAtual,
                cloroDose: doses?.cloro || '0',
                phDose: doses?.ph || '0',
                imagemSelecionada: imagemUri ? 'Sim' : 'Não', // Temporário
                // imageUrl: null - Adicionar quando Storage estiver ativo
            });

            Alert.alert('Sucesso', 'Análise guardada! (Imagem será adicionada quando Storage estiver ativo)');

            // Limpar formulário
            setVolume('');
            setCloroAtual('');
            setPhAtual('');
            setNomeCliente('');
            setImagemUri(null);
            setDoses(null);

        } catch (error) {
            console.error('Erro ao guardar:', error);
            Alert.alert('Erro', 'Falha ao guardar análise.');
        } finally {
            setUploading(false);
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.header}>📝 Nova Análise Manual</Text>

            <Text style={styles.aviso}>
                ⚠️ Versão temporária - Storage será ativado em breve
            </Text>

            <Text style={styles.label}>👤 Nome do Cliente *:</Text>
            <TextInput
                style={styles.input}
                placeholder="Ex: João Silva"
                value={nomeCliente}
                onChangeText={setNomeCliente}
            />

            <Text style={styles.label}>Volume da piscina (m³):</Text>
            <TextInput
                style={styles.input}
                keyboardType="numeric"
                placeholder="Ex: 50"
                value={volume}
                onChangeText={setVolume}
            />

            <Text style={styles.label}>Cloro atual (ppm):</Text>
            <TextInput
                style={styles.input}
                keyboardType="numeric"
                placeholder="Ex: 1.2"
                value={cloroAtual}
                onChangeText={setCloroAtual}
            />

            <Text style={styles.label}>pH atual:</Text>
            <TextInput
                style={styles.input}
                keyboardType="numeric"
                placeholder="Ex: 7.2"
                value={phAtual}
                onChangeText={setPhAtual}
            />

            <Button title="Calcular Doses" onPress={calcularDoses} color="#1e88e5" />

            {doses && (
                <View style={styles.resultado}>
                    <Text style={styles.resultadoTitulo}>💊 Doses sugeridas:</Text>
                    <Text>Cloro: {doses.cloro} g</Text>
                    <Text>pH: {doses.ph} g</Text>
                </View>
            )}

            <View style={styles.imagemSecao}>
                <Text style={styles.label}>📸 Foto da Análise (temporariamente desativada):</Text>

                <TouchableOpacity style={styles.botaoImagem} onPress={selecionarImagem}>
                    <Text style={styles.textoBotaoImagem}>
                        {imagemUri ? "📷 Alterar Imagem (preview)" : "📱 Selecionar Imagem (preview)"}
                    </Text>
                </TouchableOpacity>

                {imagemUri && (
                    <View style={styles.previewImagem}>
                        <Image source={{ uri: imagemUri }} style={styles.imagem} />
                        <Text style={styles.imagemInfo}>✅ Imagem selecionada (não será guardada ainda)</Text>
                    </View>
                )}
            </View>

            <View style={{ marginTop: 30 }}>
                <Button
                    title={uploading ? "⏳ Guardando..." : "💾 Guardar Análise"}
                    onPress={guardarAnalise}
                    color="#2e7d32"
                    disabled={uploading}
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
    aviso: {
        backgroundColor: '#fff3e0',
        color: '#ff9800',
        padding: 10,
        borderRadius: 5,
        marginBottom: 20,
        textAlign: 'center',
        fontWeight: 'bold',
    },
    label: {
        marginTop: 15,
        fontWeight: 'bold',
        color: '#333',
    },
    input: {
        backgroundColor: '#fff',
        padding: 12,
        borderRadius: 8,
        marginTop: 5,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    resultado: {
        backgroundColor: '#e3f2fd',
        padding: 15,
        marginTop: 20,
        borderRadius: 10,
    },
    resultadoTitulo: {
        fontWeight: 'bold',
        marginBottom: 5,
        color: '#1e88e5',
    },
    imagemSecao: {
        marginTop: 25,
        borderTopWidth: 1,
        borderTopColor: '#ddd',
        paddingTop: 20,
    },
    botaoImagem: {
        backgroundColor: '#999',
        padding: 12,
        borderRadius: 8,
        marginTop: 10,
        alignItems: 'center',
    },
    textoBotaoImagem: {
        color: '#fff',
        fontWeight: 'bold',
    },
    previewImagem: {
        marginTop: 15,
        alignItems: 'center',
    },
    imagem: {
        width: 200,
        height: 150,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#999',
    },
    imagemInfo: {
        marginTop: 8,
        color: '#666',
        fontWeight: 'bold',
    },
});
