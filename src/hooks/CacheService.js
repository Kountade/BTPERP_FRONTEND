// src/services/CacheService.js
import localforage from 'localforage';

// ✅ IMPORT CORRIGÉ - remonter jusqu'à components
import AxiosInstance from '../components/AxiosInstance';

// Configuration d'IndexedDB
const db = localforage.createInstance({
    name: 'BTPerpCache',
    storeName: 'cacheData',
    description: 'Cache pour les données hors ligne'
});

class CacheService {
    constructor() {
        this.db = db;
        this.isOnline = navigator.onLine;
        this.pendingOperations = [];
        this.cacheKeys = {
            AGENCES: 'agences',
            AGENCES_LAST_UPDATE: 'agences_last_update',
            ROLES: 'roles',
            USERS: 'users',
            PENDING_OPERATIONS: 'pendingOperations',
            RELATIONS_PREFIX: 'relations_',
            USER_RELATIONS_PREFIX: 'user_relations_',
        };
        this.initializePendingOperations();
        this.setupOnlineListeners();
    }

    // ============================================================
    // INITIALISATION
    // ============================================================

    async initializePendingOperations() {
        try {
            const pending = await this.db.getItem(this.cacheKeys.PENDING_OPERATIONS);
            this.pendingOperations = pending || [];
        } catch (error) {
            console.error('Erreur initialisation pending:', error);
            this.pendingOperations = [];
        }
    }

    setupOnlineListeners() {
        window.addEventListener('online', () => {
            this.isOnline = true;
            console.log('🔗 Connexion rétablie - Synchronisation automatique');
            // ✅ Déclencher la synchronisation automatique
            this.syncPendingData();
        });
        window.addEventListener('offline', () => {
            this.isOnline = false;
            console.log('📴 Mode hors ligne activé');
        });
    }

    // ============================================================
    // OPÉRATIONS EN ATTENTE
    // ============================================================

    async addPendingOperation(operation) {
        this.pendingOperations.push({
            ...operation,
            timestamp: new Date().toISOString(),
            id: Date.now().toString() + '_' + Math.random().toString(36).substr(2, 9)
        });
        await this.db.setItem(this.cacheKeys.PENDING_OPERATIONS, this.pendingOperations);
        console.log(`📝 Opération ajoutée en attente: ${operation.type}`);
        return operation.id;
    }

    async getPendingOperations() {
        return this.pendingOperations;
    }

    async getPendingOperationsByType(type) {
        return this.pendingOperations.filter(op => op.type === type);
    }

    async removePendingOperation(id) {
        this.pendingOperations = this.pendingOperations.filter(op => op.id !== id);
        await this.db.setItem(this.cacheKeys.PENDING_OPERATIONS, this.pendingOperations);
        console.log(`✅ Opération supprimée de la file d'attente: ${id}`);
    }

    async clearPendingOperations() {
        this.pendingOperations = [];
        await this.db.setItem(this.cacheKeys.PENDING_OPERATIONS, []);
        console.log('🧹 File d\'attente vidée');
    }

    async getPendingCount() {
        return this.pendingOperations.length;
    }

    // ============================================================
    // GESTION DES AGENCES
    // ============================================================

    async cacheAgences(agences) {
        try {
            await this.db.setItem(this.cacheKeys.AGENCES, agences);
            await this.db.setItem(this.cacheKeys.AGENCES_LAST_UPDATE, new Date().toISOString());
            console.log(`🏢 ${agences.length} agences mises en cache`);
        } catch (error) {
            console.error('Erreur cache agences:', error);
        }
    }

    async getCachedAgences() {
        try {
            const agences = await this.db.getItem(this.cacheKeys.AGENCES);
            return agences || [];
        } catch (error) {
            console.error('Erreur récupération agences cache:', error);
            return [];
        }
    }

    async getCachedAgenceById(id) {
        try {
            const agences = await this.getCachedAgences();
            return agences.find(a => a.id === parseInt(id)) || null;
        } catch (error) {
            console.error('Erreur récupération agence par id:', error);
            return null;
        }
    }

    async getAgencesLastUpdate() {
        try {
            return await this.db.getItem(this.cacheKeys.AGENCES_LAST_UPDATE) || null;
        } catch (error) {
            return null;
        }
    }

    // ============================================================
    // GESTION DES RÔLES
    // ============================================================

    async cacheRoles(roles) {
        try {
            await this.db.setItem(this.cacheKeys.ROLES, roles);
            console.log(`👤 ${roles.length} rôles mis en cache`);
        } catch (error) {
            console.error('Erreur cache roles:', error);
        }
    }

