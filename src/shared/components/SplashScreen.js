import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

export default function SplashScreen() {
    const fadeAnim = new Animated.Value(0);
    const scaleAnim = new Animated.Value(0.8);

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 1000,
                useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
                toValue: 1,
                friction: 4,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    return (
        <LinearGradient
            colors={['#1565C0', '#1e88e5', '#42a5f5']}
            style={styles.container}
        >
            <Animated.View
                style={[
                    styles.content,
                    {
                        opacity: fadeAnim,
                        transform: [{ scale: scaleAnim }]
                    }
                ]}
            >
                <View style={styles.logoContainer}>
                    <Text style={styles.logo}>🏢</Text>
                    <Text style={styles.title}>Mobitask</Text>
                    <Text style={styles.subtitle}>Plataforma de Gestão Profissional</Text>
                </View>

                <View style={styles.modulesPreview}>
                    <View style={styles.moduleChip}>
                        <Text style={styles.moduleEmoji}>💧</Text>
                        <Text style={styles.moduleText}>Aqua</Text>
                    </View>
                    <View style={styles.moduleChip}>
                        <Text style={styles.moduleEmoji}>🌱</Text>
                        <Text style={styles.moduleText}>Verde</Text>
                    </View>
                    <View style={styles.moduleChip}>
                        <Text style={styles.moduleEmoji}>🧪</Text>
                        <Text style={styles.moduleText}>Phyto</Text>
                    </View>
                </View>

                <Text style={styles.loadingText}>Carregando...</Text>
            </Animated.View>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: 60,
    },
    logo: {
        fontSize: 80,
        marginBottom: 20,
    },
    title: {
        fontSize: 42,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 10,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        color: 'rgba(255,255,255,0.9)',
        textAlign: 'center',
        lineHeight: 22,
    },
    modulesPreview: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 40,
        gap: 15,
    },
    moduleChip: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingHorizontal: 15,
        paddingVertical: 10,
        borderRadius: 20,
        alignItems: 'center',
        minWidth: 70,
    },
    moduleEmoji: {
        fontSize: 20,
        marginBottom: 5,
    },
    moduleText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '600',
    },
    loadingText: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 16,
        fontWeight: '500',
    },
});
