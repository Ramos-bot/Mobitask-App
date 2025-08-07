// Sistema de Backup e Sincronização
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import { Platform, Alert } from 'react-native';
import { db } from '../../../firebaseConfig';
import {
    collection, getDocs, doc, setDoc, query, where,
    orderBy, limit, Timestamp
} from 'firebase/firestore';
import NotificationManager from './NotificationManager';

class BackupManager {
    constructor() {
        this.isBackingUp = false;
        this.isRestoring = false;
        this.lastBackupDate = null;
        this.autoBackupEnabled = true;
        this.backupFrequency = 'daily'; // daily, weekly, monthly
        this.maxBackupFiles = 5;
    }

    // Inicializar sistema de backup
    async initialize() {
        try {
            await this.loadSettings();
            await this.checkAutoBackup();
            console.log('✅ BackupManager inicializado');
        } catch (error) {
            console.error('❌ Erro ao inicializar BackupManager:', error);
        }
    }

    // Carregar configurações
    async loadSettings() {
        try {
            const settings = await AsyncStorage.getItem('backupSettings');
            if (settings) {
                const parsed = JSON.parse(settings);
                this.autoBackupEnabled = parsed.autoBackupEnabled ?? true;
                this.backupFrequency = parsed.backupFrequency ?? 'daily';
                this.maxBackupFiles = parsed.maxBackupFiles ?? 5;
                this.lastBackupDate = parsed.lastBackupDate ? new Date(parsed.lastBackupDate) : null;
            }
        } catch (error) {
            console.error('Erro ao carregar configurações de backup:', error);
        }
    }

    // Salvar configurações
    async saveSettings() {
        try {
            const settings = {
                autoBackupEnabled: this.autoBackupEnabled,
                backupFrequency: this.backupFrequency,
                maxBackupFiles: this.maxBackupFiles,
                lastBackupDate: this.lastBackupDate?.toISOString()
            };
            await AsyncStorage.setItem('backupSettings', JSON.stringify(settings));
        } catch (error) {
            console.error('Erro ao salvar configurações de backup:', error);
        }
    }

    // Verificar se é necessário fazer backup automático
    async checkAutoBackup() {
        if (!this.autoBackupEnabled) return;

        const now = new Date();
        let shouldBackup = false;

        if (!this.lastBackupDate) {
            shouldBackup = true;
        } else {
            const timeDiff = now.getTime() - this.lastBackupDate.getTime();
            const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

            switch (this.backupFrequency) {
                case 'daily':
                    shouldBackup = daysDiff >= 1;
                    break;
                case 'weekly':
                    shouldBackup = daysDiff >= 7;
                    break;
                case 'monthly':
                    shouldBackup = daysDiff >= 30;
                    break;
            }
        }

        if (shouldBackup) {
            console.log('Realizando backup automático...');
            await this.performAutoBackup();
        }
    }

    // Realizar backup automático
    async performAutoBackup() {
        try {
            const backupData = await this.createBackupData();
            await this.saveBackupToLocal(backupData, true);

            // Tentar sincronizar com Firebase
            await this.syncToFirebase(backupData);

            this.lastBackupDate = new Date();
            await this.saveSettings();

            // Notificar usuário
            await NotificationManager.notifyBackupCompleted();

            console.log('✅ Backup automático concluído');
        } catch (error) {
            console.error('❌ Erro no backup automático:', error);
        }
    }

    // Criar dados do backup
    async createBackupData() {
        try {
            const backupData = {
                version: '1.0.0',
                timestamp: new Date().toISOString(),
                device: Platform.OS,
                data: {}
            };

            // Backup do AsyncStorage
            const keys = await AsyncStorage.getAllKeys();
            const asyncStorageData = await AsyncStorage.multiGet(keys);
            backupData.data.localStorage = {};

            asyncStorageData.forEach(([key, value]) => {
                if (value) {
                    try {
                        backupData.data.localStorage[key] = JSON.parse(value);
                    } catch {
                        backupData.data.localStorage[key] = value;
                    }
                }
            });

            // Backup do Firebase (se conectado)
            try {
                backupData.data.firebase = await this.getFirebaseData();
            } catch (error) {
                console.log('Firebase não disponível para backup:', error.message);
                backupData.data.firebase = null;
            }

            // Metadados
            backupData.metadata = {
                totalSize: JSON.stringify(backupData).length,
                recordCount: this.countRecords(backupData.data),
                modules: this.getActiveModules()
            };

            return backupData;
        } catch (error) {
            console.error('Erro ao criar dados do backup:', error);
            throw error;
        }
    }