    async getCachedRoles() {
        try {
            const roles = await this.db.getItem(this.cacheKeys.ROLES);
            return roles || [];
        } catch (error) {
            console.error('Erreur récupération roles cache:', error);
            return [];
        }
    }

    // ============================================================
    // GESTION DES UTILISATEURS
    // ============================================================

    async cacheUsers(users) {
        try {
            await this.db.setItem(this.cacheKeys.USERS, users);
            console.log(`👥 ${users.length} utilisateurs mis en cache`);
        } catch (error) {
            console.error('Erreur cache utilisateurs:', error);
        }
    }

    async getCachedUsers() {
        try {
            const users = await this.db.getItem(this.cacheKeys.USERS);
            return users || [];
        } catch (error) {
            console.error('Erreur récupération users cache:', error);
            return [];
        }
    }

    async getCachedUserById(id) {
        try {
            const users = await this.getCachedUsers();
            return users.find(u => u.id === parseInt(id) || u._id === id) || null;
        } catch (error) {
            console.error('Erreur récupération user par id:', error);
            return null;
        }
    }

    async getCachedUserByEmail(email) {
        try {
            const users = await this.getCachedUsers();
            return users.find(u => u.email === email) || null;
        } catch (error) {
            console.error('Erreur récupération user par email:', error);
            return null;
        }
    }

    async saveUserLocally(userData) {
        try {
            let users = await this.getCachedUsers();
            const existingIndex = users.findIndex(u => u.id === userData.id || u._id === userData._id);
            
            if (existingIndex !== -1) {
                users[existingIndex] = { ...users[existingIndex], ...userData, _synced: false };
            } else {
                users.push({
                    ...userData,
                    _id: userData.id ? userData.id.toString() : Date.now().toString(),
                    _synced: false,
                    _createdAt: new Date().toISOString()
                });
            }
            
            await this.db.setItem(this.cacheKeys.USERS, users);
            console.log(`💾 Utilisateur sauvegardé localement: ${userData.email}`);
            return true;
        } catch (error) {
            console.error('Erreur sauvegarde utilisateur local:', error);
            return false;
        }
    }

    async deleteUserLocally(userId) {
        try {
            let users = await this.getCachedUsers();
            users = users.filter(u => u.id !== parseInt(userId) && u._id !== userId);
            await this.db.setItem(this.cacheKeys.USERS, users);
            console.log(`🗑️ Utilisateur supprimé localement: ${userId}`);
            return true;
        } catch (error) {
            console.error('Erreur suppression utilisateur local:', error);
            return false;
        }
    }

    async getOfflineUsers() {
        try {
            const users = await this.getCachedUsers();
            return users.filter(u => u._synced === false);
        } catch (error) {
            console.error('Erreur récupération utilisateurs hors ligne:', error);
            return [];
        }
    }

    // ============================================================
    // GESTION DES RELATIONS UTILISATEUR-AGENCE
    // ============================================================

    getUserRelationKey(userId) {
        return `${this.cacheKeys.USER_RELATIONS_PREFIX}${userId}`;
    }

    async cacheUserAgenceRelations(userId, relations) {
        try {
            const key = this.getUserRelationKey(userId);
            await this.db.setItem(key, relations);
            console.log(`🔗 Relations utilisateur ${userId} mises en cache (${relations.length})`);
        } catch (error) {
            console.error(`Erreur cache relations utilisateur ${userId}:`, error);
        }
    }

    async getCachedUserAgenceRelations(userId) {
        try {
            const key = this.getUserRelationKey(userId);
            const data = await this.db.getItem(key);
            return data || [];
        } catch (error) {
            console.error(`Erreur récupération relations utilisateur ${userId}:`, error);
            return [];
        }
    }

    async addCachedUserAgenceRelation(userId, agenceId, role) {
        try {
            const relations = await this.getCachedUserAgenceRelations(userId);
            const newRelation = {
                agenceId,
                role,
                assignedAt: new Date().toISOString(),
                _id: Date.now().toString(),
                _offline: true
            };
            relations.push(newRelation);
            await this.cacheUserAgenceRelations(userId, relations);
            return newRelation;
        } catch (error) {
            console.error('Erreur ajout relation utilisateur-agence:', error);
            return null;
        }
    }

    async removeCachedUserAgenceRelation(userId, relationId) {
        try {
            let relations = await this.getCachedUserAgenceRelations(userId);
            relations = relations.filter(r => r._id !== relationId);
            await this.cacheUserAgenceRelations(userId, relations);
            return true;
        } catch (error) {
            console.error('Erreur suppression relation utilisateur-agence:', error);
            return false;
        }
    }

