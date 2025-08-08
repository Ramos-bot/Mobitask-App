import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TextInput,
    TouchableOpacity,
    Alert,
    ScrollView
} from 'react-native';

const ClienteForm = ({
    visible,
    onClose,
    onSave,
    editingCliente = null
}) => {
    const [formData, setFormData] = useState({
        nome: '',
        email: '',
        telefone: '',
        empresa: '',
        endereco: '',
        cidade: '',
        cep: '',
        observacoes: ''
    });

    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (editingCliente) {
            setFormData({
                nome: editingCliente.nome || '',
                email: editingCliente.email || '',
                telefone: editingCliente.telefone || '',
                empresa: editingCliente.empresa || '',
                endereco: editingCliente.endereco || '',
                cidade: editingCliente.cidade || '',
                cep: editingCliente.cep || '',
                observacoes: editingCliente.observacoes || ''
            });
        } else {
            // Reset form for new client
            setFormData({
                nome: '',
                email: '',
                telefone: '',
                empresa: '',
                endereco: '',
                cidade: '',
                cep: '',
                observacoes: ''
            });
        }
        setErrors({});
    }, [editingCliente, visible]);

    const validateForm = () => {
        const newErrors = {};

        if (!formData.nome.trim()) {
            newErrors.nome = 'Nome é obrigatório';
        }

        if (!formData.email.trim()) {
            newErrors.email = 'Email é obrigatório';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Email inválido';
        }

        if (!formData.telefone.trim()) {
            newErrors.telefone = 'Telefone é obrigatório';
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
                            {editingCliente ? 'Editar Cliente' : 'Novo Cliente'}
                        </Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <Text style={styles.closeButtonText}>✕</Text>
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.formContainer}>
                        {/* Nome */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Nome *</Text>
                            <TextInput
                                style={[styles.input, errors.nome && styles.inputError]}
                                value={formData.nome}
                                onChangeText={(value) => updateField('nome', value)}
                                placeholder="Nome completo do cliente"
                                placeholderTextColor="#999"
                            />
                            {errors.nome && <Text style={styles.errorText}>{errors.nome}</Text>}
                        </View>

                        {/* Email */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Email *</Text>
                            <TextInput
                                style={[styles.input, errors.email && styles.inputError]}
                                value={formData.email}
                                onChangeText={(value) => updateField('email', value)}
                                placeholder="email@exemplo.com"
                                placeholderTextColor="#999"
                                keyboardType="email-address"
                                autoCapitalize="none"
                            />
                            {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
                        </View>

                        {/* Telefone */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Telefone *</Text>
                            <TextInput
                                style={[styles.input, errors.telefone && styles.inputError]}
                                value={formData.telefone}
                                onChangeText={(value) => updateField('telefone', value)}
                                placeholder="(00) 00000-0000"
                                placeholderTextColor="#999"
                                keyboardType="phone-pad"
                            />
                            {errors.telefone && <Text style={styles.errorText}>{errors.telefone}</Text>}
                        </View>

                        {/* Empresa */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Empresa</Text>
                            <TextInput
                                style={styles.input}
                                value={formData.empresa}
                                onChangeText={(value) => updateField('empresa', value)}
                                placeholder="Nome da empresa"
                                placeholderTextColor="#999"
                            />
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

                        {/* Observações */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Observações</Text>
                            <TextInput
                                style={[styles.input, styles.textArea]}
                                value={formData.observacoes}
                                onChangeText={(value) => updateField('observacoes', value)}
                                placeholder="Observações adicionais sobre o cliente"
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
                                {editingCliente ? 'Atualizar' : 'Salvar'}
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
        backgroundColor: '#007AFF',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
    },
    saveButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
});

export default ClienteForm;
