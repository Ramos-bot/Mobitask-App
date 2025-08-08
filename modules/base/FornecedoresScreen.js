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

const FornecedoresScreen = ({ onBack, moduleInfo }) => {
    const [fornecedores, setFornecedores] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingFornecedor, setEditingFornecedor] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    // Formulário
    const [formData, setFormData] = useState({
        nome: '',
        razaoSocial: '',
        cnpj: '',
        email: '',
        telefone: '',
        endereco: '',
        cidade: '',
        estado: '',
        cep: '',
        categoria: '',
        observacoes: ''
    });

    useEffect(() => {
        carregarFornecedores();
    }, []);

    const carregarFornecedores = async () => {
        try {
            const querySnapshot = await getDocs(collection(db, 'fornecedores'));
            const fornecedoresData = [];
            querySnapshot.forEach((doc) => {
                fornecedoresData.push({ id: doc.id, ...doc.data() });
            });
            setFornecedores(fornecedoresData);
        } catch (error) {
            console.error('Erro ao carregar fornecedores:', error);
            Alert.alert('Erro', 'Falha ao carregar fornecedores');
        }
    };

    const salvarFornecedor = async () => {
        if (!formData.nome.trim()) {
            Alert.alert('Erro', 'Nome é obrigatório');
            return;
        }

        try {
            if (editingFornecedor) {
                // Atualizar fornecedor existente
                await updateDoc(doc(db, 'fornecedores', editingFornecedor.id), {
                    ...formData,
                    updatedAt: new Date()
                });
                Alert.alert('Sucesso', 'Fornecedor atualizado com sucesso');
            } else {
                // Criar novo fornecedor
                await addDoc(collection(db, 'fornecedores'), {
                    ...formData,
                    createdAt: new Date(),
                    updatedAt: new Date()
                });
                Alert.alert('Sucesso', 'Fornecedor criado com sucesso');
            }

            fecharModal();
            carregarFornecedores();
        } catch (error) {
            console.error('Erro ao salvar fornecedor:', error);
            Alert.alert('Erro', 'Falha ao salvar fornecedor');
        }
    };

    const excluirFornecedor = async (fornecedor) => {
        Alert.alert(
            'Confirmar Exclusão',
            `Deseja excluir o fornecedor ${fornecedor.nome}?`,
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Excluir',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await deleteDoc(doc(db, 'fornecedores', fornecedor.id));
                            Alert.alert('Sucesso', 'Fornecedor excluído com sucesso');
                            carregarFornecedores();
                        } catch (error) {
                            console.error('Erro ao excluir fornecedor:', error);
                            Alert.alert('Erro', 'Falha ao excluir fornecedor');
                        }
                    }
                }
            ]
        );
    };

    const abrirModal = (fornecedor = null) => {
        if (fornecedor) {
            setEditingFornecedor(fornecedor);
            setFormData({
                nome: fornecedor.nome || '',
                razaoSocial: fornecedor.razaoSocial || '',
                cnpj: fornecedor.cnpj || '',
                email: fornecedor.email || '',
                telefone: fornecedor.telefone || '',
                endereco: fornecedor.endereco || '',
                cidade: fornecedor.cidade || '',
                estado: fornecedor.estado || '',
                cep: fornecedor.cep || '',
                categoria: fornecedor.categoria || '',
                observacoes: fornecedor.observacoes || ''
            });
        } else {
            setEditingFornecedor(null);
            setFormData({
                nome: '',
                razaoSocial: '',
                cnpj: '',
                email: '',
                telefone: '',
                endereco: '',
                cidade: '',
                estado: '',
                cep: '',
                categoria: '',
                observacoes: ''
            });
        }
        setModalVisible(true);
    };

    const fecharModal = () => {
        setModalVisible(false);
        setEditingFornecedor(null);
        setFormData({
            nome: '',
            razaoSocial: '',
            cnpj: '',
            email: '',
            telefone: '',
            endereco: '',
            cidade: '',
            estado: '',
            cep: '',
            categoria: '',
            observacoes: ''
        });
    };

    const fornecedoresFiltrados = fornecedores.filter(fornecedor =>
        fornecedor.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        fornecedor.razaoSocial?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        fornecedor.cnpj?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        fornecedor.categoria?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        fornecedor.cidade?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={onBack}>
                    <Text style={styles.backButtonText}>← Voltar</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{moduleInfo.icon} {moduleInfo.title}</Text>
                <Text style={styles.headerSubtitle}>Gerencie seus fornecedores</Text>
            </View>

            <View style={styles.toolbar}>
                <TextInput
                    style={styles.searchInput}
                    placeholder="Buscar fornecedores..."
                    value={searchTerm}
                    onChangeText={setSearchTerm}
                />
                <TouchableOpacity style={styles.addButton} onPress={() => abrirModal()}>
                    <Text style={styles.addButtonText}>+ Novo</Text>
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.content}>
                <View style={styles.statsCard}>
                    <Text style={styles.statsNumber}>{fornecedores.length}</Text>
                    <Text style={styles.statsLabel}>Total de Fornecedores</Text>
                </View>

                <View style={styles.fornecedoresList}>
                    {fornecedoresFiltrados.map((fornecedor) => (
                        <View key={fornecedor.id} style={styles.fornecedorCard}>
                            <View style={styles.fornecedorInfo}>
                                <Text style={styles.fornecedorNome}>{fornecedor.nome}</Text>
                                {fornecedor.razaoSocial && (
                                    <Text style={styles.fornecedorRazao}>{fornecedor.razaoSocial}</Text>
                                )}
                                <Text style={styles.fornecedorCategoria}>{fornecedor.categoria}</Text>
                                <Text style={styles.fornecedorEmail}>{fornecedor.email}</Text>
                                <Text style={styles.fornecedorTelefone}>{fornecedor.telefone}</Text>
                                {fornecedor.cidade && fornecedor.estado && (
                                    <Text style={styles.fornecedorLocalizacao}>
                                        {fornecedor.cidade}, {fornecedor.estado}
                                    </Text>
                                )}
                                {fornecedor.cnpj && (
                                    <Text style={styles.fornecedorCnpj}>CNPJ: {fornecedor.cnpj}</Text>
                                )}
                            </View>
                            <View style={styles.fornecedorActions}>
                                <TouchableOpacity
                                    style={[styles.actionButton, styles.editButton]}
                                    onPress={() => abrirModal(fornecedor)}
                                >
                                    <Text style={styles.actionButtonText}>✏️</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.actionButton, styles.deleteButton]}
                                    onPress={() => excluirFornecedor(fornecedor)}
                                >
                                    <Text style={styles.actionButtonText}>🗑️</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    ))}

                    {fornecedoresFiltrados.length === 0 && (
                        <View style={styles.emptyState}>
                            <Text style={styles.emptyStateText}>
                                {searchTerm ? 'Nenhum fornecedor encontrado' : 'Nenhum fornecedor cadastrado'}
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
                            {editingFornecedor ? 'Editar Fornecedor' : 'Novo Fornecedor'}
                        </Text>

                        <ScrollView style={styles.formContainer}>
                            <TextInput
                                style={styles.input}
                                placeholder="Nome/Nome Fantasia *"
                                value={formData.nome}
                                onChangeText={(text) => setFormData({ ...formData, nome: text })}
                            />

                            <TextInput
                                style={styles.input}
                                placeholder="Razão Social"
                                value={formData.razaoSocial}
                                onChangeText={(text) => setFormData({ ...formData, razaoSocial: text })}
                            />

                            <TextInput
                                style={styles.input}
                                placeholder="CNPJ"
                                value={formData.cnpj}
                                onChangeText={(text) => setFormData({ ...formData, cnpj: text })}
                                keyboardType="numeric"
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
                                placeholder="Categoria (Ex: Equipamentos, Químicos, Serviços)"
                                value={formData.categoria}
                                onChangeText={(text) => setFormData({ ...formData, categoria: text })}
                            />

                            <TextInput
                                style={styles.input}
                                placeholder="Endereço"
                                value={formData.endereco}
                                onChangeText={(text) => setFormData({ ...formData, endereco: text })}
                            />

                            <TextInput
                                style={styles.input}
                                placeholder="Cidade"
                                value={formData.cidade}
                                onChangeText={(text) => setFormData({ ...formData, cidade: text })}
                            />

                            <TextInput
                                style={styles.input}
                                placeholder="Estado"
                                value={formData.estado}
                                onChangeText={(text) => setFormData({ ...formData, estado: text })}
                            />

                            <TextInput
                                style={styles.input}
                                placeholder="CEP"
                                value={formData.cep}
                                onChangeText={(text) => setFormData({ ...formData, cep: text })}
                                keyboardType="numeric"
                            />

                            <TextInput
                                style={[styles.input, styles.textArea]}
                                placeholder="Observações"
                                value={formData.observacoes}
                                onChangeText={(text) => setFormData({ ...formData, observacoes: text })}
                                multiline
                                numberOfLines={3}
                            />
                        </ScrollView>

                        <View style={styles.modalActions}>
                            <TouchableOpacity style={styles.cancelButton} onPress={fecharModal}>
                                <Text style={styles.cancelButtonText}>Cancelar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.saveButton} onPress={salvarFornecedor}>
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
    fornecedoresList: {
        gap: 10,
    },
    fornecedorCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 15,
        flexDirection: 'row',
        alignItems: 'center',
    },
    fornecedorInfo: {
        flex: 1,
    },
    fornecedorNome: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 5,
    },
    fornecedorRazao: {
        fontSize: 14,
        color: '#888',
        fontStyle: 'italic',
        marginBottom: 3,
    },
    fornecedorCategoria: {
        fontSize: 16,
        color: '#4CAF50',
        fontWeight: '600',
        marginBottom: 3,
    },
    fornecedorEmail: {
        fontSize: 14,
        color: '#666',
        marginBottom: 3,
    },
    fornecedorTelefone: {
        fontSize: 14,
        color: '#666',
        marginBottom: 3,
    },
    fornecedorLocalizacao: {
        fontSize: 14,
        color: '#666',
        marginBottom: 3,
    },
    fornecedorCnpj: {
        fontSize: 12,
        color: '#888',
    },
    fornecedorActions: {
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

export default FornecedoresScreen;
