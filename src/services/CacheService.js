// src/services/CacheService.js
import localforage from 'localforage';
// ✅ IMPORTER AXIOS POUR LA SYNCHRONISATION
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
        };
        this.initializePendingOperations();
        this.setupOnlineListeners();
    }

    async initializePendingOperations() {
        try {
            const pending = await this.db.getItem(this.cacheKeys.PENDING_OPERATIONS);
            this.pendingOperations = pending || [];
            console.log(`📝 ${this.pendingOperations.length} opérations en attente`);
        } catch (error) {
            console.error('Erreur initialisation pending:', error);
            this.pendingOperations = [];
        }
    }

    setupOnlineListeners() {
        window.addEventListener('online', () => {
            this.isOnline = true;
            console.log('🔗 Connexion rétablie - Synchronisation automatique');
            // ✅ DÉCLENCHER LA SYNCHRONISATION AUTO
            this.syncPendingData();
        });
        window.addEventListener('offline', () => {
            this.isOnline = false;
            console.log('📴 Mode hors ligne');
        });
    }

    // ✅ AJOUTER UNE OPÉRATION
    async addPendingOperation(operation) {
        this.pendingOperations.push({
            ...operation,
            timestamp: new Date().toISOString(),
            id: Date.now().toString() + '_' + Math.random().toString(36).substr(2, 9)
        });
        await this.db.setItem(this.cacheKeys.PENDING_OPERATIONS, this.pendingOperations);
        console.log(`📝 Opération ajoutée: ${operation.type} - Total: ${this.pendingOperations.length}`);
        return operation.id;
    }

    // ✅ RÉCUPÉRER LES OPÉRATIONS
    async getPendingOperations() {
        // Recharger depuis le DB pour être sûr
        const pending = await this.db.getItem(this.cacheKeys.PENDING_OPERATIONS);
        this.pendingOperations = pending || [];
        return this.pendingOperations;
    }

    async getPendingCount() {
        const ops = await this.getPendingOperations();
        return ops.length;
    }

    // ✅ SUPPRIMER UNE OPÉRATION
    async removePendingOperation(id) {
        this.pendingOperations = this.pendingOperations.filter(op => op.id !== id);
        await this.db.setItem(this.cacheKeys.PENDING_OPERATIONS, this.pendingOperations);
        console.log(`🗑️ Opération ${id} supprimée`);
    }

    // ✅ RÉCUPÉRER LES AGENCES EN CACHE
    async getCachedAgences() {
        try {
            const agences = await this.db.getItem(this.cacheKeys.AGENCES);
            return agences || [];
        } catch (error) {
            console.error('Erreur récupération agences cache:', error);
            return [];
        }
    }

    // ✅ METTRE EN CACHE LES AGENCES
    async cacheAgences(agences) {
        try {
            await this.db.setItem(this.cacheKeys.AGENCES, agences);
            await this.db.setItem(this.cacheKeys.AGENCES_LAST_UPDATE, new Date().toISOString());
            console.log(`🏢 ${agences.length} agences mises en cache`);
        } catch (error) {
            console.error('Erreur cache agences:', error);
        }
    }

    // ✅ SAUVEGARDER UN UTILISATEUR LOCALEMENT
    async saveUserLocally(userData) {
        try {
            let users = await this.db.getItem(this.cacheKeys.USERS) || [];
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

    // ✅ SYNCHRONISER LES DONNÉES PENDING (NOUVEAU)
    async syncPendingData() {
        if (!this.isOnline) {
            console.log('📡 Hors ligne - Synchronisation impossible');
            return { success: false, message: 'Hors ligne' };
        }

        // Recharger les opérations
        await this.getPendingOperations();
        
        if (this.pendingOperations.length === 0) {
            console.log('✅ Aucune opération en attente');
            return { success: true, message: 'Aucune opération en attente', results: [] };
        }

        console.log(`🔄 Synchronisation de ${this.pendingOperations.length} opération(s)...`);
        const results = [];
        const token = localStorage.getItem('Token');

        if (!token) {
            console.log('❌ Token manquant - Impossible de synchroniser');
            return { success: false, message: 'Token manquant' };
        }

        for (const operation of this.pendingOperations) {
            try {
                let response;
                let url = '';
                let method = '';
                
                // ✅ Déterminer l'URL et la méthode selon le type d'opération
                switch (operation.type) {
                    case 'CREATE_USER':
                        url = '/register/';
                        method = 'POST';
                        break;
                    case 'UPDATE_USER':
                        url = `/users/${operation.userId}/`;
                        method = 'PUT';
                        break;
                    case 'CREATE_EMPLOYE':
                        url = '/employes/';
                        method = 'POST';
                        break;
                    case 'UPDATE_EMPLOYE':
                        url = `/employes/${operation.userId}/`;
                        method = 'PUT';
                        break;
                    default:
                        console.warn(`⚠️ Type d'opération inconnu: ${operation.type}`);
                        continue;
                }

                console.log(`📤 ${method} ${url}`);

                response = await AxiosInstance({
                    method: method,
                    url: url,
                    data: operation.data,
                    headers: { Authorization: `Token ${token}` }
                });

                if (response && response.status >= 200 && response.status < 300) {
                    await this.removePendingOperation(operation.id);
                    results.push({ 
                        success: true, 
                        operation: operation.type, 
                        id: operation.id,
                        data: response.data 
                    });
                    console.log(`✅ Opération ${operation.id} synchronisée: ${operation.type}`);
                } else {
                    results.push({ 
                        success: false, 
                        operation: operation.type, 
                        id: operation.id,
                        error: `HTTP ${response?.status}` 
                    });
                    console.log(`❌ Échec synchronisation ${operation.id}: ${response?.status}`);
                }

            } catch (error) {
                console.error(`❌ Erreur sync opération ${operation.id}:`, error);
                results.push({ 
                    success: false, 
                    operation: operation.type, 
                    id: operation.id,
                    error: error.message 
                });
                
                // Si 401, token invalide
                if (error.response?.status === 401) {
                    console.log('🔒 Token invalide - Déconnexion');
                    localStorage.removeItem('Token');
                    localStorage.removeItem('User');
                    window.location.href = '/login';
                    return { success: false, message: 'Token invalide' };
                }
            }
        }

        // Mettre à jour le compteur
        const remaining = await this.getPendingCount();
        const successCount = results.filter(r => r.success).length;
        console.log(`📊 Synchronisation terminée: ${successCount} succès, ${remaining} restant(s)`);
        
        return { 
            success: true, 
            results,
            remaining
        };
    }

    // ✅ VIDER LE CACHE
    async clearCache() {
        try {
            await this.db.clear();
            this.pendingOperations = [];
            console.log('🧹 Cache vidé');
            return true;
        } catch (error) {
            console.error('Erreur vidage cache:', error);
            return false;
        }
    }
}

// ✅ EXPORTER L'INSTANCE UNIQUE
const cacheService = new CacheService();
export default cacheService;