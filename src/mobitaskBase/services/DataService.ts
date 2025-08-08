import {
    collection,
    doc,
    getDocs,
    getDoc,
    addDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    limit,
    DocumentReference,
    DocumentData,
    QuerySnapshot,
    DocumentSnapshot,
    FirestoreError
} from 'firebase/firestore';
import { db } from '../../../firebaseConfig';

interface CacheEntry {
    data: any;
    timestamp: number;
    ttl: number; // Time to live in milliseconds
}

interface OfflineAction {
    id: string;
    type: 'create' | 'update' | 'delete';
    collection: string;
    docId?: string;
    data?: any;
    timestamp: number;
    companyId: string;
    moduleId: string;
}

export class DataService {
    private cache = new Map<string, CacheEntry>();
    private offlineQueue: OfflineAction[] = [];
    private isOnline = true;
    private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

    constructor() {
        // Listen for online/offline status
        if (typeof window !== 'undefined') {
            window.addEventListener('online', this.handleOnline.bind(this));
            window.addEventListener('offline', this.handleOffline.bind(this));
            this.isOnline = navigator.onLine;
        }
    }

    private handleOnline(): void {
        this.isOnline = true;
        this.syncOfflineQueue();
    }

    private handleOffline(): void {
        this.isOnline = false;
    }

    private getCacheKey(companyId: string, moduleId: string, collectionName: string, docId?: string): string {
        return `${companyId}:${moduleId}:${collectionName}${docId ? `:${docId}` : ''}`;
    }

    private getFromCache(key: string): any | null {
        const entry = this.cache.get(key);
        if (!entry) return null;

        if (Date.now() - entry.timestamp > entry.ttl) {
            this.cache.delete(key);
            return null;
        }

        return entry.data;
    }

    private setCache(key: string, data: any, ttl: number = this.CACHE_TTL): void {
        this.cache.set(key, {
            data,
            timestamp: Date.now(),
            ttl
        });
    }

    private getCollectionPath(companyId: string, moduleId: string, collectionName: string): string {
        return `companies/${companyId}/modules/${moduleId}/${collectionName}`;
    }

    private addToOfflineQueue(action: Omit<OfflineAction, 'id' | 'timestamp'>): void {
        const offlineAction: OfflineAction = {
            ...action,
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            timestamp: Date.now()
        };
        this.offlineQueue.push(offlineAction);

        // Store in localStorage for persistence
        if (typeof window !== 'undefined') {
            localStorage.setItem('mobitask_offline_queue', JSON.stringify(this.offlineQueue));
        }
    }

    private async syncOfflineQueue(): Promise<void> {
        if (!this.isOnline || this.offlineQueue.length === 0) return;

        const actionsToSync = [...this.offlineQueue];
        this.offlineQueue = [];

        for (const action of actionsToSync) {
            try {
                const collectionPath = this.getCollectionPath(action.companyId, action.moduleId, action.collection);

                switch (action.type) {
                    case 'create':
                        await addDoc(collection(db, collectionPath), {
                            ...action.data,
                            createdAt: action.timestamp,
                            _syncedAt: Date.now()
                        });
                        break;

                    case 'update':
                        if (action.docId) {
                            await updateDoc(doc(db, collectionPath, action.docId), {
                                ...action.data,
                                updatedAt: Date.now(),
                                _syncedAt: Date.now()
                            });
                        }
                        break;

                    case 'delete':
                        if (action.docId) {
                            await deleteDoc(doc(db, collectionPath, action.docId));
                        }
                        break;
                }
            } catch (error) {
                console.error('Failed to sync offline action:', error);
                // Re-add failed actions to queue
                this.offlineQueue.push(action);
            }
        }

        // Update localStorage
        if (typeof window !== 'undefined') {
            localStorage.setItem('mobitask_offline_queue', JSON.stringify(this.offlineQueue));
        }
    }

    /**
     * Get list of documents from a collection
     */
    async getList(
        companyId: string,
        moduleId: string,
        collectionName: string,
        options: {
            orderByField?: string;
            orderDirection?: 'asc' | 'desc';
            limitCount?: number;
            whereClause?: { field: string; operator: any; value: any };
        } = {}
    ): Promise<any[]> {
        const cacheKey = this.getCacheKey(companyId, moduleId, collectionName);

        // Try cache first
        const cached = this.getFromCache(cacheKey);
        if (cached && this.isOnline) {
            return cached;
        }

        try {
            const collectionPath = this.getCollectionPath(companyId, moduleId, collectionName);
            let q: any = collection(db, collectionPath);

            // Apply filters
            if (options.whereClause) {
                q = query(q, where(options.whereClause.field, options.whereClause.operator, options.whereClause.value));
            }

            if (options.orderByField) {
                q = query(q, orderBy(options.orderByField, options.orderDirection || 'asc'));
            }

            if (options.limitCount) {
                q = query(q, limit(options.limitCount));
            }

            const snapshot: QuerySnapshot = await getDocs(q);
            const documents = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            // Cache the result
            this.setCache(cacheKey, documents);

            return documents;
        } catch (error) {
            console.error('Error getting documents:', error);
            // Return cached data if available during error
            return cached || [];
        }
    }