    // Obter dados do Firebase
    async getFirebaseData() {
        const firebaseData = {};

        try {
            // Clientes
            const clientsSnapshot = await getDocs(collection(db, 'clients'));
            firebaseData.clients = clientsSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            // Análises (últimas 100)
            const analysisQuery = query(
                collection(db, 'analyses'),
                orderBy('createdAt', 'desc'),
                limit(100)
            );
            const analysisSnapshot = await getDocs(analysisQuery);
            firebaseData.analyses = analysisSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            // Assets
            const assetsSnapshot = await getDocs(collection(db, 'assets'));
            firebaseData.assets = assetsSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            // Tarefas
            const tasksSnapshot = await getDocs(collection(db, 'tasks'));
            firebaseData.tasks = tasksSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

        } catch (error) {
            console.error('Erro ao obter dados do Firebase:', error);
            throw error;
        }

        return firebaseData;
    }

    // Salvar backup localmente
    async saveBackupToLocal(backupData, isAutomatic = false) {
        try {
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const filename = `mobitask_backup_${timestamp}.json`;
            const prefix = isAutomatic ? 'auto_' : 'manual_';
            const finalFilename = prefix + filename;

            const backupDir = FileSystem.documentDirectory + 'backups/';
            await FileSystem.makeDirectoryAsync(backupDir, { intermediates: true });

            const filePath = backupDir + finalFilename;
            await FileSystem.writeAsStringAsync(filePath, JSON.stringify(backupData, null, 2));

            // Limpar backups antigos
            await this.cleanOldBackups(backupDir);

            console.log('✅ Backup salvo em:', filePath);
            return filePath;
        } catch (error) {
            console.error('❌ Erro ao salvar backup:', error);
            throw error;
        }
    }

    // Limpar backups antigos
    async cleanOldBackups(backupDir) {
        try {
            const files = await FileSystem.readDirectoryAsync(backupDir);
            const backupFiles = files
                .filter(file => file.endsWith('.json'))
                .sort()
                .reverse();

            if (backupFiles.length > this.maxBackupFiles) {
                const filesToDelete = backupFiles.slice(this.maxBackupFiles);
                for (const file of filesToDelete) {
                    await FileSystem.deleteAsync(backupDir + file);
                    console.log('🗑️ Backup antigo removido:', file);
                }
            }
        } catch (error) {
            console.error('Erro ao limpar backups antigos:', error);
        }
    }

    // Sincronizar com Firebase
    async syncToFirebase(backupData) {
        try {
            const backupRef = doc(db, 'backups', `backup_${Date.now()}`);
            await setDoc(backupRef, {
                ...backupData,
                // Remover dados locais sensíveis
                data: {
                    ...backupData.data,
                    localStorage: null // Não sincronizar localStorage por questões de privacidade
                }
            });
            console.log('✅ Backup sincronizado com Firebase');
        } catch (error) {
            console.log('⚠️ Não foi possível sincronizar com Firebase:', error.message);
            // Não é erro crítico, backup local ainda funciona
        }
    }

    // Fazer backup manual
    async createManualBackup() {
        if (this.isBackingUp) {
            throw new Error('Backup já em progresso');
        }

        try {
            this.isBackingUp = true;

            const backupData = await this.createBackupData();
            const filePath = await this.saveBackupToLocal(backupData, false);

            // Tentar sincronizar
            await this.syncToFirebase(backupData);

            this.lastBackupDate = new Date();
            await this.saveSettings();

            return {
                success: true,
                filePath,
                size: backupData.metadata.totalSize,
                recordCount: backupData.metadata.recordCount
            };
        } catch (error) {
            console.error('Erro no backup manual:', error);
            throw error;
        } finally {
            this.isBackingUp = false;
        }
    }

    // Exportar backup
    async exportBackup(backupPath) {
        try {
            if (await Sharing.isAvailableAsync()) {
                await Sharing.shareAsync(backupPath, {
                    mimeType: 'application/json',
                    dialogTitle: 'Exportar Backup do Mobitask'
                });
                return true;
            } else {
                throw new Error('Compartilhamento não disponível neste dispositivo');
            }
        } catch (error) {
            console.error('Erro ao exportar backup:', error);
            throw error;
        }
    }

    // Listar backups locais
    async listLocalBackups() {
        try {
            const backupDir = FileSystem.documentDirectory + 'backups/';
            const files = await FileSystem.readDirectoryAsync(backupDir);

            const backups = [];
            for (const file of files) {
                if (file.endsWith('.json')) {
                    const filePath = backupDir + file;
                    const info = await FileSystem.getInfoAsync(filePath);

                    backups.push({
                        filename: file,
                        path: filePath,
                        size: info.size,
                        modificationTime: new Date(info.modificationTime * 1000),
                        isAutomatic: file.startsWith('auto_')
                    });
                }
            }

            return backups.sort((a, b) => b.modificationTime - a.modificationTime);
        } catch (error) {
            console.error('Erro ao listar backups:', error);
            return [];
        }
    }

