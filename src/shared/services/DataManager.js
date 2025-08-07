// Sistema centralizado de gestão de dados cross-module
import { db } from '../../../firebaseConfig.js';
import {
    collection, doc, addDoc, updateDoc, deleteDoc, getDoc,
    getDocs, query, where, orderBy, limit, Timestamp
} from 'firebase/firestore';

class DataManager {
    constructor(companyId) {
        this.companyId = companyId;
    }

    // ===============================
    // GESTÃO DE CLIENTES (Cross-module)
    // ===============================

    async createClient(clientData) {
        const client = {
            ...clientData,
            companyId: this.companyId,
            services: {
                aqua: { active: false, pools: [] },
                verde: { active: false, gardens: [] },
                phyto: { active: false, crops: [] }
            },
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now()
        };

        const docRef = await addDoc(collection(db, 'clients'), client);
        return { id: docRef.id, ...client };
    }

    async getClientById(clientId) {
        const docRef = doc(db, 'clients', clientId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return { id: docSnap.id, ...docSnap.data() };
        }
        return null;
    }

    async getClientsByModule(module) {
        const q = query(
            collection(db, 'clients'),
            where('companyId', '==', this.companyId),
            where(`services.${module}.active`, '==', true)
        );

        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    }

    async updateClientServices(clientId, module, serviceData) {
        const clientRef = doc(db, 'clients', clientId);
        const updateData = {
            [`services.${module}`]: serviceData,
            updatedAt: Timestamp.now()
        };

        await updateDoc(clientRef, updateData);
    }

    // ===============================
    // GESTÃO DE ASSETS (Pools, Gardens, Crops)
    // ===============================

    async createAsset(module, assetData) {
        const collectionName = this.getAssetCollection(module);
        const asset = {
            ...assetData,
            companyId: this.companyId,
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now()
        };

        const docRef = await addDoc(collection(db, collectionName), asset);

        // Atualizar referência no cliente
        await this.updateClientAssetReference(
            assetData.clientId,
            module,
            docRef.id,
            'add'
        );

        return { id: docRef.id, ...asset };
    }

    async getAssetsByClient(clientId, module) {
        const collectionName = this.getAssetCollection(module);
        const q = query(
            collection(db, collectionName),
            where('clientId', '==', clientId),
            where('companyId', '==', this.companyId)
        );

        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    }

    async getAssetById(module, assetId) {
        const collectionName = this.getAssetCollection(module);
        const docRef = doc(db, collectionName, assetId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return { id: docSnap.id, ...docSnap.data() };
        }
        return null;
    }

    getAssetCollection(module) {
        const collections = {
            'aqua': 'pools',
            'verde': 'gardens',
            'phyto': 'crops'
        };
        return collections[module] || 'assets';
    }

    async updateClientAssetReference(clientId, module, assetId, action) {
        const client = await this.getClientById(clientId);
        if (!client) return;

        const assetField = this.getAssetField(module);
        let currentAssets = client.services[module][assetField] || [];

        if (action === 'add' && !currentAssets.includes(assetId)) {
            currentAssets.push(assetId);
        } else if (action === 'remove') {
            currentAssets = currentAssets.filter(id => id !== assetId);
        }

        const updateData = {
            [`services.${module}.${assetField}`]: currentAssets,
            [`services.${module}.active`]: currentAssets.length > 0,
            updatedAt: Timestamp.now()
        };

        const clientRef = doc(db, 'clients', clientId);
        await updateDoc(clientRef, updateData);
    }

    getAssetField(module) {
        const fields = {
            'aqua': 'pools',
            'verde': 'gardens',
            'phyto': 'crops'
        };
        return fields[module] || 'assets';
    }

    // ===============================
    // ANÁLISES CROSS-MODULE
    // ===============================

    async createAnalysis(analysisData) {
        const analysis = {
            ...analysisData,
            companyId: this.companyId,
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now()
        };

        const docRef = await addDoc(collection(db, 'analyses'), analysis);
        return { id: docRef.id, ...analysis };
    }

    async getAnalysesByTarget(module, targetId, limit = 10) {
        const q = query(
            collection(db, 'analyses'),
            where('companyId', '==', this.companyId),
            where('module', '==', module),
            where('targetId', '==', targetId),
            orderBy('createdAt', 'desc'),
            limit(limit)
        );

        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    }

    async getAnalysesByClient(clientId, module = null) {
        let q;

        if (module) {
            q = query(
                collection(db, 'analyses'),
                where('companyId', '==', this.companyId),
                where('clientId', '==', clientId),
                where('module', '==', module),
                orderBy('createdAt', 'desc')
            );
        } else {
            q = query(
                collection(db, 'analyses'),
                where('companyId', '==', this.companyId),
                where('clientId', '==', clientId),
                orderBy('createdAt', 'desc')
            );
        }

        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    }

    // ===============================
    // TAREFAS CROSS-MODULE
    // ===============================

    async createTask(taskData) {
        const task = {
            ...taskData,
            companyId: this.companyId,
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now()
        };

        const docRef = await addDoc(collection(db, 'tasks'), task);
        return { id: docRef.id, ...task };
    }

