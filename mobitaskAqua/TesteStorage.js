import React from 'react';
import { View, Text, Button, Alert, StyleSheet } from 'react-native';
import { storage } from '../firebaseConfig';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export default function TesteStorage() {

    const testarStorage = async () => {
        try {
            console.log('🔥 Testando Firebase Storage...');

            // Criar um blob de teste
            const testData = new Blob(['Hello Firebase Storage!'], { type: 'text/plain' });

            // Referência de teste
            const storageRef = ref(storage, 'teste/teste.txt');

            // Upload
            await uploadBytes(storageRef, testData);

            // Obter URL
            const downloadURL = await getDownloadURL(storageRef);

            console.log('✅ Storage funcionando! URL:', downloadURL);
            Alert.alert('Sucesso!', 'Firebase Storage está configurado corretamente!');

        } catch (error) {
            console.error('❌ Erro Storage:', error);
            Alert.alert('Erro', `Storage não configurado: ${error.message}`);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>🔥 Teste Firebase Storage</Text>

            <Text style={styles.info}>
                ⚠️ Se der erro "Firebase Storage is not configured",
                vai ao Firebase Console → Storage → Começar
            </Text>

            <Button
                title="Testar Storage"
                onPress={testarStorage}
                color="#1e88e5"
            />

            <Text style={styles.warning}>
                📱 Para testar imagens, usa Expo Go no telemóvel
                (seleção de imagem não funciona no web preview)
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
        marginBottom: 20,
        color: '#1e88e5',
    },
    info: {
        textAlign: 'center',
        marginBottom: 20,
        color: '#ff9800',
        fontWeight: 'bold',
        backgroundColor: '#fff3e0',
        padding: 15,
        borderRadius: 8,
    },
    warning: {
        marginTop: 30,
        textAlign: 'center',
        color: '#666',
        fontSize: 12,
        backgroundColor: '#e3f2fd',
        padding: 15,
        borderRadius: 8,
    },
});
