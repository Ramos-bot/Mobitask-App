// Sugestão: Sistema de navegação mais robusto
// npm install @react-navigation/native @react-navigation/stack

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

// Importar todas as telas
import MobitaskAquaSplash from './MobitaskAquaSplash';
import DashboardAqua from './DashboardAqua';
import NovaAnalise from './NovaAnalise';
import AnalisePorImagem from './AnalisePorImagem';
import HistoricoAnalises from './HistoricoAnalises';
import DetalhesAnalise from './DetalhesAnalise';
import AlertasClientes from './AlertasClientes';

const Stack = createStackNavigator();

export default function MobitaskAquaNavigator() {
    return (
        <NavigationContainer>
            <Stack.Navigator
                initialRouteName="Splash"
                screenOptions={{
                    headerStyle: {
                        backgroundColor: '#1e88e5',
                    },
                    headerTintColor: '#fff',
                    headerTitleStyle: {
                        fontWeight: 'bold',
                    },
                }}
            >
                <Stack.Screen
                    name="Splash"
                    component={MobitaskAquaSplash}
                    options={{ headerShown: false }}
                />
                <Stack.Screen
                    name="Dashboard"
                    component={DashboardAqua}
                    options={{ title: '💧 Mobitask Aqua' }}
                />
                <Stack.Screen
                    name="NovaAnalise"
                    component={NovaAnalise}
                    options={{ title: '🧪 Nova Análise' }}
                />
                <Stack.Screen
                    name="AnalisePorImagem"
                    component={AnalisePorImagem}
                    options={{ title: '📸 Análise por Imagem' }}
                />
                <Stack.Screen
                    name="Historico"
                    component={HistoricoAnalises}
                    options={{ title: '📖 Histórico' }}
                />
                <Stack.Screen
                    name="Detalhes"
                    component={DetalhesAnalise}
                    options={{ title: '📊 Detalhes da Análise' }}
                />
                <Stack.Screen
                    name="Alertas"
                    component={AlertasClientes}
                    options={{ title: '🔔 Alertas' }}
                />
            </Stack.Navigator>
        </NavigationContainer>
    );
}
