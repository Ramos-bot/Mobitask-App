import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Alert } from 'react-native';
import GerarPDF from './GerarPDF';

export default function DetalhesAnalise({ analise, setEcrã }) {
    const handleGerarPDF = async () => {
        try {
            await GerarPDF.gerarPDF(analise);
            Alert.alert('✅ Sucesso', 'PDF gerado com sucesso!');
        } catch (error) {
            console.error('Erro ao gerar PDF:', error);
            Alert.alert('❌ Erro', 'Falha ao gerar o PDF');
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.header}>📋 Detalhes da Análise</Text>

            <View style={styles.section}>
                <Text style={styles.label}>👤 Cliente:</Text>
                <Text style={styles.valor}>{analise.cliente}</Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.label}>📅 Data:</Text>
                <Text style={styles.valor}>
                    {analise.data?.toDate().toLocaleDateString() || 'Sem data'}
                </Text>
            </View>

            {analise.imageUrl && (
                <View style={styles.section}>
                    <Text style={styles.label}>📸 Imagem da Análise:</Text>
                    <Image source={{ uri: analise.imageUrl }} style={styles.imagem} />
                </View>
            )}

            <View style={styles.row}>
                <View style={styles.halfSection}>
                    <Text style={styles.label}>💧 Cloro:</Text>
                    <Text style={styles.valor}>{analise.cloroAtual} ppm</Text>
                </View>

                <View style={styles.halfSection}>
                    <Text style={styles.label}>🧪 pH:</Text>
                    <Text style={styles.valor}>{analise.phAtual}</Text>
                </View>
            </View>

            <View style={styles.section}>
                <Text style={styles.label}>📦 Volume da Piscina:</Text>
                <Text style={styles.valor}>{analise.volume} m³</Text>
            </View>

            <View style={styles.row}>
                <View style={styles.halfSection}>
                    <Text style={styles.label}>🧮 Dose Cloro:</Text>
                    <Text style={styles.valor}>{analise.cloroDose} g</Text>
                </View>

                <View style={styles.halfSection}>
                    <Text style={styles.label}>🧮 Dose pH:</Text>
                    <Text style={styles.valor}>{analise.phDose} g</Text>
                </View>
            </View>

            <TouchableOpacity style={styles.botaoPDF} onPress={handleGerarPDF}>
                <Text style={styles.textoBotao}>📄 Gerar PDF</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.botaoVoltar} onPress={() => setEcrã('historico')}>
                <Text style={styles.textoVoltar}>← Voltar ao Histórico</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingTop: 60,
        paddingHorizontal: 20,
        backgroundColor: '#f0faff',
        flexGrow: 1,
        paddingBottom: 40,
    },
    header: {
        fontSize: 26,
        fontWeight: 'bold',
        marginBottom: 30,
        color: '#1e88e5',
        textAlign: 'center',
    },
    section: {
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 15,
        marginBottom: 15,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 15,
    },
    halfSection: {
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 15,
        flex: 0.48,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    label: {
        fontWeight: 'bold',
        fontSize: 16,
        color: '#555',
        marginBottom: 5,
    },
    valor: {
        fontSize: 18,
        color: '#333',
        fontWeight: '500',
    },
    imagem: {
        width: '100%',
        height: 200,
        marginTop: 10,
        borderRadius: 10,
        resizeMode: 'contain',
    },
    botaoPDF: {
        backgroundColor: '#1e88e5',
        borderRadius: 10,
        padding: 15,
        marginTop: 20,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    textoBotao: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    botaoVoltar: {
        marginTop: 15,
        padding: 10,
    },
    textoVoltar: {
        color: '#1e88e5',
        fontSize: 16,
        textAlign: 'center',
    },
});
