import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    SafeAreaView,
    ScrollView,
    TextInput,
    Alert
} from 'react-native';
import { db } from '../../firebaseConfig';
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import ColaboradorForm from './ColaboradorForm';

const ColaboradoresScreen = ({ onBack, moduleInfo }) => {
    const [colaboradores, setColaboradores] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingColaborador, setEditingColaborador] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        carregarColaboradores();
    }, []);

    const carregarColaboradores = async () => {
        try {
            const querySnapshot = await getDocs(collection(db, 'colaboradores'));
            const colaboradoresData = [];
            querySnapshot.forEach((doc) => {
                colaboradoresData.push({ id: doc.id, ...doc.data() });
            });
            setColaboradores(colaboradoresData);
        } catch (error) {
            console.error('Erro ao carregar colaboradores:', error);
            Alert.alert('Erro', 'Falha ao carregar colaboradores');
        }
    };

    const salvarColaborador = async (colaboradorData) => {
        try {
            if (editingColaborador) {
                // Atualizar colaborador existente
                await updateDoc(doc(db, 'colaboradores', editingColaborador.id), {
                    ...colaboradorData,
                    updatedAt: new Date()
                });
                Alert.alert('Sucesso', 'Colaborador atualizado com sucesso');
            } else {
                // Criar novo colaborador
                await addDoc(collection(db, 'colaboradores'), {
                    ...colaboradorData,
                    createdAt: new Date(),
                    updatedAt: new Date()
                });
                Alert.alert('Sucesso', 'Colaborador criado com sucesso');
            }

            fecharModal();
            carregarColaboradores();
        } catch (error) {
            console.error('Erro ao salvar colaborador:', error);
            Alert.alert('Erro', 'Falha ao salvar colaborador');
        }
    };

    const excluirColaborador = async (colaborador) => {
        Alert.alert(
            'Confirmar Exclusão',
            `Deseja excluir o colaborador ${colaborador.nome}?`,
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Excluir',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await deleteDoc(doc(db, 'colaboradores', colaborador.id));
                            Alert.alert('Sucesso', 'Colaborador excluído com sucesso');
                            carregarColaboradores();
                        } catch (error) {
                            console.error('Erro ao excluir colaborador:', error);
                            Alert.alert('Erro', 'Falha ao excluir colaborador');
                        }
                    }
                }
            ]
        );
    };

    const abrirModal = (colaborador = null) => {
        setEditingColaborador(colaborador);
        setModalVisible(true);
    };

    const fecharModal = () => {
        setModalVisible(false);
        setEditingColaborador(null);
    };

    const colaboradoresFiltrados = colaboradores.filter(colaborador =>
        colaborador.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        colaborador.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        colaborador.cargo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        colaborador.departamento?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={onBack}>
                    <Text style={styles.backButtonText}>← Voltar</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{moduleInfo.icon} {moduleInfo.title}</Text>
                <Text style={styles.headerSubtitle}>Gerencie sua equipe</Text>
            </View>

            <View style={styles.toolbar}>
                <TextInput
                    style={styles.searchInput}
                    placeholder="Buscar colaboradores..."
                    value={searchTerm}
                    onChangeText={setSearchTerm}
                />
                <TouchableOpacity style={styles.addButton} onPress={() => abrirModal()}>
                    <Text style={styles.addButtonText}>+ Novo</Text>
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.content}>
                <View style={styles.statsCard}>
                    <Text style={styles.statsNumber}>{colaboradores.length}</Text>
                    <Text style={styles.statsLabel}>Total de Colaboradores</Text>
                </View>

                <View style={styles.colaboradoresList}>
                    {colaboradoresFiltrados.map((colaborador) => (
                        <View key={colaborador.id} style={styles.colaboradorCard}>
                            <View style={styles.colaboradorInfo}>
                                <Text style={styles.colaboradorNome}>{colaborador.nome}</Text>
                                <Text style={styles.colaboradorCargo}>{colaborador.cargo}</Text>
                                <Text style={styles.colaboradorDepartamento}>{colaborador.departamento}</Text>
                                <Text style={styles.colaboradorEmail}>{colaborador.email}</Text>
                                <Text style={styles.colaboradorTelefone}>{colaborador.telefone}</Text>
                            </View>
                            <View style={styles.colaboradorActions}>
                                <TouchableOpacity
                                    style={[styles.actionButton, styles.editButton]}
                                    onPress={() => abrirModal(colaborador)}
                                >
                                    <Text style={styles.actionButtonText}>✏️</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.actionButton, styles.deleteButton]}
                                    onPress={() => excluirColaborador(colaborador)}
                                >
                                    <Text style={styles.actionButtonText}>🗑️</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    ))}

                    {colaboradoresFiltrados.length === 0 && (
                        <View style={styles.emptyState}>
                            <Text style={styles.emptyStateText}>
                                {searchTerm ? 'Nenhum colaborador encontrado' : 'Nenhum colaborador cadastrado'}
                            </Text>
                        </View>
                    )}
                </View>
            </ScrollView>

            {/* Modal de Formulário */}
            <ColaboradorForm
                visible={modalVisible}
                onClose={fecharModal}
                onSave={salvarColaborador}
                editingColaborador={editingColaborador}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    header: {
        backgroundColor: '#fff',
        padding: 20,
        paddingTop: 40,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    backButton: {
        marginBottom: 10,
    },
    backButtonText: {
        color: '#4CAF50',
        fontSize: 16,
        fontWeight: '500',
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 5,
    },
    headerSubtitle: {
        fontSize: 16,
        color: '#666',
    },
    toolbar: {
        flexDirection: 'row',
        padding: 15,
        backgroundColor: '#fff',
        alignItems: 'center',
        gap: 10,
    },
    searchInput: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        paddingHorizontal: 15,
        paddingVertical: 10,
        fontSize: 16,
    },
    addButton: {
        backgroundColor: '#4CAF50',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 8,
    },
    addButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    content: {
        flex: 1,
        padding: 15,
    },
    statsCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 20,
        alignItems: 'center',
        marginBottom: 20,
    },
    statsNumber: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#4CAF50',
    },
    statsLabel: {
        fontSize: 16,
        color: '#666',
        marginTop: 5,
    },
    colaboradoresList: {
        gap: 10,
    },
    colaboradorCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 15,
        flexDirection: 'row',
        alignItems: 'center',
    },
    colaboradorInfo: {
        flex: 1,
    },
    colaboradorNome: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 5,
    },
    colaboradorCargo: {
        fontSize: 16,
        color: '#4CAF50',
        fontWeight: '600',
        marginBottom: 3,
    },
    colaboradorDepartamento: {
        fontSize: 14,
        color: '#666',
        marginBottom: 3,
    },
    colaboradorEmail: {
        fontSize: 14,
        color: '#666',
        marginBottom: 3,
    },
    colaboradorTelefone: {
        fontSize: 14,
        color: '#666',
    },
    colaboradorActions: {
        flexDirection: 'row',
        gap: 10,
    },
    actionButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    editButton: {
        backgroundColor: '#4CAF50',
    },
    deleteButton: {
        backgroundColor: '#f44336',
    },
    actionButtonText: {
        fontSize: 16,
    },
    emptyState: {
        padding: 40,
        alignItems: 'center',
    },
    emptyStateText: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
    },
    // Modal styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 20,
        width: '90%',
        maxHeight: '80%',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 20,
        textAlign: 'center',
    },
    formContainer: {
        maxHeight: 400,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        paddingHorizontal: 15,
        paddingVertical: 12,
        fontSize: 16,
        marginBottom: 15,
    },
    modalActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
        gap: 10,
    },
    cancelButton: {
        flex: 1,
        backgroundColor: '#f5f5f5',
        paddingVertical: 15,
        borderRadius: 8,
        alignItems: 'center',
    },
    cancelButtonText: {
        color: '#666',
        fontWeight: 'bold',
    },
    saveButton: {
        flex: 1,
        backgroundColor: '#4CAF50',
        paddingVertical: 15,
        borderRadius: 8,
        alignItems: 'center',
    },
    saveButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
});

export default ColaboradoresScreen;