    /**
     * Get a single document
     */
    async getDoc(companyId: string, moduleId: string, collectionName: string, docId: string): Promise<any | null> {
        const cacheKey = this.getCacheKey(companyId, moduleId, collectionName, docId);

        // Try cache first
        const cached = this.getFromCache(cacheKey);
        if (cached && this.isOnline) {
            return cached;
        }

        try {
            const collectionPath = this.getCollectionPath(companyId, moduleId, collectionName);
            const docRef = doc(db, collectionPath, docId);
            const snapshot: DocumentSnapshot = await getDoc(docRef);

            if (snapshot.exists()) {
                const document = {
                    id: snapshot.id,
                    ...snapshot.data()
                };

                // Cache the result
                this.setCache(cacheKey, document);

                return document;
            }

            return null;
        } catch (error) {
            console.error('Error getting document:', error);
            return cached || null;
        }
    }

    /**
     * Create or update a document (upsert)
     */
    async upsert(
        companyId: string,
        moduleId: string,
        collectionName: string,
        data: any,
        docId?: string
    ): Promise<string> {
        const timestamp = Date.now();
        const documentData = {
            ...data,
            [docId ? 'updatedAt' : 'createdAt']: timestamp,
            companyId,
            moduleId
        };

        if (!this.isOnline) {
            // Add to offline queue
            this.addToOfflineQueue({
                type: docId ? 'update' : 'create',
                collection: collectionName,
                docId,
                data: documentData,
                companyId,
                moduleId
            });

            // Update local cache optimistically
            const cacheKey = this.getCacheKey(companyId, moduleId, collectionName, docId);
            if (docId) {
                this.setCache(cacheKey, { id: docId, ...documentData });
            }

            return docId || `offline_${timestamp}`;
        }

        try {
            const collectionPath = this.getCollectionPath(companyId, moduleId, collectionName);

            if (docId) {
                // Update existing document
                const docRef = doc(db, collectionPath, docId);
                await updateDoc(docRef, documentData);

                // Update cache
                const cacheKey = this.getCacheKey(companyId, moduleId, collectionName, docId);
                this.setCache(cacheKey, { id: docId, ...documentData });

                return docId;
            } else {
                // Create new document
                const docRef = await addDoc(collection(db, collectionPath), documentData);

                // Update cache
                const cacheKey = this.getCacheKey(companyId, moduleId, collectionName, docRef.id);
                this.setCache(cacheKey, { id: docRef.id, ...documentData });

                // Invalidate list cache
                const listCacheKey = this.getCacheKey(companyId, moduleId, collectionName);
                this.cache.delete(listCacheKey);

                return docRef.id;
            }
        } catch (error) {
            console.error('Error upserting document:', error);
            throw error;
        }
    }

    /**
     * Delete a document
     */
    async delete(companyId: string, moduleId: string, collectionName: string, docId: string): Promise<void> {
        if (!this.isOnline) {
            // Add to offline queue
            this.addToOfflineQueue({
                type: 'delete',
                collection: collectionName,
                docId,
                companyId,
                moduleId
            });

            // Remove from cache
            const cacheKey = this.getCacheKey(companyId, moduleId, collectionName, docId);
            this.cache.delete(cacheKey);

            return;
        }

        try {
            const collectionPath = this.getCollectionPath(companyId, moduleId, collectionName);
            await deleteDoc(doc(db, collectionPath, docId));

            // Remove from cache
            const cacheKey = this.getCacheKey(companyId, moduleId, collectionName, docId);
            this.cache.delete(cacheKey);

            // Invalidate list cache
            const listCacheKey = this.getCacheKey(companyId, moduleId, collectionName);
            this.cache.delete(listCacheKey);

        } catch (error) {
            console.error('Error deleting document:', error);
            throw error;
        }
    }

    /**
     * Clear cache for a specific collection
     */
    clearCache(companyId: string, moduleId: string, collectionName: string): void {
        const prefix = `${companyId}:${moduleId}:${collectionName}`;
        for (const key of this.cache.keys()) {
            if (key.startsWith(prefix)) {
                this.cache.delete(key);
            }
        }
    }

    /**
     * Get offline queue status
     */
    getOfflineStatus(): { isOnline: boolean; queueLength: number } {
        return {
            isOnline: this.isOnline,
            queueLength: this.offlineQueue.length
        };
    }

    /**
     * Load offline queue from localStorage
     */
    loadOfflineQueue(): void {
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem('mobitask_offline_queue');
            if (stored) {
                try {
                    this.offlineQueue = JSON.parse(stored);
                } catch (error) {
                    console.error('Failed to load offline queue:', error);
                    this.offlineQueue = [];
                }
            }
        }
    }
}

// Export singleton instance
export const dataService = new DataService();
