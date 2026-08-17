// src/services/syncService.js

const DB_NAME = 'BTP_ERP_DB';
const DB_VERSION = 1;
const STORE_NAME = 'pending_operations';

let db = null;
let syncInProgress = false;

// ============================================================
// INDEXEDDB
// ============================================================

const initDB = () => {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        
        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                const store = db.createObjectStore(STORE_NAME, { 
                    keyPath: 'id', 
                    autoIncrement: true 
                });
                store.createIndex('endpoint', 'endpoint', { unique: false });
                store.createIndex('timestamp', 'timestamp', { unique: false });
                store.createIndex('synced', 'synced', { unique: false });
                store.createIndex('method', 'method', { unique: false });
            }
        };
        
        request.onsuccess = (event) => {
            db = event.target.result;
            resolve(db);
        };
        
        request.onerror = (event) => reject(event.target.error);
    });
};

// ============================================================
// OPÉRATIONS DE STOCKAGE
// ============================================================

export const saveOffline = async (endpoint, method, data) => {
    if (!db) await initDB();
    
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    
    const entry = {
        endpoint,
        method,
        data,
        timestamp: new Date().toISOString(),
        synced: false,
        retryCount: 0
    };
    
    return new Promise((resolve, reject) => {
        const request = store.add(entry);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
};

export const getPendingOperations = async () => {
    if (!db) await initDB();
    
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const index = store.index('synced');
    
    return new Promise((resolve, reject) => {
        const request = index.getAll(false);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
};

export const getPendingCount = async () => {
    const ops = await getPendingOperations();
    return ops.length;
};

export const clearSyncedOperations = async () => {
    if (!db) await initDB();
    
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const index = store.index('synced');
    
    return new Promise((resolve, reject) => {
        const request = index.getAll(true);
        request.onsuccess = () => {
            const entries = request.result;
            const deletePromises = entries.map(entry => {
                return new Promise((res, rej) => {
                    const delReq = store.delete(entry.id);
                    delReq.onsuccess = () => res();
                    delReq.onerror = () => rej(delReq.error);
                });
            });
            Promise.all(deletePromises).then(resolve).catch(reject);
        };
        request.onerror = () => reject(request.error);
    });
};

// ============================================================
// SYNCHRONISATION AVEC LE SERVEUR
// ============================================================

export const syncWithServer = async (apiBaseUrl, getToken) => {
    if (syncInProgress) {
        console.log('⏳ Synchronisation déjà en cours...');
        return { success: false, reason: 'already_syncing' };
    }
    
    if (!navigator.onLine) {
        console.log('📡 Hors ligne - synchronisation différée');
        return { success: false, reason: 'offline' };
    }
    
    syncInProgress = true;
    
    try {
        const pendingOps = await getPendingOperations();
        
        if (pendingOps.length === 0) {
            console.log('✅ Aucune donnée à synchroniser');
            syncInProgress = false;
            return { success: true, synced: 0 };
        }
        
        console.log(`🔄 Synchronisation de ${pendingOps.length} opérations...`);
        
        const results = { success: [], failed: [] };
        const token = getToken();
        
        for (const op of pendingOps) {
            try {
                const url = `${apiBaseUrl}${op.endpoint}`;
                
                const response = await fetch(url, {
                    method: op.method,
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': token ? `Token ${token}` : ''
                    },
                    body: JSON.stringify(op.data)
                });
                
                if (response.ok) {
                    await markAsSynced(op.id);
                    results.success.push(op.id);
                    console.log(`✅ Opération ${op.id} synchronisée`);
                } else {
                    results.failed.push(op.id);
                    console.log(`❌ Échec synchronisation ${op.id}: ${response.status}`);
                }
            } catch (error) {
                results.failed.push(op.id);
                console.error(`❌ Erreur synchronisation ${op.id}:`, error);
            }
        }
        
        await clearSyncedOperations();
        
        console.log(`📊 Synchro: ${results.success.length} succès, ${results.failed.length} échecs`);
        
        syncInProgress = false;
        return { success: true, synced: results.success.length, failed: results.failed.length };
        
    } catch (error) {
        syncInProgress = false;
        console.error('❌ Erreur de synchronisation:', error);
        return { success: false, error: error.message };
    }
};

const markAsSynced = async (id) => {
    if (!db) await initDB();
    
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    
    return new Promise((resolve, reject) => {
        const getRequest = store.get(id);
        getRequest.onsuccess = () => {
            const entry = getRequest.result;
            if (entry) {
                entry.synced = true;
                store.put(entry);
                resolve();
            } else {
                resolve();
            }
        };
        getRequest.onerror = () => reject(getRequest.error);
    });
};

// ============================================================
// FONCTION PRINCIPALE - SAUVEGARDE AVEC FALLBACK
// ============================================================

export const saveDataWithOffline = async (endpoint, method, data, apiBaseUrl, getToken) => {
    if (navigator.onLine) {
        try {
            const token = getToken();
            const url = `${apiBaseUrl}${endpoint}`;
            
            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token ? `Token ${token}` : ''
                },
                body: JSON.stringify(data)
            });
            
            if (response.ok) {
                const result = await response.json();
                console.log('✅ Données sauvegardées sur le serveur');
                return { 
                    success: true, 
                    data: result, 
                    online: true 
                };
            } else {
                console.log(`⚠️ Erreur serveur ${response.status}, passage hors ligne`);
            }
        } catch (error) {
            console.log('⚠️ Échec connexion serveur, passage en mode hors ligne');
        }
    }
    
    try {
        const id = await saveOffline(endpoint, method, data);
        console.log('💾 Données sauvegardées localement (ID:', id, ')');
        return { 
            success: true, 
            offline: true,
            id: id
        };
    } catch (error) {
        console.error('❌ Erreur sauvegarde locale:', error);
        return { 
            success: false, 
            error: error.message 
        };
    }
};

// ============================================================
// INITIALISATION
// ============================================================

export const initOfflineService = async () => {
    await initDB();
    console.log('💾 Base de données IndexedDB initialisée');
    
    if (navigator.onLine) {
        const count = await getPendingCount();
        if (count > 0) {
            console.log(`📝 ${count} opérations en attente de synchronisation`);
        }
    }
    
    return true;
};