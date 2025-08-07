// Sistema de Notificações Push e Local
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Configuração das notificações
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
    }),
});

class NotificationManager {
    constructor() {
        this.expoPushToken = null;
        this.notificationListener = null;
        this.responseListener = null;
        this.settings = {
            enabled: true,
            sound: true,
            vibration: true,
            badge: true,
            types: {
                system: true,
                client: true,
                analysis: true,
                tasks: true,
                alerts: true
            }
        };
    }

    // Inicializar sistema de notificações
    async initialize() {
        try {
            // Carregar configurações
            await this.loadSettings();

            // Registrar para push notifications
            await this.registerForPushNotifications();

            // Setup listeners
            this.setupNotificationListeners();

            // Configurar categorias de notificação
            await this.setupNotificationCategories();

            console.log('✅ NotificationManager inicializado');
        } catch (error) {
            console.error('❌ Erro ao inicializar NotificationManager:', error);
        }
    }

    // Registrar para push notifications
    async registerForPushNotifications() {
        if (!Device.isDevice) {
            console.log('Push notifications só funcionam em dispositivos físicos');
            return;
        }

        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }

        if (finalStatus !== 'granted') {
            console.log('Permissão para notificações negada');
            return;
        }

        try {
            this.expoPushToken = await Notifications.getExpoPushTokenAsync({
                projectId: Constants.expoConfig?.extra?.eas?.projectId,
            });
            console.log('Push token:', this.expoPushToken.data);

            // Salvar token no AsyncStorage
            await AsyncStorage.setItem('expoPushToken', this.expoPushToken.data);

            // TODO: Enviar token para o backend
            // await this.sendTokenToBackend(this.expoPushToken.data);

        } catch (error) {
            console.error('Erro ao obter push token:', error);
        }

