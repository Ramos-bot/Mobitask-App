import React, { useState } from 'react';
import {
    View, Text, TextInput, TouchableOpacity, StyleSheet,
    ScrollView, Alert, StatusBar, Image
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';

export default function ProfileScreen({ user, onBack, onSave }) {
    const [profile, setProfile] = useState({
        displayName: user?.displayName || '',
        email: user?.email || '',
        phone: user?.phone || '',
        company: user?.company || '',
        role: user?.role || 'Técnico',
        bio: user?.bio || '',
        profileImage: user?.profileImage || null,
    });

    const [editing, setEditing] = useState(false);

    const handleImagePicker = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (!result.canceled) {
            setProfile(prev => ({ ...prev, profileImage: result.assets[0].uri }));
        }
    };

    const handleSave = () => {
        if (!profile.displayName.trim()) {
            Alert.alert('Erro', 'O nome é obrigatório');
            return;
        }

        onSave(profile);
        setEditing(false);
        Alert.alert('Sucesso', 'Perfil atualizado com sucesso!');
    };

    const stats = [
        { label: 'Análises', value: '127', icon: '🧪' },
        { label: 'Clientes', value: '24', icon: '👥' },
        { label: 'Dias Ativo', value: '89', icon: '📅' },
    ];

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#1565C0" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={onBack}>
                    <Text style={styles.backIcon}>‹</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Perfil</Text>
                <TouchableOpacity
                    style={styles.editButton}
                    onPress={() => editing ? handleSave() : setEditing(true)}
                >
                    <Text style={styles.editText}>
                        {editing ? 'Guardar' : 'Editar'}
                    </Text>
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Profile Image Section */}
                <View style={styles.imageSection}>
                    <TouchableOpacity
                        style={styles.imageContainer}
                        onPress={editing ? handleImagePicker : null}
                        disabled={!editing}
                    >
                        {profile.profileImage ? (
                            <Image source={{ uri: profile.profileImage }} style={styles.profileImage} />
                        ) : (
                            <View style={styles.placeholderImage}>
                                <Text style={styles.placeholderText}>
                                    {(profile.displayName || profile.email || 'U')[0].toUpperCase()}
                                </Text>
                            </View>
                        )}
                        {editing && (
                            <View style={styles.imageOverlay}>
                                <Text style={styles.imageOverlayText}>📷</Text>
                            </View>
                        )}
                    </TouchableOpacity>
                    <Text style={styles.imageHint}>
                        {editing ? 'Toca para alterar foto' : profile.displayName || 'Nome do Utilizador'}
                    </Text>
                </View>

                {/* Stats */}
                <View style={styles.statsSection}>
                    {stats.map((stat, index) => (
                        <View key={index} style={styles.statItem}>
                            <Text style={styles.statIcon}>{stat.icon}</Text>
                            <Text style={styles.statValue}>{stat.value}</Text>
                            <Text style={styles.statLabel}>{stat.label}</Text>
                        </View>
                    ))}
                </View>

                {/* Form Fields */}
                <View style={styles.formSection}>
                    <View style={styles.fieldGroup}>
                        <Text style={styles.fieldLabel}>Nome Completo</Text>
                        <TextInput
                            style={[styles.input, !editing && styles.inputDisabled]}
                            value={profile.displayName}
                            onChangeText={(text) => setProfile(prev => ({ ...prev, displayName: text }))}
                            placeholder="Digite o seu nome"
                            editable={editing}
                        />
                    </View>

                    <View style={styles.fieldGroup}>
                        <Text style={styles.fieldLabel}>Email</Text>
                        <TextInput
                            style={[styles.input, styles.inputDisabled]}
                            value={profile.email}
                            placeholder="email@exemplo.com"
                            editable={false}
                        />
                        <Text style={styles.fieldHint}>O email não pode ser alterado</Text>
                    </View>

                    <View style={styles.fieldGroup}>
                        <Text style={styles.fieldLabel}>Telefone</Text>
                        <TextInput
                            style={[styles.input, !editing && styles.inputDisabled]}
                            value={profile.phone}
                            onChangeText={(text) => setProfile(prev => ({ ...prev, phone: text }))}
                            placeholder="+351 XXX XXX XXX"
                            keyboardType="phone-pad"
                            editable={editing}
                        />
                    </View>

                    <View style={styles.fieldGroup}>
                        <Text style={styles.fieldLabel}>Empresa</Text>
                        <TextInput
                            style={[styles.input, !editing && styles.inputDisabled]}
                            value={profile.company}
                            onChangeText={(text) => setProfile(prev => ({ ...prev, company: text }))}
                            placeholder="Nome da empresa"
                            editable={editing}
                        />
                    </View>

                    <View style={styles.fieldGroup}>
                        <Text style={styles.fieldLabel}>Função</Text>
                        <TextInput
                            style={[styles.input, !editing && styles.inputDisabled]}
                            value={profile.role}
                            onChangeText={(text) => setProfile(prev => ({ ...prev, role: text }))}
                            placeholder="Ex: Técnico de Piscinas"
                            editable={editing}
                        />
                    </View>

                    <View style={styles.fieldGroup}>
                        <Text style={styles.fieldLabel}>Biografia</Text>
                        <TextInput
                            style={[styles.textArea, !editing && styles.inputDisabled]}
                            value={profile.bio}
                            onChangeText={(text) => setProfile(prev => ({ ...prev, bio: text }))}
                            placeholder="Conte-nos um pouco sobre si..."
                            multiline
                            numberOfLines={4}
                            editable={editing}
                        />
                    </View>
                </View>

                {/* Action Buttons */}
                {editing && (
                    <View style={styles.actionButtons}>
                        <TouchableOpacity
                            style={styles.cancelButton}
                            onPress={() => setEditing(false)}
                        >
                            <Text style={styles.cancelButtonText}>Cancelar</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.saveButton}
                            onPress={handleSave}
                        >
                            <Text style={styles.saveButtonText}>Guardar Alterações</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 50,
        paddingBottom: 20,
        backgroundColor: '#1565C0',
    },
    backButton: {
        padding: 8,
    },
    backIcon: {
        fontSize: 24,
        color: '#fff',
        fontWeight: 'bold',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
    },
    editButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 20,
    },
    editText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
    content: {
        flex: 1,
    },
    imageSection: {
        alignItems: 'center',
        paddingVertical: 30,
        backgroundColor: '#fff',
        marginBottom: 20,
    },
    imageContainer: {
        position: 'relative',
        marginBottom: 15,
    },
    profileImage: {
        width: 120,
        height: 120,
        borderRadius: 60,
        borderWidth: 4,
        borderColor: '#1e88e5',
    },
    placeholderImage: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: '#1e88e5',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 4,
        borderColor: '#1565C0',
    },
    placeholderText: {
        fontSize: 40,
        fontWeight: 'bold',
        color: '#fff',
    },
    imageOverlay: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#1e88e5',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: '#fff',
    },
    imageOverlayText: {
        fontSize: 16,
    },
    imageHint: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
    },
    statsSection: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        paddingVertical: 20,
        marginBottom: 20,
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
    },
    statIcon: {
        fontSize: 24,
        marginBottom: 8,
    },
    statValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 12,
        color: '#666',
        fontWeight: '500',
    },
    formSection: {
        backgroundColor: '#fff',
        padding: 20,
        marginBottom: 20,
    },
    fieldGroup: {
        marginBottom: 20,
    },
    fieldLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 15,
        fontSize: 16,
        backgroundColor: '#fff',
    },
    inputDisabled: {
        backgroundColor: '#f5f5f5',
        color: '#666',
    },
    textArea: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 15,
        fontSize: 16,
        backgroundColor: '#fff',
        height: 100,
        textAlignVertical: 'top',
    },
    fieldHint: {
        fontSize: 12,
        color: '#999',
        marginTop: 5,
    },
    actionButtons: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        paddingBottom: 30,
        gap: 15,
    },
    cancelButton: {
        flex: 1,
        paddingVertical: 15,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ddd',
        alignItems: 'center',
    },
    cancelButtonText: {
        fontSize: 16,
        color: '#666',
        fontWeight: '600',
    },
    saveButton: {
        flex: 1,
        paddingVertical: 15,
        borderRadius: 8,
        backgroundColor: '#1e88e5',
        alignItems: 'center',
    },
    saveButtonText: {
        fontSize: 16,
        color: '#fff',
        fontWeight: '600',
    },
});
