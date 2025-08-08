import { dataService } from './DataService';

export interface ConsentData {
    analytics: boolean;
    marketing: boolean;
    necessary: boolean;
    timestamp: number;
    ipAddress?: string;
    userAgent?: string;
}

export interface DataExportRequest {
    userId: string;
    companyId: string;
    requestDate: number;
    email: string;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    downloadUrl?: string;
    expiryDate?: number;
}

export interface DataDeletionRequest {
    userId: string;
    companyId: string;
    requestDate: number;
    email: string;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    reason?: string;
    retentionUntil?: number; // Legal retention period
}

export interface AuditLogEntry {
    id: string;
    userId: string;
    companyId: string;
    action: string;
    resource: string;
    resourceId?: string;
    timestamp: number;
    ipAddress?: string;
    userAgent?: string;
    metadata?: Record<string, any>;
}

class PrivacyManagerClass {
    private readonly LEGAL_RETENTION_PERIOD = 7 * 365 * 24 * 60 * 60 * 1000; // 7 years in milliseconds

    /**
     * Record user consent
     */
    async recordConsent(
        userId: string,
        companyId: string,
        consents: Partial<ConsentData>
    ): Promise<void> {
        const consentData: ConsentData = {
            analytics: false,
            marketing: false,
            necessary: true, // Always true for essential functionality
            timestamp: Date.now(),
            ipAddress: await this.getClientIP(),
            userAgent: this.getUserAgent(),
            ...consents
        };

        try {
            await dataService.upsert(companyId, 'privacy', 'consents', consentData, userId);

            // Log the consent action
            await this.auditDataAccess(
                userId,
                companyId,
                'consent_recorded',
                'user_consent',
                userId,
                { consents: consentData }
            );
        } catch (error) {
            console.error('Failed to record consent:', error);
            throw new Error('Failed to record consent');
        }
    }

    /**
     * Get user consent status
     */
    async getUserConsent(userId: string, companyId: string): Promise<ConsentData | null> {
        try {
            return await dataService.getDoc(companyId, 'privacy', 'consents', userId);
        } catch (error) {
            console.error('Failed to get user consent:', error);
            return null;
        }
    }

    /**
     * Export all user data (GDPR Article 20 - Right to data portability)
     */
    async exportClientData(userId: string, companyId: string, email: string): Promise<string> {
        try {
            // Create export request
            const requestId = Date.now().toString() + Math.random().toString(36).substr(2, 9);
            const exportRequest: DataExportRequest = {
                userId,
                companyId,
                requestDate: Date.now(),
                email,
                status: 'pending'
            };

            await dataService.upsert(companyId, 'privacy', 'export_requests', exportRequest, requestId);

            // Log the export request
            await this.auditDataAccess(
                userId,
                companyId,
                'data_export_requested',
                'user_data',
                userId,
                { email, requestId }
            );

            // In a real implementation, this would trigger a background job
            // For now, we'll process it immediately
            await this.processDataExport(requestId, companyId);

            return requestId;
        } catch (error) {
            console.error('Failed to export client data:', error);
            throw new Error('Failed to initiate data export');
        }
    }

    /**
     * Process data export (would typically be a background job)
     */
    private async processDataExport(requestId: string, companyId: string): Promise<void> {
        try {
            const request = await dataService.getDoc(companyId, 'privacy', 'export_requests', requestId);
            if (!request) {
                throw new Error('Export request not found');
            }

            // Update status to processing
            await dataService.upsert(companyId, 'privacy', 'export_requests',
                { status: 'processing' }, requestId);

            // Collect all user data from different modules
            const userData = await this.collectUserData(request.userId, companyId);

            // In a real implementation, you would:
            // 1. Generate a secure download link
            // 2. Create a ZIP file with all user data
            // 3. Send email with download link
            // 4. Set expiry date for the download

            const downloadUrl = `https://exports.mobitask.com/${requestId}`;
            const expiryDate = Date.now() + (7 * 24 * 60 * 60 * 1000); // 7 days

            await dataService.upsert(companyId, 'privacy', 'export_requests', {
                status: 'completed',
                downloadUrl,
                expiryDate
            }, requestId);

            // Log completion
            await this.auditDataAccess(
                request.userId,
                companyId,
                'data_export_completed',
                'user_data',
                request.userId,
                { requestId, downloadUrl }
            );

        } catch (error) {
            console.error('Failed to process data export:', error);

            // Update status to failed
            await dataService.upsert(companyId, 'privacy', 'export_requests',
                { status: 'failed' }, requestId);
        }
    }

