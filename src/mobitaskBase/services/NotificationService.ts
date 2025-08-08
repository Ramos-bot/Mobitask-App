import { Alert } from 'react-native';

export interface NotificationData {
    id: string;
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
    timestamp: number;
    read: boolean;
    userId: string;
    companyId: string;
    moduleId?: string;
    actionUrl?: string;
    metadata?: Record<string, any>;
}

export interface NotificationOptions {
    persistent?: boolean;
    autoClose?: boolean;
    autoCloseDelay?: number;
    showAlert?: boolean;
}

class NotificationServiceClass {
    private notifications: NotificationData[] = [];
    private listeners: Array<(notifications: NotificationData[]) => void> = [];

    /**
     * Add a notification
     */
    addNotification(
        notification: Omit<NotificationData, 'id' | 'timestamp' | 'read'>,
        options: NotificationOptions = {}
    ): string {
        const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);

        const newNotification: NotificationData = {
            ...notification,
            id,
            timestamp: Date.now(),
            read: false
        };

        this.notifications.unshift(newNotification);
        this.notifyListeners();

        // Show alert if requested
        if (options.showAlert) {
            this.showAlert(newNotification);
        }

        // Auto-close if specified
        if (options.autoClose) {
            const delay = options.autoCloseDelay || 5000;
            setTimeout(() => {
                this.removeNotification(id);
            }, delay);
        }

        // Store in localStorage for persistence
        this.saveToStorage();

        return id;
    }

    /**
     * Remove a notification
     */
    removeNotification(id: string): void {
        this.notifications = this.notifications.filter(n => n.id !== id);
        this.notifyListeners();
        this.saveToStorage();
    }

    /**
     * Mark notification as read
     */
    markAsRead(id: string): void {
        const notification = this.notifications.find(n => n.id === id);
        if (notification) {
            notification.read = true;
            this.notifyListeners();
            this.saveToStorage();
        }
    }

    /**
     * Mark all notifications as read
     */
    markAllAsRead(userId: string): void {
        this.notifications.forEach(notification => {
            if (notification.userId === userId) {
                notification.read = true;
            }
        });
        this.notifyListeners();
        this.saveToStorage();
    }

    /**
     * Get notifications for a user
     */
    getUserNotifications(userId: string, limit?: number): NotificationData[] {
        const userNotifications = this.notifications.filter(n => n.userId === userId);
        return limit ? userNotifications.slice(0, limit) : userNotifications;
    }

    /**
     * Get unread count for a user
     */
    getUnreadCount(userId: string): number {
        return this.notifications.filter(n => n.userId === userId && !n.read).length;
    }

    /**
     * Clear all notifications for a user
     */
    clearUserNotifications(userId: string): void {
        this.notifications = this.notifications.filter(n => n.userId !== userId);
        this.notifyListeners();
        this.saveToStorage();
    }

    /**
     * Subscribe to notification changes
     */
    subscribe(listener: (notifications: NotificationData[]) => void): () => void {
        this.listeners.push(listener);

        // Return unsubscribe function
        return () => {
            this.listeners = this.listeners.filter(l => l !== listener);
        };
    }

    /**
     * Show native alert
     */
    private showAlert(notification: NotificationData): void {
        const buttons = [
            { text: 'OK', onPress: () => this.markAsRead(notification.id) }
        ];

        if (notification.actionUrl) {
            buttons.unshift({
                text: 'Ver',
                onPress: () => {
                    this.markAsRead(notification.id);
                    // Handle navigation to actionUrl
                    // This would typically integrate with your navigation system
                }
            });
        }

        Alert.alert(
            notification.title,
            notification.message,
            buttons
        );
    }

    /**
     * Notify all listeners
     */
    private notifyListeners(): void {
        this.listeners.forEach(listener => {
            try {
                listener([...this.notifications]);
            } catch (error) {
                console.error('Error notifying listener:', error);
            }
        });
    }

    /**
     * Save notifications to localStorage
     */
    private saveToStorage(): void {
        if (typeof window !== 'undefined') {
            try {
                const data = {
                    notifications: this.notifications,
                    timestamp: Date.now()
                };
                localStorage.setItem('mobitask_notifications', JSON.stringify(data));
            } catch (error) {
                console.error('Failed to save notifications:', error);
            }
        }
    }

    /**
     * Load notifications from localStorage
     */
    loadFromStorage(): void {
        if (typeof window !== 'undefined') {
            try {
                const stored = localStorage.getItem('mobitask_notifications');
                if (stored) {
                    const data = JSON.parse(stored);

                    // Only load if data is recent (within 24 hours)
                    const maxAge = 24 * 60 * 60 * 1000; // 24 hours
                    if (Date.now() - data.timestamp < maxAge) {
                        this.notifications = data.notifications || [];
                        this.notifyListeners();
                    }
                }
            } catch (error) {
                console.error('Failed to load notifications:', error);
            }
        }
    }

    /**
     * Clean old notifications (older than 30 days)
     */
    cleanOldNotifications(): void {
        const maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days
        const cutoff = Date.now() - maxAge;

        this.notifications = this.notifications.filter(n => n.timestamp > cutoff);
        this.notifyListeners();
        this.saveToStorage();
    }

    // Convenience methods for different notification types

    success(title: string, message: string, userId: string, companyId: string, options?: NotificationOptions): string {
        return this.addNotification({
            title,
            message,
            type: 'success',
            userId,
            companyId
        }, options);
    }

    error(title: string, message: string, userId: string, companyId: string, options?: NotificationOptions): string {
        return this.addNotification({
            title,
            message,
            type: 'error',
            userId,
            companyId
        }, { showAlert: true, ...options });
    }

    warning(title: string, message: string, userId: string, companyId: string, options?: NotificationOptions): string {
        return this.addNotification({
            title,
            message,
            type: 'warning',
            userId,
            companyId
        }, options);
    }

    info(title: string, message: string, userId: string, companyId: string, options?: NotificationOptions): string {
        return this.addNotification({
            title,
            message,
            type: 'info',
            userId,
            companyId
        }, options);
    }
}

// Export singleton instance
export const NotificationService = new NotificationServiceClass();
