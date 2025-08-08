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

const ColaboradorForm = ({
    visible,
    onClose,
    onSave,
    editingColaborador = null
}) => {
    const [formData, setFormData] = useState({
        nome: '',
        email: '',
        telefone: '',
        cargo: '',
        departamento: '',
        dataAdmissao: '',
        salario: '',
        ativo: true,
        endereco: '',
        observacoes: ''
    });

    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (editingColaborador) {
            setFormData({
                nome: editingColaborador.nome || '',
                email: editingColaborador.email || '',
                telefone: editingColaborador.telefone || '',
                cargo: editingColaborador.cargo || '',
                departamento: editingColaborador.departamento || '',
                dataAdmissao: editingColaborador.dataAdmissao || '',
                salario: editingColaborador.salario || '',
                ativo: editingColaborador.ativo !== undefined ? editingColaborador.ativo : true,
                endereco: editingColaborador.endereco || '',
                observacoes: editingColaborador.observacoes || ''
            });
        } else {
            // Reset form for new colaborador
            setFormData({
                nome: '',
                email: '',
                telefone: '',
                cargo: '',
                departamento: '',
                dataAdmissao: '',
                salario: '',
                ativo: true,
                endereco: '',
                observacoes: ''
            });
        }
        setErrors({});
    }, [editingColaborador, visible]);

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

        if (!formData.cargo.trim()) {
            newErrors.cargo = 'Cargo é obrigatório';
        }

        if (!formData.departamento.trim()) {
            newErrors.departamento = 'Departamento é obrigatório';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = () => {
        if (validateForm()) {
            // Convert salario to number if provided
            const dataToSave = {
                ...formData,
                salario: formData.salario ? parseFloat(formData.salario.replace(/[^\d.,]/g, '').replace(',', '.')) : 0
            };
            onSave(dataToSave);
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

    const formatSalario = (value) => {
        // Simple currency formatting
        const numericValue = value.replace(/[^\d]/g, '');
        if (numericValue) {
            return new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'EUR'
            }).format(numericValue / 100);
        }
        return '';
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
                            {editingColaborador ? 'Editar Colaborador' : 'Novo Colaborador'}
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
                                placeholder="Nome completo do colaborador"
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
                                placeholder="email@empresa.com"
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
                                placeholder="(00) 00000-0000"
                                placeholderTextColor="#999"
                                keyboardType="phone-pad"
                            />
                        </View>

                        {/* Cargo */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Cargo *</Text>
                            <TextInput
                                style={[styles.input, errors.cargo && styles.inputError]}
                                value={formData.cargo}
                                onChangeText={(value) => updateField('cargo', value)}
                                placeholder="Ex: Desenvolvedor, Gerente, Analista"
                                placeholderTextColor="#999"
                            />
                            {errors.cargo && <Text style={styles.errorText}>{errors.cargo}</Text>}
                        </View>

                        {/* Departamento */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Departamento *</Text>
                            <TextInput
                                style={[styles.input, errors.departamento && styles.inputError]}
                                value={formData.departamento}
                                onChangeText={(value) => updateField('departamento', value)}
                                placeholder="Ex: TI, RH, Vendas, Marketing"
                                placeholderTextColor="#999"
                            />
                            {errors.departamento && <Text style={styles.errorText}>{errors.departamento}</Text>}
                        </View>

                        {/* Data de Admissão */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Data de Admissão</Text>
                            <TextInput
                                style={styles.input}
                                value={formData.dataAdmissao}
                                onChangeText={(value) => updateField('dataAdmissao', value)}
                                placeholder="DD/MM/AAAA"
                                placeholderTextColor="#999"
                            />
                        </View>

                        {/* Salário */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Salário</Text>
                            <TextInput
                                style={styles.input}
                                value={formData.salario}
                                onChangeText={(value) => updateField('salario', value)}
                                placeholder="€ 0,00"
                                placeholderTextColor="#999"
                                keyboardType="numeric"
                            />
                        </View>

                        {/* Status Ativo */}
                        <View style={styles.inputGroup}>
                            <View style={styles.switchContainer}>
                                <Text style={styles.label}>Colaborador Ativo</Text>
                                <Switch
                                    value={formData.ativo}
                                    onValueChange={(value) => updateField('ativo', value)}
                                    trackColor={{ false: '#f0f0f0', true: '#007AFF' }}
                                    thumbColor={formData.ativo ? '#ffffff' : '#f4f3f4'}
                                />
                            </View>
                        </View>

                        {/* Endereço */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Endereço</Text>
                            <TextInput
                                style={styles.input}
                                value={formData.endereco}
                                onChangeText={(value) => updateField('endereco', value)}
                                placeholder="Endereço completo"
                                placeholderTextColor="#999"
                            />
                        </View>

                        {/* Observações */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Observações</Text>
                            <TextInput
                                style={[styles.input, styles.textArea]}
                                value={formData.observacoes}
                                onChangeText={(value) => updateField('observacoes', value)}
                                placeholder="Observações sobre o colaborador"
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
                                {editingColaborador ? 'Atualizar' : 'Salvar'}
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
        backgroundColor: '#28a745',
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

export default ColaboradorForm;
