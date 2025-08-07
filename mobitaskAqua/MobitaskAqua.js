import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ScrollView, KeyboardAvoidingView, TouchableOpacity } from 'react-native';
import MobitaskAquaSplash from './MobitaskAquaSplash';
import DashboardAqua from './DashboardAqua';
import HistoricoAnalises from './HistoricoAnalises';
import NovaAnalise from './NovaAnalise';
import AnalisePorImagem from './AnalisePorImagem';
import DetalhesAnalise from './DetalhesAnalise';
import AlertasClientes from './AlertasClientes';
import ResumoAlertas from './ResumoAlertas';

export default function MobitaskAqua() {
    const [entrou, setEntrou] = useState(false);
    const [ecrã, setEcrã] = useState('dashboard');
    const [analiseSelecionada, setAnaliseSelecionada] = useState(null);

    // Se ainda não entrou, mostra o splash screen
    if (!entrou) return <MobitaskAquaSplash onEntrar={() => setEntrou(true)} />;

    // Navegação simples com useState
    if (ecrã === 'nova') return <NovaAnalise setEcrã={setEcrã} />;
    if (ecrã === 'imagem') return <AnalisePorImagem setEcrã={setEcrã} />;
    if (ecrã === 'historico')
        return <HistoricoAnalises
            setEcrã={setEcrã}
            setAnaliseSelecionada={setAnaliseSelecionada}
            setEcrãDetalhes={() => setEcrã('detalhes')}
        />;
    if (ecrã === 'detalhes') return <DetalhesAnalise analise={analiseSelecionada} setEcrã={setEcrã} />;
    if (ecrã === 'alertas') return <AlertasClientes setEcrã={setEcrã} />;

    // Dashboard principal
    return <DashboardAqua setEcrã={setEcrã} />;
}