    // Importar backup
    async importBackup() {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: 'application/json',
                copyToCacheDirectory: true
            });

            if (result.type === 'cancel') {
                return null;
            }

            const backupContent = await FileSystem.readAsStringAsync(result.uri);
            const backupData = JSON.parse(backupContent);

            return await this.restoreFromBackup(backupData);
        } catch (error) {
            console.error('Erro ao importar backup:', error);
            throw error;
        }
    }

    // Restaurar de backup
    async restoreFromBackup(backupData) {
        if (this.isRestoring) {
            throw new Error('Restauração já em progresso');
        }

        try {
            this.isRestoring = true;

            // Validar backup
            if (!this.validateBackup(backupData)) {
                throw new Error('Backup inválido ou corrompido');
            }

            // Restaurar AsyncStorage
            if (backupData.data.localStorage) {
                await this.restoreAsyncStorage(backupData.data.localStorage);
            }

            // Restaurar Firebase
            if (backupData.data.firebase) {
                await this.restoreFirebaseData(backupData.data.firebase);
            }

            return {
                success: true,
                restoredRecords: backupData.metadata.recordCount,
                backupDate: new Date(backupData.timestamp)
            };
        } catch (error) {
            console.error('Erro na restauração:', error);
            throw error;
        } finally {
            this.isRestoring = false;
        }
    }

    // Validar backup
    validateBackup(backupData) {
        return (
            backupData &&
            backupData.version &&
            backupData.timestamp &&
            backupData.data &&
            backupData.metadata
        );
    }

    // Restaurar AsyncStorage
    async restoreAsyncStorage(localStorageData) {
        try {
            // Limpar dados existentes (exceto configurações críticas)
            const criticalKeys = ['notificationSettings', 'backupSettings', 'expoPushToken'];
            const allKeys = await AsyncStorage.getAllKeys();
            const keysToRemove = allKeys.filter(key => !criticalKeys.includes(key));

            if (keysToRemove.length > 0) {
                await AsyncStorage.multiRemove(keysToRemove);
            }

            // Restaurar dados
            const pairs = Object.entries(localStorageData).map(([key, value]) => [
                key,
                typeof value === 'string' ? value : JSON.stringify(value)
            ]);

            await AsyncStorage.multiSet(pairs);
            console.log('✅ AsyncStorage restaurado');
        } catch (error) {
            console.error('❌ Erro ao restaurar AsyncStorage:', error);
            throw error;
        }
    }

    // Restaurar dados do Firebase
    async restoreFirebaseData(firebaseData) {
        try {
            // Restaurar clientes
            if (firebaseData.clients) {
                for (const client of firebaseData.clients) {
                    const { id, ...clientData } = client;
                    await setDoc(doc(db, 'clients', id), clientData);
                }
            }

            // Restaurar análises
            if (firebaseData.analyses) {
                for (const analysis of firebaseData.analyses) {
                    const { id, ...analysisData } = analysis;
                    await setDoc(doc(db, 'analyses', id), analysisData);
                }
            }

            // Restaurar assets
            if (firebaseData.assets) {
                for (const asset of firebaseData.assets) {
                    const { id, ...assetData } = asset;
                    await setDoc(doc(db, 'assets', id), assetData);
                }
            }

            // Restaurar tarefas
            if (firebaseData.tasks) {
                for (const task of firebaseData.tasks) {
                    const { id, ...taskData } = task;
                    await setDoc(doc(db, 'tasks', id), taskData);
                }
            }

            console.log('✅ Dados do Firebase restaurados');
        } catch (error) {
            console.error('❌ Erro ao restaurar Firebase:', error);
            throw error;
        }
    }

    // Contar registros
    countRecords(data) {
        let count = 0;

        if (data.localStorage) {
            count += Object.keys(data.localStorage).length;
        }

        if (data.firebase) {
            if (data.firebase.clients) count += data.firebase.clients.length;
            if (data.firebase.analyses) count += data.firebase.analyses.length;
            if (data.firebase.assets) count += data.firebase.assets.length;
            if (data.firebase.tasks) count += data.firebase.tasks.length;
        }

        return count;
    }

    // Obter módulos ativos
    getActiveModules() {
        // TODO: Implementar detecção de módulos ativos
        return ['base', 'aqua', 'verde', 'phyto'];
    }

    // Configurar backup automático
    async setAutoBackup(enabled, frequency = 'daily') {
        this.autoBackupEnabled = enabled;
        this.backupFrequency = frequency;
        await this.saveSettings();
    }

    // Obter estatísticas
    getStats() {
        return {
            lastBackupDate: this.lastBackupDate,
            autoBackupEnabled: this.autoBackupEnabled,
            backupFrequency: this.backupFrequency,
            maxBackupFiles: this.maxBackupFiles,
            isBackingUp: this.isBackingUp,
            isRestoring: this.isRestoring
        };
    }
}

export default new BackupManager();
