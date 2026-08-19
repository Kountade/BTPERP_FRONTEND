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
            EMPLOYES: 'employes_cache',        // ✅ NOUVEAU
            CONTRATS: 'contrats_cache',         // ✅ NOUVEAU
            SERVICES: 'services_cache',         // ✅ NOUVEAU
            POSTES: 'postes_cache',             // ✅ NOUVEAU
            PROJETS: 'projets_cache',           // ✅ NOUVEAU
            COMPETENCES: 'competences_cache',   // ✅ NOUVEAU
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

    // ============================================================
    // ✅ MÉTHODES DE CACHE PAR CATÉGORIE
    // ============================================================

    // ---- AGENCES ----
    async getCachedAgences() {
        try {
            const agences = await this.db.getItem(this.cacheKeys.AGENCES);
            return agences || [];
        } catch (error) {
            console.error('Erreur récupération agences cache:', error);
            return [];
        }
    }

    async cacheAgences(agences) {
        try {
            await this.db.setItem(this.cacheKeys.AGENCES, agences);
            await this.db.setItem(this.cacheKeys.AGENCES_LAST_UPDATE, new Date().toISOString());
            console.log(`🏢 ${agences.length} agences mises en cache`);
        } catch (error) {
            console.error('Erreur cache agences:', error);
        }
    }

    // ---- EMPLOYÉS ----
    async getCachedEmployes() {
        try {
            const employes = await this.db.getItem(this.cacheKeys.EMPLOYES);
            return employes || [];
        } catch (error) {
            console.error('Erreur récupération employés cache:', error);
            return [];
        }
    }

    async cacheEmployes(employes) {
        try {
            await this.db.setItem(this.cacheKeys.EMPLOYES, employes);
            console.log(`👤 ${employes.length} employés mis en cache`);
        } catch (error) {
            console.error('Erreur cache employés:', error);
        }
    }

    // ---- CONTRATS ----
    async getCachedContrats() {
        try {
            const contrats = await this.db.getItem(this.cacheKeys.CONTRATS);
            return contrats || [];
        } catch (error) {
            console.error('Erreur récupération contrats cache:', error);
            return [];
        }
    }

    async cacheContrats(contrats) {
        try {
            await this.db.setItem(this.cacheKeys.CONTRATS, contrats);
            console.log(`📄 ${contrats.length} contrats mis en cache`);
        } catch (error) {
            console.error('Erreur cache contrats:', error);
        }
    }

    // ---- SERVICES ----
    async getCachedServices() {
        try {
            const services = await this.db.getItem(this.cacheKeys.SERVICES);
            return services || [];
        } catch (error) {
            console.error('Erreur récupération services cache:', error);
            return [];
        }
    }

    async cacheServices(services) {
        try {
            await this.db.setItem(this.cacheKeys.SERVICES, services);
            console.log(`🏢 ${services.length} services mis en cache`);
        } catch (error) {
            console.error('Erreur cache services:', error);
        }
    }

    // ---- POSTES ----
    async getCachedPostes() {
        try {
            const postes = await this.db.getItem(this.cacheKeys.POSTES);
            return postes || [];
        } catch (error) {
            console.error('Erreur récupération postes cache:', error);
            return [];
        }
    }

    async cachePostes(postes) {
        try {
            await this.db.setItem(this.cacheKeys.POSTES, postes);
            console.log(`💼 ${postes.length} postes mis en cache`);
        } catch (error) {
            console.error('Erreur cache postes:', error);
        }
    }

    // ---- PROJETS ----
    async getCachedProjets() {
        try {
            const projets = await this.db.getItem(this.cacheKeys.PROJETS);
            return projets || [];
        } catch (error) {
            console.error('Erreur récupération projets cache:', error);
            return [];
        }
    }

    async cacheProjets(projets) {
        try {
            await this.db.setItem(this.cacheKeys.PROJETS, projets);
            console.log(`🏗️ ${projets.length} projets mis en cache`);
        } catch (error) {
            console.error('Erreur cache projets:', error);
        }
    }

    // ---- COMPÉTENCES ----
    async getCachedCompetences() {
        try {
            const competences = await this.db.getItem(this.cacheKeys.COMPETENCES);
            return competences || [];
        } catch (error) {
            console.error('Erreur récupération compétences cache:', error);
            return [];
        }
    }

    async cacheCompetences(competences) {
        try {
            await this.db.setItem(this.cacheKeys.COMPETENCES, competences);
            console.log(`🎯 ${competences.length} compétences mises en cache`);
        } catch (error) {
            console.error('Erreur cache compétences:', error);
        }
    }

    // ---- UTILISATEURS ----
    async getCachedUsers() {
        try {
            const users = await this.db.getItem(this.cacheKeys.USERS);
            return users || [];
        } catch (error) {
            console.error('Erreur récupération utilisateurs cache:', error);
            return [];
        }
    }

    async cacheUsers(users) {
        try {
            await this.db.setItem(this.cacheKeys.USERS, users);
            console.log(`👤 ${users.length} utilisateurs mis en cache`);
        } catch (error) {
            console.error('Erreur cache utilisateurs:', error);
        }
    }

    // ✅ SAUVEGARDER UN UTILISATEUR LOCALEMENT
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
            
            await this.cacheUsers(users);
            console.log(`💾 Utilisateur sauvegardé localement: ${userData.email}`);
            return true;
        } catch (error) {
            console.error('Erreur sauvegarde utilisateur local:', error);
            return false;
        }
    }

    // ✅ RÉCUPÉRER UN EMPLOYÉ PAR ID (pour les formulaires)
    async getCachedUserById(id) {
        try {
            const employes = await this.getCachedEmployes();
            return employes.find(e => e.id === parseInt(id)) || null;
        } catch (error) {
            console.error('Erreur récupération employé par ID:', error);
            return null;
        }
    }

    // ✅ SYNCHRONISER LES DONNÉES PENDING
    async syncPendingData() {
        if (!this.isOnline) {
            console.log('📡 Hors ligne - Synchronisation impossible');
            return { success: false, message: 'Hors ligne' };
        }

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
                    case 'CREATE_CONTRAT':
                        url = '/contrats/';
                        method = 'POST';
                        break;
                    case 'UPDATE_CONTRAT':
                        url = `/contrats/${operation.contratId}/`;
                        method = 'PUT';
                        break;
                    case 'CREATE_POINTAGE':
                        url = '/pointages/';
                        method = 'POST';
                        break;
                    case 'UPDATE_POINTAGE':
                        url = `/pointages/${operation.pointageId}/`;
                        method = 'PUT';
                        break;
                    case 'CREATE_HEURE_TRAVAIL':
                        url = '/heures-travail/';
                        method = 'POST';
                        break;
                    case 'UPDATE_HEURE_TRAVAIL':
                        url = `/heures-travail/${operation.heureId}/`;
                        method = 'PUT';
                        break;
                    case 'CREATE_ABSENCE':
                        url = '/absences/';
                        method = 'POST';
                        break;
                    case 'UPDATE_ABSENCE':
                        url = `/absences/${operation.absenceId}/`;
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
                
                if (error.response?.status === 401) {
                    console.log('🔒 Token invalide - Déconnexion');
                    localStorage.removeItem('Token');
                    localStorage.removeItem('User');
                    window.location.href = '/login';
                    return { success: false, message: 'Token invalide' };
                }
            }
        }

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

    // ✅ SUPPRIMER UNE ENTRÉE SPÉCIFIQUE DU CACHE
    async removeCacheItem(key) {
        try {
            await this.db.removeItem(key);
            console.log(`🗑️ Cache supprimé: ${key}`);
            return true;
        } catch (error) {
            console.error(`Erreur suppression cache ${key}:`, error);
            return false;
        }
    }

    // ✅ RÉCUPÉRER TOUTES LES CLÉS DU CACHE
    async getCacheKeys() {
        try {
            const keys = await this.db.keys();
            return keys;
        } catch (error) {
            console.error('Erreur récupération clés cache:', error);
            return [];
        }
    }
}

// ✅ EXPORTER L'INSTANCE UNIQUE
const cacheService = new CacheService();
export default cacheService;