        // Configuração específica do Android
        if (Platform.OS === 'android') {
            await Notifications.setNotificationChannelAsync('default', {
                name: 'Default',
                importance: Notifications.AndroidImportance.MAX,
                vibrationPattern: [0, 250, 250, 250],
                lightColor: '#1e88e5',
            });

            await Notifications.setNotificationChannelAsync('high', {
                name: 'High Priority',
                importance: Notifications.AndroidImportance.HIGH,
                vibrationPattern: [0, 250, 250, 250],
                lightColor: '#f44336',
            });

            await Notifications.setNotificationChannelAsync('medium', {
                name: 'Medium Priority',
                importance: Notifications.AndroidImportance.DEFAULT,
                vibrationPattern: [0, 250],
                lightColor: '#ff9800',
            });

            await Notifications.setNotificationChannelAsync('low', {
                name: 'Low Priority',
                importance: Notifications.AndroidImportance.LOW,
                lightColor: '#4caf50',
            });
        }
    }

    // Setup listeners para notificações
    setupNotificationListeners() {
        // Listener para notificações recebidas
        this.notificationListener = Notifications.addNotificationReceivedListener(notification => {
            console.log('Notificação recebida:', notification);
            this.handleNotificationReceived(notification);
        });

        // Listener para interação com notificações
        this.responseListener = Notifications.addNotificationResponseReceivedListener(response => {
            console.log('Resposta à notificação:', response);
            this.handleNotificationResponse(response);
        });
    }

    // Configurar categorias de notificação
    async setupNotificationCategories() {
        if (Platform.OS === 'ios') {
            await Notifications.setNotificationCategoryAsync('analysis', [
                {
                    identifier: 'view',
                    buttonTitle: 'Ver Análise',
                    options: { opensAppToForeground: true }
                },
                {
                    identifier: 'dismiss',
                    buttonTitle: 'Dispensar',
                    options: { opensAppToForeground: false }
                }
            ]);

            await Notifications.setNotificationCategoryAsync('task', [
                {
                    identifier: 'complete',
                    buttonTitle: 'Marcar como Completa',
                    options: { opensAppToForeground: false }
                },
                {
                    identifier: 'reschedule',
                    buttonTitle: 'Reagendar',
                    options: { opensAppToForeground: true }
                }
            ]);
        }
    }

    // Agendar notificação local
    async scheduleLocalNotification({
        title,
        body,
        data = {},
        trigger = null,
        priority = 'default',
        category = null
    }) {
        if (!this.settings.enabled) return;

        try {
            const channelId = Platform.OS === 'android' ? priority : 'default';

            const notificationId = await Notifications.scheduleNotificationAsync({
                content: {
                    title,
                    body,
                    data,
                    sound: this.settings.sound ? 'default' : false,
                    categoryIdentifier: category,
                    badge: this.settings.badge ? 1 : undefined,
                },
                trigger: trigger || null,
                channelId
            });

            console.log('Notificação agendada:', notificationId);
            return notificationId;
        } catch (error) {
            console.error('Erro ao agendar notificação:', error);
        }
    }

    // Enviar notificação imediata
    async sendImmediateNotification({ title, body, data = {}, priority = 'default' }) {
        return await this.scheduleLocalNotification({
            title,
            body,
            data,
            priority,
            trigger: null
        });
    }

    // Agendar notificação para data específica
    async scheduleNotificationForDate({ title, body, date, data = {}, priority = 'default' }) {
        const trigger = {
            date: date,
            repeats: false
        };

        return await this.scheduleLocalNotification({
            title,
            body,
            data,
            trigger,
            priority
        });
    }

    // Agendar notificação recorrente
    async scheduleRecurringNotification({
        title,
        body,
        hour,
        minute,
        data = {},
        priority = 'default',
        weekdays = null
    }) {
        const trigger = {
            hour,
            minute,
            repeats: true,
            weekday: weekdays
        };

        return await this.scheduleLocalNotification({
            title,
            body,
            data,
            trigger,
            priority
        });
    }

    // Cancelar notificação
    async cancelNotification(notificationId) {
        try {
            await Notifications.cancelScheduledNotificationAsync(notificationId);
            console.log('Notificação cancelada:', notificationId);
        } catch (error) {
            console.error('Erro ao cancelar notificação:', error);
        }
    }

    // Cancelar todas as notificações
    async cancelAllNotifications() {
        try {
            await Notifications.cancelAllScheduledNotificationsAsync();
            console.log('Todas as notificações canceladas');
        } catch (error) {
            console.error('Erro ao cancelar notificações:', error);
        }
    }

    // Obter notificações agendadas
    async getScheduledNotifications() {
        try {
            return await Notifications.getAllScheduledNotificationsAsync();
        } catch (error) {
            console.error('Erro ao obter notificações agendadas:', error);
            return [];
        }
    }

    // Manipular notificação recebida
    handleNotificationReceived(notification) {
        const { request } = notification;
        const { content } = request;

        // Verificar se o tipo de notificação está habilitado
        const notificationType = content.data?.type || 'system';
        if (!this.settings.types[notificationType]) {
            console.log('Tipo de notificação desabilitado:', notificationType);
            return;
        }

        // Atualizar badge
        if (this.settings.badge) {
            this.updateBadgeCount();
        }

        // Log para debug
        console.log('Notificação processada:', {
            title: content.title,
            body: content.body,
            type: notificationType
        });
    }

    // Manipular resposta à notificação
    handleNotificationResponse(response) {
        const { notification, actionIdentifier } = response;
        const { content } = notification.request;

        console.log('Ação da notificação:', actionIdentifier);
        console.log('Dados:', content.data);

        // TODO: Implementar navegação baseada na ação
        // switch (actionIdentifier) {
        //     case 'view':
        //         // Navegar para tela específica
        //         break;
        //     case 'complete':
        //         // Marcar tarefa como completa
        //         break;
        //     case 'reschedule':
        //         // Abrir tela de reagendamento
        //         break;
        // }
    }

    // Atualizar contador de badge
    async updateBadgeCount() {
        try {
            const count = await this.getUnreadNotificationsCount();
            await Notifications.setBadgeCountAsync(count);
        } catch (error) {
            console.error('Erro ao atualizar badge:', error);
        }
    }

    // Obter número de notificações não lidas
    async getUnreadNotificationsCount() {
        // TODO: Implementar contagem real do banco de dados
        return 0;
    }

    // Carregar configurações
    async loadSettings() {
        try {
            const savedSettings = await AsyncStorage.getItem('notificationSettings');
            if (savedSettings) {
                this.settings = { ...this.settings, ...JSON.parse(savedSettings) };
            }
        } catch (error) {
            console.error('Erro ao carregar configurações:', error);
        }
    }

    // Salvar configurações
    async saveSettings(newSettings) {
        try {
            this.settings = { ...this.settings, ...newSettings };
            await AsyncStorage.setItem('notificationSettings', JSON.stringify(this.settings));
            console.log('Configurações salvas:', this.settings);
        } catch (error) {
            console.error('Erro ao salvar configurações:', error);
        }
    }

    // Obter configurações atuais
    getSettings() {
        return this.settings;
    }

    // Destruir listeners
    destroy() {
        if (this.notificationListener) {
            Notifications.removeNotificationSubscription(this.notificationListener);
        }
        if (this.responseListener) {
            Notifications.removeNotificationSubscription(this.responseListener);
        }
    }

    // Métodos de conveniência para diferentes tipos de notificação

    // Notificação de nova análise
    async notifyNewAnalysis(clientName, analysisType) {
        return await this.sendImmediateNotification({
            title: '🧪 Nova Análise Completada',
            body: `Análise ${analysisType} de ${clientName} foi finalizada`,
            data: { type: 'analysis', action: 'view_analysis' },
            priority: 'high'
        });
    }

    // Notificação de tarefa pendente
    async notifyPendingTask(taskTitle, dueDate) {
        return await this.sendImmediateNotification({
            title: '📋 Tarefa Pendente',
            body: `${taskTitle} - Vence em ${dueDate}`,
            data: { type: 'tasks', action: 'view_task' },
            priority: 'high'
        });
    }

    // Notificação de alerta crítico
    async notifyAlert(message, clientName) {
        return await this.sendImmediateNotification({
            title: '⚠️ Alerta Crítico',
            body: `${message} - Cliente: ${clientName}`,
            data: { type: 'alerts', action: 'view_alert' },
            priority: 'high'
        });
    }

    // Notificação de novo cliente
    async notifyNewClient(clientName) {
        return await this.sendImmediateNotification({
            title: '👤 Novo Cliente',
            body: `${clientName} foi adicionado ao sistema`,
            data: { type: 'client', action: 'view_client' },
            priority: 'medium'
        });
    }

    // Notificação de backup
    async notifyBackupCompleted() {
        return await this.sendImmediateNotification({
            title: '💾 Backup Completo',
            body: 'Backup dos dados realizado com sucesso',
            data: { type: 'system' },
            priority: 'low'
        });
    }
}

export default new NotificationManager();
