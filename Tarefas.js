import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';

const diasDaSemana = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

const tarefasExemplo = {
    Seg: [{ titulo: 'Cortar relva', hora: '08h00' }],
    Ter: [{ titulo: 'Aplicar herbicida', hora: '11h00' }],
    Qua: [],
    Qui: [{ titulo: 'Podar sebe', hora: '10h00' }, { titulo: 'Verificar piscina', hora: '15h30' }],
    Sex: [],
    Sáb: [],
    Dom: [],
};

export default function Tarefas() {
    const [diaSelecionado, setDiaSelecionado] = useState('Seg');

    return (
        <View style={styles.container}>
            <Text style={styles.header}>📅 Tarefas da Semana</Text>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.diasContainer}>
                {diasDaSemana.map((dia) => (
                    <TouchableOpacity
                        key={dia}
                        style={[
                            styles.diaBotao,
                            dia === diaSelecionado && styles.diaSelecionado
                        ]}
                        onPress={() => setDiaSelecionado(dia)}
                    >
                        <Text style={styles.diaTexto}>{dia}</Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            <Text style={styles.subtitulo}>📌 {diaSelecionado}</Text>
            <ScrollView style={styles.lista}>
                {tarefasExemplo[diaSelecionado].length > 0 ? (
                    tarefasExemplo[diaSelecionado].map((tarefa, i) => (
                        <View key={i} style={styles.card}>
                            <Text style={styles.titulo}>{tarefa.titulo}</Text>
                            <Text style={styles.hora}>{tarefa.hora}</Text>
                        </View>
                    ))
                ) : (
                    <Text style={styles.nenhuma}>Nenhuma tarefa marcada.</Text>
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 60,
        paddingHorizontal: 20,
        backgroundColor: '#f7f7f7',
    },
    header: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#2e7d32',
    },
    diasContainer: {
        flexDirection: 'row',
        marginBottom: 20,
    },
    diaBotao: {
        backgroundColor: '#ddd',
        borderRadius: 10,
        paddingVertical: 10,
        paddingHorizontal: 15,
        marginRight: 10,
    },
    diaSelecionado: {
        backgroundColor: '#2e7d32',
    },
    diaTexto: {
        color: '#fff',
        fontWeight: 'bold',
    },
    subtitulo: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    lista: {
        flex: 1,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 15,
        marginBottom: 10,
    },
    titulo: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    hora: {
        fontSize: 14,
        color: '#666',
        marginTop: 4,
    },
    nenhuma: {
        fontSize: 16,
        color: '#999',
        marginTop: 10,
    },
});
