import React, { useState } from 'react';
import {
    View, Text, TextInput, Button, StyleSheet,
    ScrollView, Alert, Image
} from 'react-native';
import { db } from '../firebaseConfig';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import * as ImagePicker from 'expo-image-picker';

const storage = getStorage();

export default function NovaAnalise({ setEcrã }) {
    const [cliente, setCliente] = useState('');
    const [volume, setVolume] = useState('');
    const [cloroAtual, setCloroAtual] = useState('');
    const [phAtual, setPhAtual] = useState('');
    const [doses, setDoses] = useState(null);
    const [imagem, setImagem] = useState(null);
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

    const escolherImagem = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            allowsEditing: true,
            quality: 0.7,
        });

        if (!result.canceled) {
            setImagem(result.assets[0].uri);
        }
    };

    const guardarAnalise = async () => {
        if (!cliente || !volume || !cloroAtual || !phAtual) {
            Alert.alert('Erro', 'Preenche todos os campos antes de guardar.');
            return;
        }

        setUploading(true);
        const hoje = new Date().toISOString().split('T')[0];
        let imageUrl = null;

        try {
            if (imagem) {
                const response = await fetch(imagem);
                const blob = await response.blob();
                const path = `analises/${cliente.replace(/\s/g, '_')}/${hoje}.jpg`;
                const storageRef = ref(storage, path);
                await uploadBytes(storageRef, blob);
                imageUrl = await getDownloadURL(storageRef);
            }

            await addDoc(collection(db, 'analisesPiscina'), {
                data: Timestamp.now(),
                cliente,
                volume,
                cloroAtual,
                phAtual,
                cloroDose: doses?.cloro,
                phDose: doses?.ph,
                imageUrl
            });

            Alert.alert('Sucesso', 'Análise registada com sucesso!');
            setCliente('');
            setVolume('');
            setCloroAtual('');
            setPhAtual('');
            setDoses(null);
            setImagem(null);
        } catch (error) {
            Alert.alert('Erro ao guardar', error.message);
        }

        setUploading(false);
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.header}>📝 Nova Análise Manual</Text>

            <Text style={styles.label}>Cliente:</Text>
            <TextInput style={styles.input} value={cliente} onChangeText={setCliente} placeholder="Ex: Dona Adelaide" />

            <Text style={styles.label}>Volume da piscina (m³):</Text>
            <TextInput style={styles.input} keyboardType="numeric" value={volume} onChangeText={setVolume} />

            <Text style={styles.label}>Cloro atual (ppm):</Text>
            <TextInput style={styles.input} keyboardType="numeric" value={cloroAtual} onChangeText={setCloroAtual} />

            <Text style={styles.label}>pH atual:</Text>
            <TextInput style={styles.input} keyboardType="numeric" value={phAtual} onChangeText={setPhAtual} />

            <Button title="Calcular Doses" onPress={calcularDoses} color="#1e88e5" />

            {doses && (
                <View style={styles.resultado}>
                    <Text style={styles.resultadoTitulo}>💊 Doses sugeridas:</Text>
                    <Text>Cloro: {doses.cloro} g</Text>
                    <Text>pH: {doses.ph} g</Text>
                </View>
            )}

            <View style={{ marginVertical: 20 }}>
                <Button title="Selecionar Imagem da Análise" onPress={escolherImagem} color="#1e88e5" />
                {imagem && <Image source={{ uri: imagem }} style={styles.imagem} />}
            </View>

            <Button
                title={uploading ? "A guardar..." : "Guardar Análise"}
                onPress={guardarAnalise}
                color="#2e7d32"
                disabled={uploading}
            />

            <View style={{ marginTop: 20, alignItems: 'center' }}>
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
        backgroundColor: '#e3f2fd',
        padding: 15,
        marginTop: 20,
        borderRadius: 10,
    },
    resultadoTitulo: {
        fontWeight: 'bold',
        marginBottom: 5,
    },
    imagem: {
        width: '100%',
        height: 180,
        resizeMode: 'contain',
        marginTop: 15,
        borderRadius: 10,
    },
});