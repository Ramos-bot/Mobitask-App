import React, { useEffect } from 'react';
import { View, Text, Button, Alert, StyleSheet } from 'react-native';
import { db } from '../firebaseConfig';
import { collection, addDoc, getDocs, Timestamp } from 'firebase/firestore';

export default function TesteFirebase() {

    const testarLigacao = async () => {
        try {
            console.log('🔥 Testando Firebase...');

            // Teste 1: Adicionar um documento
            const docRef = await addDoc(collection(db, "analisesPiscina"), {
                data: Timestamp.now(),
                volume: "45",
                cloroAtual: "0.8",
                phAtual: "7.0",
                cloroDose: "50",
                phDose: "20",
                teste: true
            });

            console.log('✅ Documento criado com ID:', docRef.id);
            Alert.alert('Sucesso!', `Documento criado: ${docRef.id}`);

        } catch (error) {
            console.error('❌ Erro Firebase:', error);
            Alert.alert('Erro', error.message);
        }
    };

    const lerDados = async () => {
        try {
            console.log('📖 Lendo dados...');
            const querySnapshot = await getDocs(collection(db, "analisesPiscina"));

            console.log('📊 Documentos encontrados:', querySnapshot.size);

            querySnapshot.forEach((doc) => {
                console.log('📄 Doc ID:', doc.id, 'Data:', doc.data());
            });

            Alert.alert('Leitura', `Encontrados ${querySnapshot.size} documentos`);

        } catch (error) {
            console.error('❌ Erro ao ler:', error);
            Alert.alert('Erro', error.message);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>🔥 Teste Firebase</Text>

            <Button
                title="Adicionar Documento de Teste"
                onPress={testarLigacao}
                color="#1e88e5"
            />

            <View style={styles.spacer} />

            <Button
                title="Ler Documentos"
                onPress={lerDados}
                color="#2e7d32"
            />

            <Text style={styles.info}>
                Abre o console (F12) para ver os logs detalhados
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 20,
        backgroundColor: '#f0faff',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 30,
        color: '#1e88e5',
    },
    spacer: {
        height: 20,
    },
    info: {
        marginTop: 30,
        textAlign: 'center',
        color: '#666',
        fontSize: 12,
    },
});