    // ============================================================
    // SYSTÈME DE SYNCHRONISATION
    // ============================================================

    async syncPendingData() {
        if (!this.isOnline) {
            console.log('📴 Hors ligne - Synchronisation impossible');
            return { success: false, message: 'Hors ligne' };
        }

        const pending = await this.getPendingOperations();
        if (pending.length === 0) {
            console.log('✅ Aucune opération en attente');
            return { success: true, message: 'Aucune opération en attente', results: [] };
        }

        console.log(`🔄 Synchronisation de ${pending.length} opération(s)...`);
        const results = [];
        const token = localStorage.getItem('Token');

        for (const operation of pending) {
            try {
                let response;
                switch (operation.type) {
                    case 'CREATE_USER':
                        response = await AxiosInstance.post('/register/', operation.data, {
                            headers: { Authorization: `Token ${token}` }
                        });
                        if (response.data) {
                            await this.saveUserLocally(response.data);
                        }
                        break;

                    case 'UPDATE_USER':
                        response = await AxiosInstance.put(`/users/${operation.userId}/`, operation.data, {
                            headers: { Authorization: `Token ${token}` }
                        });
                        if (response.data) {
                            await this.saveUserLocally(response.data);
                        }
                        break;

                    case 'DELETE_USER':
                        await AxiosInstance.delete(`/users/${operation.userId}/`, {
                            headers: { Authorization: `Token ${token}` }
                        });
                        await this.deleteUserLocally(operation.userId);
                        break;

                    case 'ASSIGN_ROLE':
                        response = await AxiosInstance.post(`/users/${operation.userId}/assign_role/`, operation.data, {
                            headers: { Authorization: `Token ${token}` }
                        });
                        if (response.data) {
                            await this.addCachedUserAgenceRelation(
                                operation.userId,
                                operation.data.agence_id,
                                operation.data.role
                            );
                        }
                        break;

                    default:
                        console.warn(`⚠️ Type d'opération inconnu: ${operation.type}`);
                        continue;
                }

                await this.removePendingOperation(operation.id);
                results.push({ 
                    success: true, 
                    operation: operation.type, 
                    id: operation.id,
                    data: response?.data 
                });
                console.log(`✅ Opération synchronisée: ${operation.type}`);

            } catch (error) {
                console.error(`❌ Erreur sync opération ${operation.id}:`, error);
                results.push({ 
                    success: false, 
                    operation: operation.type, 
                    id: operation.id,
                    error: error.message 
                });
                
                if (error.response?.status === 401) {
                    console.error('🔑 Token expiré - Reconnexion nécessaire');
                    break;
                }
            }
        }

        // Recharger les agences après sync
        if (results.some(r => r.success)) {
            await this.refreshAgencesFromAPI();
        }

        console.log(`📊 Synchronisation terminée: ${results.filter(r => r.success).length} succès`);
        return { 
            success: true, 
            results,
            pending: await this.getPendingOperations()
        };
    }

    async refreshAgencesFromAPI() {
        try {
            const token = localStorage.getItem('Token');
            if (!token) return;
            
            const response = await AxiosInstance.get('/agences/', {
                headers: { Authorization: `Token ${token}` }
            });
            if (response.data) {
                await this.cacheAgences(response.data);
                console.log('🔄 Agences rafraîchies depuis l\'API');
            }
        } catch (error) {
            console.error('Erreur rafraîchissement agences:', error);
        }
    }

    // ============================================================
    // UTILITAIRES
    // ============================================================

    async getCacheStats() {
        try {
            const agences = await this.getCachedAgences();
            const users = await this.getCachedUsers();
            const pending = await this.getPendingOperations();
            
            return {
                agences: agences.length,
                users: users.length,
                offlineUsers: users.filter(u => u._synced === false).length,
                pendingOperations: pending.length,
                lastAgencesUpdate: await this.getAgencesLastUpdate(),
                isOnline: this.isOnline
            };
        } catch (error) {
            console.error('Erreur statistiques cache:', error);
            return null;
        }
    }

    async clearCache() {
        try {
            await this.db.clear();
            this.pendingOperations = [];
            console.log('🧹 Cache vidé complètement');
            return true;
        } catch (error) {
            console.error('Erreur vidage cache:', error);
            return false;
        }
    }
}

// Export d'une instance unique
const cacheService = new CacheService();
export default cacheService;