    /**
     * Collect all user data from various modules
     */
    private async collectUserData(userId: string, companyId: string): Promise<Record<string, any>> {
        const userData: Record<string, any> = {};

        try {
            // Get user profile
            userData.profile = await dataService.getDoc(companyId, 'base', 'users', userId);

            // Get consent history
            userData.consents = await dataService.getDoc(companyId, 'privacy', 'consents', userId);

            // Get audit logs
            userData.auditLogs = await dataService.getList(companyId, 'privacy', 'audit_logs', {
                whereClause: { field: 'userId', operator: '==', value: userId }
            });

            // Get data from different modules (verde, aqua, phyto)
            const modules = ['verde', 'aqua', 'phyto'];
            for (const module of modules) {
                userData[module] = {};

                // Get client data where user is involved
                userData[module].clients = await dataService.getList(companyId, module, 'clients', {
                    whereClause: { field: '_writableBy', operator: '==', value: userId }
                });

                // Get services
                userData[module].services = await dataService.getList(companyId, module, 'services', {
                    whereClause: { field: 'assignedTo', operator: 'array-contains', value: userId }
                });

                // Get irrigation systems
                userData[module].irrigationSystems = await dataService.getList(companyId, module, 'irrigationSystems', {
                    whereClause: { field: '_writableBy', operator: '==', value: userId }
                });
            }

            return userData;
        } catch (error) {
            console.error('Failed to collect user data:', error);
            throw error;
        }
    }

    /**
     * Delete all user data (GDPR Article 17 - Right to erasure)
     */
    async deleteClientData(userId: string, companyId: string, reason?: string): Promise<string> {
        try {
            // Create deletion request
            const requestId = Date.now().toString() + Math.random().toString(36).substr(2, 9);
            const deletionRequest: DataDeletionRequest = {
                userId,
                companyId,
                requestDate: Date.now(),
                email: '', // Would get from user profile
                status: 'pending',
                reason,
                retentionUntil: Date.now() + this.LEGAL_RETENTION_PERIOD
            };

            await dataService.upsert(companyId, 'privacy', 'deletion_requests', deletionRequest, requestId);

            // Log the deletion request
            await this.auditDataAccess(
                userId,
                companyId,
                'data_deletion_requested',
                'user_data',
                userId,
                { reason, requestId }
            );

            // In a real implementation, this would be carefully reviewed
            // For now, we'll mark as pending for manual review

            return requestId;
        } catch (error) {
            console.error('Failed to delete client data:', error);
            throw new Error('Failed to initiate data deletion');
        }
    }

    /**
     * Audit data access (GDPR Article 30 - Records of processing activities)
     */
    async auditDataAccess(
        userId: string,
        companyId: string,
        action: string,
        resource: string,
        resourceId?: string,
        metadata?: Record<string, any>
    ): Promise<void> {
        const auditEntry: Omit<AuditLogEntry, 'id'> = {
            userId,
            companyId,
            action,
            resource,
            resourceId,
            timestamp: Date.now(),
            ipAddress: await this.getClientIP(),
            userAgent: this.getUserAgent(),
            metadata
        };

        try {
            const entryId = Date.now().toString() + Math.random().toString(36).substr(2, 9);
            await dataService.upsert(companyId, 'privacy', 'audit_logs', auditEntry, entryId);
        } catch (error) {
            console.error('Failed to create audit log:', error);
            // Don't throw error here as it shouldn't break the main operation
        }
    }

    /**
     * Get audit logs for a user
     */
    async getUserAuditLogs(
        userId: string,
        companyId: string,
        limit: number = 100
    ): Promise<AuditLogEntry[]> {
        try {
            return await dataService.getList(companyId, 'privacy', 'audit_logs', {
                whereClause: { field: 'userId', operator: '==', value: userId },
                orderByField: 'timestamp',
                orderDirection: 'desc',
                limitCount: limit
            });
        } catch (error) {
            console.error('Failed to get audit logs:', error);
            return [];
        }
    }

    /**
     * Check if user can be deleted (no legal retention requirements)
     */
    async canDeleteUser(userId: string, companyId: string): Promise<boolean> {
        try {
            // Check if there are any legal retention requirements
            const auditLogs = await this.getUserAuditLogs(userId, companyId, 1);
            if (auditLogs.length === 0) {
                return true;
            }

            const lastActivity = auditLogs[0].timestamp;
            const retentionPeriod = Date.now() - this.LEGAL_RETENTION_PERIOD;

            return lastActivity < retentionPeriod;
        } catch (error) {
            console.error('Failed to check user deletion eligibility:', error);
            return false;
        }
    }

    /**
     * Get client IP address (placeholder - would integrate with your network setup)
     */
    private async getClientIP(): Promise<string> {
        // In a real implementation, this would get the actual client IP
        // For now, return a placeholder
        return '0.0.0.0';
    }

    /**
     * Get user agent string
     */
    private getUserAgent(): string {
        if (typeof window !== 'undefined' && window.navigator) {
            return window.navigator.userAgent;
        }
        return 'MobiTask Mobile App';
    }

    /**
     * Anonymize user data (alternative to deletion)
     */
    async anonymizeUserData(userId: string, companyId: string): Promise<void> {
        try {
            // Replace personal identifiers with anonymized versions
            const anonymizedData = {
                name: 'Anonymous User',
                email: `anon_${Date.now()}@deleted.local`,
                phone: '',
                _anonymized: true,
                _anonymizedAt: Date.now()
            };

            await dataService.upsert(companyId, 'base', 'users', anonymizedData, userId);

            // Log the anonymization
            await this.auditDataAccess(
                userId,
                companyId,
                'user_data_anonymized',
                'user_profile',
                userId
            );

        } catch (error) {
            console.error('Failed to anonymize user data:', error);
            throw new Error('Failed to anonymize user data');
        }
    }
}

// Export singleton instance
export const PrivacyManager = new PrivacyManagerClass();
