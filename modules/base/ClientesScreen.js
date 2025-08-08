import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    SafeAreaView,
    ScrollView,
    TextInput,
    Alert,
    Modal
} from 'react-native';
import { db } from '../../firebaseConfig';
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';

const ClientesScreen = ({ onBack, moduleInfo }) => {
    const [clientes, setClientes] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingCliente, setEditingCliente] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    // Formulário
    const [formData, setFormData] = useState({
        nome: '',
        email: '',
        telefone: '',
        empresa: '',
        endereco: ''
    });

    useEffect(() => {
        carregarClientes();
    }, []);

    const carregarClientes = async () => {
        try {
            const querySnapshot = await getDocs(collection(db, 'clientes'));
            const clientesData = [];
            querySnapshot.forEach((doc) => {
                clientesData.push({ id: doc.id, ...doc.data() });
            });
            setClientes(clientesData);
        } catch (error) {
            console.error('Erro ao carregar clientes:', error);
            Alert.alert('Erro', 'Falha ao carregar clientes');
        }
    };

    const salvarCliente = async () => {
        if (!formData.nome.trim()) {
            Alert.alert('Erro', 'Nome é obrigatório');
            return;
        }

        try {
            if (editingCliente) {
                // Atualizar cliente existente
                await updateDoc(doc(db, 'clientes', editingCliente.id), {
                    ...formData,
                    updatedAt: new Date()
                });
                Alert.alert('Sucesso', 'Cliente atualizado com sucesso');
            } else {
                // Criar novo cliente
                await addDoc(collection(db, 'clientes'), {
                    ...formData,
                    createdAt: new Date(),
                    updatedAt: new Date()
                });
                Alert.alert('Sucesso', 'Cliente criado com sucesso');
            }

            fecharModal();
            carregarClientes();
        } catch (error) {
            console.error('Erro ao salvar cliente:', error);
            Alert.alert('Erro', 'Falha ao salvar cliente');
        }
    };

    const excluirCliente = async (cliente) => {
        Alert.alert(
            'Confirmar Exclusão',
            `Deseja excluir o cliente ${cliente.nome}?`,
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Excluir',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await deleteDoc(doc(db, 'clientes', cliente.id));
                            Alert.alert('Sucesso', 'Cliente excluído com sucesso');
                            carregarClientes();
                        } catch (error) {
                            console.error('Erro ao excluir cliente:', error);
                            Alert.alert('Erro', 'Falha ao excluir cliente');
                        }
                    }
                }
            ]
        );
    };

    const abrirModal = (cliente = null) => {
        if (cliente) {
            setEditingCliente(cliente);
            setFormData({
                nome: cliente.nome || '',
                email: cliente.email || '',
                telefone: cliente.telefone || '',
                empresa: cliente.empresa || '',
                endereco: cliente.endereco || ''
            });
        } else {
            setEditingCliente(null);
            setFormData({
                nome: '',
                email: '',
                telefone: '',
                empresa: '',
                endereco: ''
            });
        }
        setModalVisible(true);
    };

    const fecharModal = () => {
        setModalVisible(false);
        setEditingCliente(null);
        setFormData({
            nome: '',
            email: '',
            telefone: '',
            empresa: '',
            endereco: ''
        });
    };

    const clientesFiltrados = clientes.filter(cliente =>
        cliente.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cliente.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cliente.empresa?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={onBack}>
                    <Text style={styles.backButtonText}>← Voltar</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{moduleInfo.icon} {moduleInfo.title}</Text>
                <Text style={styles.headerSubtitle}>Gerencie seus clientes</Text>
            </View>

            <View style={styles.toolbar}>
                <TextInput
                    style={styles.searchInput}
                    placeholder="Buscar clientes..."
                    value={searchTerm}
                    onChangeText={setSearchTerm}
                />
                <TouchableOpacity style={styles.addButton} onPress={() => abrirModal()}>
                    <Text style={styles.addButtonText}>+ Novo</Text>
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.content}>
                <View style={styles.statsCard}>
                    <Text style={styles.statsNumber}>{clientes.length}</Text>
                    <Text style={styles.statsLabel}>Total de Clientes</Text>
                </View>

                <View style={styles.clientesList}>
                    {clientesFiltrados.map((cliente) => (
                        <View key={cliente.id} style={styles.clienteCard}>
                            <View style={styles.clienteInfo}>
                                <Text style={styles.clienteNome}>{cliente.nome}</Text>
                                <Text style={styles.clienteEmail}>{cliente.email}</Text>
                                <Text style={styles.clienteEmpresa}>{cliente.empresa}</Text>
                                <Text style={styles.clienteTelefone}>{cliente.telefone}</Text>
                            </View>
                            <View style={styles.clienteActions}>
                                <TouchableOpacity
                                    style={[styles.actionButton, styles.editButton]}
                                    onPress={() => abrirModal(cliente)}
                                >
                                    <Text style={styles.actionButtonText}>✏️</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.actionButton, styles.deleteButton]}
                                    onPress={() => excluirCliente(cliente)}
                                >
                                    <Text style={styles.actionButtonText}>🗑️</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    ))}

                    {clientesFiltrados.length === 0 && (
                        <View style={styles.emptyState}>
                            <Text style={styles.emptyStateText}>
                                {searchTerm ? 'Nenhum cliente encontrado' : 'Nenhum cliente cadastrado'}
                            </Text>
                        </View>
                    )}
                </View>
            </ScrollView>

            {/* Modal de Formulário */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={fecharModal}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>
                            {editingCliente ? 'Editar Cliente' : 'Novo Cliente'}
                        </Text>

                        <ScrollView style={styles.formContainer}>
                            <TextInput
                                style={styles.input}
                                placeholder="Nome *"
                                value={formData.nome}
                                onChangeText={(text) => setFormData({ ...formData, nome: text })}
                            />

                            <TextInput
                                style={styles.input}
                                placeholder="Email"
                                value={formData.email}
                                onChangeText={(text) => setFormData({ ...formData, email: text })}
                                keyboardType="email-address"
                            />

                            <TextInput
                                style={styles.input}
                                placeholder="Telefone"
                                value={formData.telefone}
                                onChangeText={(text) => setFormData({ ...formData, telefone: text })}
                                keyboardType="phone-pad"
                            />

                            <TextInput
                                style={styles.input}
                                placeholder="Empresa"
                                value={formData.empresa}
                                onChangeText={(text) => setFormData({ ...formData, empresa: text })}
                            />

                            <TextInput
                                style={[styles.input, styles.textArea]}
                                placeholder="Endereço"
                                value={formData.endereco}
                                onChangeText={(text) => setFormData({ ...formData, endereco: text })}
                                multiline
                                numberOfLines={3}
                            />
                        </ScrollView>

                        <View style={styles.modalActions}>
                            <TouchableOpacity style={styles.cancelButton} onPress={fecharModal}>
                                <Text style={styles.cancelButtonText}>Cancelar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.saveButton} onPress={salvarCliente}>
                                <Text style={styles.saveButtonText}>Salvar</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
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
        color: '#2196F3',
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
        backgroundColor: '#2196F3',
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
        color: '#2196F3',
    },
    statsLabel: {
        fontSize: 16,
        color: '#666',
        marginTop: 5,
    },
    clientesList: {
        gap: 10,
    },
    clienteCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 15,
        flexDirection: 'row',
        alignItems: 'center',
    },
    clienteInfo: {
        flex: 1,
    },
    clienteNome: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 5,
    },
    clienteEmail: {
        fontSize: 14,
        color: '#666',
        marginBottom: 3,
    },
    clienteEmpresa: {
        fontSize: 14,
        color: '#666',
        marginBottom: 3,
    },
    clienteTelefone: {
        fontSize: 14,
        color: '#666',
    },
    clienteActions: {
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
    textArea: {
        height: 80,
        textAlignVertical: 'top',
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
        backgroundColor: '#2196F3',
        paddingVertical: 15,
        borderRadius: 8,
        alignItems: 'center',
    },
    saveButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
});

export default ClientesScreen;