    async getTasksByTechnician(technicianId, status = null) {
        let q;

        if (status) {
            q = query(
                collection(db, 'tasks'),
                where('companyId', '==', this.companyId),
                where('assignment.technicianId', '==', technicianId),
                where('basicInfo.status', '==', status),
                orderBy('scheduling.scheduledDate', 'asc')
            );
        } else {
            q = query(
                collection(db, 'tasks'),
                where('companyId', '==', this.companyId),
                where('assignment.technicianId', '==', technicianId),
                orderBy('scheduling.scheduledDate', 'asc')
            );
        }

        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    }

    async getTasksByClient(clientId, module = null) {
        let q;

        if (module) {
            q = query(
                collection(db, 'tasks'),
                where('companyId', '==', this.companyId),
                where('assignment.clientId', '==', clientId),
                where('module', '==', module),
                orderBy('scheduling.scheduledDate', 'desc')
            );
        } else {
            q = query(
                collection(db, 'tasks'),
                where('companyId', '==', this.companyId),
                where('assignment.clientId', '==', clientId),
                orderBy('scheduling.scheduledDate', 'desc')
            );
        }

        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    }

    // ===============================
    // DASHBOARD UNIFICADO
    // ===============================

    async getDashboardStats() {
        try {
            // Contar clientes ativos
            const clientsQuery = query(
                collection(db, 'clients'),
                where('companyId', '==', this.companyId),
                where('status', '==', 'active')
            );
            const clientsSnapshot = await getDocs(clientsQuery);
            const totalClients = clientsSnapshot.size;

            // Contar tarefas pendentes
            const tasksQuery = query(
                collection(db, 'tasks'),
                where('companyId', '==', this.companyId),
                where('basicInfo.status', '==', 'pending')
            );
            const tasksSnapshot = await getDocs(tasksQuery);
            const pendingTasks = tasksSnapshot.size;

            // Análises recentes (últimos 7 dias)
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);

            const analysesQuery = query(
                collection(db, 'analyses'),
                where('companyId', '==', this.companyId),
                where('createdAt', '>=', Timestamp.fromDate(weekAgo))
            );
            const analysesSnapshot = await getDocs(analysesQuery);
            const recentAnalyses = analysesSnapshot.size;

            return {
                totalClients,
                pendingTasks,
                recentAnalyses,
                activeModules: await this.getActiveModulesCount()
            };

        } catch (error) {
            console.error('Erro ao buscar estatísticas:', error);
            return {
                totalClients: 0,
                pendingTasks: 0,
                recentAnalyses: 0,
                activeModules: 0
            };
        }
    }

    async getActiveModulesCount() {
        const clientsSnapshot = await getDocs(
            query(
                collection(db, 'clients'),
                where('companyId', '==', this.companyId)
            )
        );

        const moduleStats = { aqua: 0, verde: 0, phyto: 0 };

        clientsSnapshot.docs.forEach(doc => {
            const client = doc.data();
            if (client.services?.aqua?.active) moduleStats.aqua++;
            if (client.services?.verde?.active) moduleStats.verde++;
            if (client.services?.phyto?.active) moduleStats.phyto++;
        });

        return Object.values(moduleStats).filter(count => count > 0).length;
    }

    // ===============================
    // ATIVIDADE RECENTE
    // ===============================

    async getRecentActivity(limitCount = 10) {
        try {
            const activities = [];

            // Análises recentes
            const analysesQuery = query(
                collection(db, 'analyses'),
                where('companyId', '==', this.companyId),
                orderBy('createdAt', 'desc'),
                limit(5)
            );
            const analysesSnapshot = await getDocs(analysesQuery);

            for (const doc of analysesSnapshot.docs) {
                const analysis = doc.data();
                const client = await this.getClientById(analysis.clientId);

                activities.push({
                    type: 'analysis',
                    module: analysis.module,
                    description: `Nova análise - ${client?.personalInfo?.name || 'Cliente'}`,
                    time: this.formatTimeAgo(analysis.createdAt),
                    timestamp: analysis.createdAt
                });
            }

            // Tarefas completadas recentes
            const tasksQuery = query(
                collection(db, 'tasks'),
                where('companyId', '==', this.companyId),
                where('basicInfo.status', '==', 'completed'),
                orderBy('scheduling.completedDate', 'desc'),
                limit(5)
            );
            const tasksSnapshot = await getDocs(tasksQuery);

            for (const doc of tasksSnapshot.docs) {
                const task = doc.data();
                const client = await this.getClientById(task.assignment.clientId);

                activities.push({
                    type: 'task',
                    module: task.module,
                    description: `${task.basicInfo.title} - ${client?.personalInfo?.name || 'Cliente'}`,
                    time: this.formatTimeAgo(task.scheduling.completedDate),
                    timestamp: task.scheduling.completedDate
                });
            }

            // Ordenar por timestamp e limitar
            return activities
                .sort((a, b) => b.timestamp - a.timestamp)
                .slice(0, limitCount);

        } catch (error) {
            console.error('Erro ao buscar atividade recente:', error);
            return [];
        }
    }

    formatTimeAgo(timestamp) {
        const now = new Date();
        const time = timestamp.toDate();
        const diffMs = now - time;
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffHours / 24);

        if (diffDays > 0) {
            return `${diffDays}d atrás`;
        } else if (diffHours > 0) {
            return `${diffHours}h atrás`;
        } else {
            const diffMinutes = Math.floor(diffMs / (1000 * 60));
            return `${diffMinutes}m atrás`;
        }
    }
}

export default DataManager;
