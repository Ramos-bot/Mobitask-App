import React, { useState } from 'react';
import {
    View, Text, TextInput, TouchableOpacity, StyleSheet,
    Alert, KeyboardAvoidingView, Platform, ScrollView
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { auth } from '../../../firebaseConfig';
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    sendPasswordResetEmail
} from 'firebase/auth';

export default function LoginScreen({ onLogin }) {
    const [email, setEmail] = useState('demo@mobitask.pt');
    const [password, setPassword] = useState('123456');
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);

    const handleAuth = async () => {
        if (!email.trim() || !password.trim()) {
            Alert.alert('Erro', 'Preencha todos os campos');
            return;
        }

        setLoading(true);
        try {
            let userCredential;

            if (isLogin) {
                userCredential = await signInWithEmailAndPassword(auth, email, password);
            } else {
                userCredential = await createUserWithEmailAndPassword(auth, email, password);
            }

            const user = userCredential.user;

            // Dados do utilizador para o contexto
            const userData = {
                uid: user.uid,
                email: user.email,
                displayName: user.displayName || email.split('@')[0],
                emailVerified: user.emailVerified,
                createdAt: user.metadata.creationTime,
                lastLoginAt: user.metadata.lastSignInTime
            };

            onLogin(userData);

        } catch (error) {
            console.error('Erro de autenticação:', error);

            let errorMessage = 'Erro desconhecido';
            switch (error.code) {
                case 'auth/user-not-found':
                    errorMessage = 'Utilizador não encontrado';
                    break;
                case 'auth/wrong-password':
                    errorMessage = 'Password incorreta';
                    break;
                case 'auth/email-already-in-use':
                    errorMessage = 'Email já está em uso';
                    break;
                case 'auth/weak-password':
                    errorMessage = 'Password muito fraca';
                    break;
                case 'auth/invalid-email':
                    errorMessage = 'Email inválido';
                    break;
                default:
                    errorMessage = error.message;
            }

            Alert.alert('Erro', errorMessage);
        }
        setLoading(false);
    };

    const handleForgotPassword = async () => {
        if (!email.trim()) {
            Alert.alert('Erro', 'Digite o seu email primeiro');
            return;
        }

        try {
            await sendPasswordResetEmail(auth, email);
            Alert.alert(
                'Email Enviado',
                'Verifique o seu email para redefinir a password'
            );
        } catch (error) {
            Alert.alert('Erro', error.message);
        }
    };

    const handleDemoLogin = () => {
        // Login de demonstração
        const demoUser = {
            uid: 'demo_user_123',
            email: 'demo@mobitask.pt',
            displayName: 'Utilizador Demo',
            emailVerified: true,
            createdAt: new Date().toISOString(),
            lastLoginAt: new Date().toISOString()
        };

        onLogin(demoUser);
    };

    return (
        <LinearGradient
            colors={['#1565C0', '#1e88e5']}
            style={styles.container}
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardContainer}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContainer}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={styles.logo}>🏢</Text>
                        <Text style={styles.title}>Mobitask</Text>
                        <Text style={styles.subtitle}>
                            {isLogin ? 'Bem-vindo de volta!' : 'Criar nova conta'}
                        </Text>
                    </View>

                    {/* Formulário */}
                    <View style={styles.form}>
                        <View style={styles.inputContainer}>
                            <Text style={styles.inputLabel}>Email</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Digite o seu email"
                                placeholderTextColor="rgba(255,255,255,0.7)"
                                value={email}
                                onChangeText={setEmail}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                autoCorrect={false}
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={styles.inputLabel}>Password</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Digite a sua password"
                                placeholderTextColor="rgba(255,255,255,0.7)"
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry
                            />
                        </View>

                        {isLogin && (
                            <TouchableOpacity onPress={handleForgotPassword}>
                                <Text style={styles.forgotPassword}>
                                    Esqueceu a password?
                                </Text>
                            </TouchableOpacity>
                        )}

                        <TouchableOpacity
                            style={styles.authButton}
                            onPress={handleAuth}
                            disabled={loading}
                        >
                            <Text style={styles.authButtonText}>
                                {loading ? 'Carregando...' : (isLogin ? 'Entrar' : 'Registar')}
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.switchModeButton}
                            onPress={() => setIsLogin(!isLogin)}
                        >
                            <Text style={styles.switchModeText}>
                                {isLogin
                                    ? 'Não tem conta? Registe-se'
                                    : 'Já tem conta? Entre aqui'
                                }
                            </Text>
                        </TouchableOpacity>

                        {/* Demo Login */}
                        <View style={styles.demoSection}>
                            <View style={styles.divider}>
                                <View style={styles.dividerLine} />
                                <Text style={styles.dividerText}>ou</Text>
                                <View style={styles.dividerLine} />
                            </View>

                            <TouchableOpacity
                                style={styles.demoButton}
                                onPress={handleDemoLogin}
                            >
                                <Text style={styles.demoButtonText}>
                                    🚀 Entrar como Demo
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Footer */}
                    <View style={styles.footer}>
                        <Text style={styles.footerText}>
                            Mobitask v1.0.0 • Gestão Profissional
                        </Text>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    keyboardContainer: {
        flex: 1,
    },
    scrollContainer: {
        flexGrow: 1,
        justifyContent: 'center',
        paddingHorizontal: 30,
        paddingVertical: 50,
    },
    header: {
        alignItems: 'center',
        marginBottom: 40,
    },
    logo: {
        fontSize: 60,
        marginBottom: 15,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 16,
        color: 'rgba(255,255,255,0.9)',
        textAlign: 'center',
    },
    form: {
        marginBottom: 30,
    },
    inputContainer: {
        marginBottom: 20,
    },
    inputLabel: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8,
    },
    input: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 12,
        padding: 15,
        fontSize: 16,
        color: '#fff',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.3)',
    },
    forgotPassword: {
        color: 'rgba(255,255,255,0.9)',
        fontSize: 14,
        textAlign: 'right',
        marginBottom: 25,
        textDecorationLine: 'underline',
    },
    authButton: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 18,
        alignItems: 'center',
        marginBottom: 20,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    authButtonText: {
        color: '#1565C0',
        fontSize: 16,
        fontWeight: 'bold',
    },
    switchModeButton: {
        alignItems: 'center',
    },
    switchModeText: {
        color: 'rgba(255,255,255,0.9)',
        fontSize: 14,
        textDecorationLine: 'underline',
    },
    demoSection: {
        marginTop: 30,
    },
    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: 'rgba(255,255,255,0.3)',
    },
    dividerText: {
        color: 'rgba(255,255,255,0.7)',
        paddingHorizontal: 15,
        fontSize: 14,
    },
    demoButton: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 12,
        padding: 15,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.3)',
    },
    demoButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
    footer: {
        alignItems: 'center',
        marginTop: 30,
    },
    footerText: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 12,
        textAlign: 'center',
    },
});
