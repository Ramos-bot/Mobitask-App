import NotificationManager from './NotificationManager';
import BackupManager from './BackupManager';

class ServiceInitializer {
    static async initializeServices() {
        try {
            console.log('Initializing core services...');

            // Initialize notification system
            await NotificationManager.initialize();
            console.log('✅ Notification system initialized');

            // Initialize backup system  
            await BackupManager.initialize();
            console.log('✅ Backup system initialized');

            // Schedule automatic backup if enabled
            const autoBackupEnabled = await BackupManager.isAutoBackupEnabled();
            if (autoBackupEnabled) {
                await BackupManager.scheduleAutoBackup();
                console.log('✅ Auto backup scheduled');
            }

            console.log('🎉 All services initialized successfully');
            return true;
        } catch (error) {
            console.error('❌ Error initializing services:', error);
            return false;
        }
    }

    static async reinitializeServices() {
        try {
            // Cleanup existing services
            await NotificationManager.cleanup();
            await BackupManager.cleanup();

            // Reinitialize
            return await this.initializeServices();
        } catch (error) {
            console.error('❌ Error reinitializing services:', error);
            return false;
        }
    }
}

export default ServiceInitializer;
