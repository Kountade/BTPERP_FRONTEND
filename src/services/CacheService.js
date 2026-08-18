// src/services/CacheService.js
import localforage from 'localforage';
// ❌ SUPPRIMER CETTE LIGNE - NE PAS IMPORTER AXIOS DANS CacheService
// import AxiosInstance from '../components/AxiosInstance';

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
        } catch (error) {
            console.error('Erreur initialisation pending:', error);
            this.pendingOperations = [];
        }
    }

    setupOnlineListeners() {
        window.addEventListener('online', () => {
            this.isOnline = true;
            console.log('🔗 Connexion rétablie');
        });
        window.addEventListener('offline', () => {
            this.isOnline = false;
            console.log('📴 Mode hors ligne');
        });
    }

    // ✅ AJOUTER UNE MÉTHODE POUR AJOUTER DES OPÉRATIONS
    async addPendingOperation(operation) {
        this.pendingOperations.push({
            ...operation,
            timestamp: new Date().toISOString(),
            id: Date.now().toString() + '_' + Math.random().toString(36).substr(2, 9)
        });
        await this.db.setItem(this.cacheKeys.PENDING_OPERATIONS, this.pendingOperations);
        console.log(`📝 Opération ajoutée: ${operation.type}`);
        return operation.id;
    }

    // ✅ AJOUTER UNE MÉTHODE POUR RÉCUPÉRER LES AGENCES EN CACHE
    async getCachedAgences() {
        try {
            const agences = await this.db.getItem(this.cacheKeys.AGENCES);
            return agences || [];
        } catch (error) {
            console.error('Erreur récupération agences cache:', error);
            return [];
        }
    }

    // ✅ AJOUTER UNE MÉTHODE POUR METTRE EN CACHE LES AGENCES
    async cacheAgences(agences) {
        try {
            await this.db.setItem(this.cacheKeys.AGENCES, agences);
            await this.db.setItem(this.cacheKeys.AGENCES_LAST_UPDATE, new Date().toISOString());
            console.log(`🏢 ${agences.length} agences mises en cache`);
        } catch (error) {
            console.error('Erreur cache agences:', error);
        }
    }

    // ✅ AJOUTER UNE MÉTHODE POUR SAUVEGARDER UN UTILISATEUR LOCALEMENT
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