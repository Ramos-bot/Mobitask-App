import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TextInput,
    TouchableOpacity,
    Alert,
    ScrollView,
    Switch
} from 'react-native';

const FornecedorForm = ({
    visible,
    onClose,
    onSave,
    editingFornecedor = null
}) => {
    const [formData, setFormData] = useState({
        nomeEmpresa: '',
        nomeContato: '',
        email: '',
        telefone: '',
        cnpj: '',
        categoria: '',
        endereco: '',
        cidade: '',
        cep: '',
        website: '',
        ativo: true,
        observacoes: ''
    });

    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (editingFornecedor) {
            setFormData({
                nomeEmpresa: editingFornecedor.nomeEmpresa || '',
                nomeContato: editingFornecedor.nomeContato || '',
                email: editingFornecedor.email || '',
                telefone: editingFornecedor.telefone || '',
                cnpj: editingFornecedor.cnpj || '',
                categoria: editingFornecedor.categoria || '',
                endereco: editingFornecedor.endereco || '',
                cidade: editingFornecedor.cidade || '',
                cep: editingFornecedor.cep || '',
                website: editingFornecedor.website || '',
                ativo: editingFornecedor.ativo !== undefined ? editingFornecedor.ativo : true,
                observacoes: editingFornecedor.observacoes || ''
            });
        } else {
            // Reset form for new fornecedor
            setFormData({
                nomeEmpresa: '',
                nomeContato: '',
                email: '',
                telefone: '',
                cnpj: '',
                categoria: '',
                endereco: '',
                cidade: '',
                cep: '',
                website: '',
                ativo: true,
                observacoes: ''
            });
        }
        setErrors({});
    }, [editingFornecedor, visible]);

    const validateForm = () => {
        const newErrors = {};

        if (!formData.nomeEmpresa.trim()) {
            newErrors.nomeEmpresa = 'Nome da empresa é obrigatório';
        }

        if (!formData.email.trim()) {
            newErrors.email = 'Email é obrigatório';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Email inválido';
        }

        if (!formData.categoria.trim()) {
            newErrors.categoria = 'Categoria é obrigatória';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = () => {
        if (validateForm()) {
            onSave(formData);
            onClose();
        }
    };

    const updateField = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
        // Clear error when user starts typing
        if (errors[field]) {
            setErrors(prev => ({
                ...prev,
                [field]: ''
            }));
        }
    };

    const formatCNPJ = (value) => {
        // Remove all non-numeric characters
        const numericValue = value.replace(/\D/g, '');

        // Apply CNPJ formatting: XX.XXX.XXX/XXXX-XX
        if (numericValue.length <= 14) {
            return numericValue
                .replace(/(\d{2})(\d)/, '$1.$2')
                .replace(/(\d{3})(\d)/, '$1.$2')
                .replace(/(\d{3})(\d)/, '$1/$2')
                .replace(/(\d{4})(\d)/, '$1-$2');
        }
        return value;
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>
                            {editingFornecedor ? 'Editar Fornecedor' : 'Novo Fornecedor'}
                        </Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <Text style={styles.closeButtonText}>✕</Text>
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.formContainer}>
                        {/* Nome da Empresa */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Nome da Empresa *</Text>
                            <TextInput
                                style={[styles.input, errors.nomeEmpresa && styles.inputError]}
                                value={formData.nomeEmpresa}
                                onChangeText={(value) => updateField('nomeEmpresa', value)}
                                placeholder="Razão social da empresa"
                                placeholderTextColor="#999"
                            />
                            {errors.nomeEmpresa && <Text style={styles.errorText}>{errors.nomeEmpresa}</Text>}
                        </View>

                        {/* Nome do Contato */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Nome do Contato</Text>
                            <TextInput
                                style={styles.input}
                                value={formData.nomeContato}
                                onChangeText={(value) => updateField('nomeContato', value)}
                                placeholder="Nome da pessoa de contato"
                                placeholderTextColor="#999"
                            />
                        </View>

                        {/* Email */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Email *</Text>
                            <TextInput
                                style={[styles.input, errors.email && styles.inputError]}
                                value={formData.email}
                                onChangeText={(value) => updateField('email', value)}
                                placeholder="contato@empresa.com"
                                placeholderTextColor="#999"
                                keyboardType="email-address"
                                autoCapitalize="none"
                            />
                            {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
                        </View>

                        {/* Telefone */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Telefone</Text>
                            <TextInput
                                style={styles.input}
                                value={formData.telefone}
                                onChangeText={(value) => updateField('telefone', value)}
                                placeholder="(00) 0000-0000"
                                placeholderTextColor="#999"
                                keyboardType="phone-pad"
                            />
                        </View>

                        {/* CNPJ */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>CNPJ</Text>
                            <TextInput
                                style={styles.input}
                                value={formData.cnpj}
                                onChangeText={(value) => updateField('cnpj', formatCNPJ(value))}
                                placeholder="00.000.000/0000-00"
                                placeholderTextColor="#999"
                                keyboardType="numeric"
                                maxLength={18}
                            />
                        </View>

                        {/* Categoria */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Categoria *</Text>
                            <TextInput
                                style={[styles.input, errors.categoria && styles.inputError]}
                                value={formData.categoria}
                                onChangeText={(value) => updateField('categoria', value)}
                                placeholder="Ex: Materiais, Serviços, Equipamentos"
                                placeholderTextColor="#999"
                            />
                            {errors.categoria && <Text style={styles.errorText}>{errors.categoria}</Text>}
                        </View>

                        {/* Endereço */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Endereço</Text>
                            <TextInput
                                style={styles.input}
                                value={formData.endereco}
                                onChangeText={(value) => updateField('endereco', value)}
                                placeholder="Rua, número, bairro"
                                placeholderTextColor="#999"
                            />
                        </View>

                        {/* Cidade */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Cidade</Text>
                            <TextInput
                                style={styles.input}
                                value={formData.cidade}
                                onChangeText={(value) => updateField('cidade', value)}
                                placeholder="Nome da cidade"
                                placeholderTextColor="#999"
                            />
                        </View>

                        {/* CEP */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>CEP</Text>
                            <TextInput
                                style={styles.input}
                                value={formData.cep}
                                onChangeText={(value) => updateField('cep', value)}
                                placeholder="00000-000"
                                placeholderTextColor="#999"
                                keyboardType="numeric"
                            />
                        </View>

                        {/* Website */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Website</Text>
                            <TextInput
                                style={styles.input}
                                value={formData.website}
                                onChangeText={(value) => updateField('website', value)}
                                placeholder="https://www.empresa.com"
                                placeholderTextColor="#999"
                                autoCapitalize="none"
                            />
                        </View>

                        {/* Status Ativo */}
                        <View style={styles.inputGroup}>
                            <View style={styles.switchContainer}>
                                <Text style={styles.label}>Fornecedor Ativo</Text>
                                <Switch
                                    value={formData.ativo}
                                    onValueChange={(value) => updateField('ativo', value)}
                                    trackColor={{ false: '#f0f0f0', true: '#007AFF' }}
                                    thumbColor={formData.ativo ? '#ffffff' : '#f4f3f4'}
                                />
                            </View>
                        </View>

                        {/* Observações */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Observações</Text>
                            <TextInput
                                style={[styles.input, styles.textArea]}
                                value={formData.observacoes}
                                onChangeText={(value) => updateField('observacoes', value)}
                                placeholder="Observações sobre o fornecedor"
                                placeholderTextColor="#999"
                                multiline={true}
                                numberOfLines={3}
                            />
                        </View>
                    </ScrollView>

                    <View style={styles.buttonContainer}>
                        <TouchableOpacity
                            style={styles.cancelButton}
                            onPress={onClose}
                        >
                            <Text style={styles.cancelButtonText}>Cancelar</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.saveButton}
                            onPress={handleSave}
                        >
                            <Text style={styles.saveButtonText}>
                                {editingFornecedor ? 'Atualizar' : 'Salvar'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 20,
        width: '90%',
        maxHeight: '80%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
        paddingBottom: 10,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
    },
    closeButton: {
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: '#f0f0f0',
        justifyContent: 'center',
        alignItems: 'center',
    },
    closeButtonText: {
        fontSize: 16,
        color: '#666',
        fontWeight: 'bold',
    },
    formContainer: {
        maxHeight: 400,
    },
    inputGroup: {
        marginBottom: 15,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginBottom: 5,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        backgroundColor: '#f9f9f9',
    },
    inputError: {
        borderColor: '#e74c3c',
        backgroundColor: '#fdf2f2',
    },
    textArea: {
        height: 80,
        textAlignVertical: 'top',
    },
    switchContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 10,
    },
    errorText: {
        color: '#e74c3c',
        fontSize: 12,
        marginTop: 5,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
        gap: 10,
    },
    cancelButton: {
        flex: 1,
        backgroundColor: '#f0f0f0',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
    },
    cancelButtonText: {
        color: '#666',
        fontSize: 16,
        fontWeight: '600',
    },
    saveButton: {
        flex: 1,
        backgroundColor: '#ffc107',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
    },
    saveButtonText: {
        color: '#333',
        fontSize: 16,
        fontWeight: '600',
    },
});

export default FornecedorForm;
