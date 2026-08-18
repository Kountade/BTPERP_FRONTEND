// src/hooks/useOfflineData.js
import { useState, useEffect, useCallback } from 'react';
import CacheService from '../services/CacheService';
import AxiosInstance from '../components/AxiosInstance';  // ← CORRIGÉ

export function useOfflineData() {
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [isSyncing, setIsSyncing] = useState(false);
    const [pendingCount, setPendingCount] = useState(0);
    const [agences, setAgences] = useState([]);
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [cacheStats, setCacheStats] = useState(null);

    // Surveiller la connexion
    useEffect(() => {
        const handleOnline = () => {
            setIsOnline(true);
            syncPendingData();
        };
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    // Charger les données initiales
    useEffect(() => {
        loadData();
    }, []);

    // Charger les données (cache ou API)
    const loadData = async () => {
        setLoading(true);
        try {
            if (isOnline) {
                try {
                    const token = localStorage.getItem('Token');
                    if (token) {
                        const response = await AxiosInstance.get('/agences/', {
                            headers: { Authorization: `Token ${token}` }
                        });
                        const agencesData = response.data || [];
                        setAgences(agencesData);
                        await CacheService.cacheAgences(agencesData);
                        console.log(`🏢 ${agencesData.length} agences chargées depuis l'API`);
                    } else {
                        const cached = await CacheService.getCachedAgences();
                        setAgences(cached);
                    }
                } catch (error) {
                    console.error('Erreur chargement agences online:', error);
                    const cached = await CacheService.getCachedAgences();
                    setAgences(cached);
                }
            } else {
                const cached = await CacheService.getCachedAgences();
                setAgences(cached);
                console.log(`📴 ${cached.length} agences chargées depuis le cache`);
            }

            // Rôles par défaut
            const defaultRoles = [
                { value: 'directeur_agence', label: 'Directeur Agence' },
                { value: 'chef_chantier', label: 'Chef Chantier' },
                { value: 'conducteur_travaux', label: 'Conducteur Travaux' },
                { value: 'technicien', label: 'Technicien' },
                { value: 'gestionnaire_stock', label: 'Gestionnaire Stock' },
                { value: 'commercial_btp', label: 'Commercial BTP' },
                { value: 'comptable_btp', label: 'Comptable BTP' },
                { value: 'responsable_hse', label: 'Responsable HSE' },
                { value: 'responsable_rh', label: 'Responsable RH' },
                { value: 'acheteur', label: 'Acheteur' },
                { value: 'securite', label: 'Sécurité' },
                { value: 'responsable_qualite', label: 'Responsable Qualité' },
                { value: 'assistant_chantier', label: 'Assistant Chantier' },
                { value: 'assistant_rh', label: 'Assistant RH' },
                { value: 'formateur', label: 'Formateur' },
                { value: 'assistant_admin', label: 'Assistant Administratif' }
            ];
            setRoles(defaultRoles);
            await CacheService.cacheRoles(defaultRoles);

            const pending = await CacheService.getPendingOperations();
            setPendingCount(pending.length);

            const stats = await CacheService.getCacheStats();
            setCacheStats(stats);

        } catch (error) {
            console.error('Erreur chargement données:', error);
        } finally {
            setLoading(false);
        }
    };

    // Synchroniser les données en attente
    const syncPendingData = useCallback(async () => {
        if (!isOnline) {
            console.log('📴 Hors ligne - Synchronisation impossible');
            return { success: false, message: 'Hors ligne' };
        }
        
        setIsSyncing(true);
        try {
            const results = await CacheService.syncPendingData(AxiosInstance);
            const pending = await CacheService.getPendingOperations();
            setPendingCount(pending.length);
            await loadData();
            return results;
        } catch (error) {
            console.error('Erreur sync:', error);
            return { success: false, error: error.message };
        } finally {
            setIsSyncing(false);
        }
    }, [isOnline]);

    // Créer un utilisateur
    const createUser = useCallback(async (userData) => {
        if (isOnline) {
            try {
                const token = localStorage.getItem('Token');
                if (!token) {
                    throw new Error('Token manquant');
                }
                
                const response = await AxiosInstance.post('/register/', userData, {
                    headers: { Authorization: `Token ${token}` }
                });
                
                await loadData();
                
                return { 
                    success: true, 
                    data: response.data, 
                    offline: false,
                    message: 'Utilisateur créé avec succès'
                };
            } catch (error) {
                if (error.code === 'ERR_NETWORK' || !navigator.onLine) {
                    return await createUserOffline(userData);
                }
                throw error;
            }
        } else {
            return await createUserOffline(userData);
        }
    }, [isOnline]);

    const createUserOffline = async (userData) => {
        try {
            await CacheService.saveUserLocally(userData);
            await CacheService.addPendingOperation({
                type: 'CREATE_USER',
                data: userData
            });
            setPendingCount(prev => prev + 1);
            
            return { 
                success: true, 
                data: { ...userData, _offline: true, _id: Date.now().toString() },
                offline: true,
                message: 'Utilisateur sauvegardé localement'
            };
        } catch (error) {
            return { success: false, error: error.message, offline: true };
        }
    };

    // Mettre à jour un utilisateur
    const updateUser = useCallback(async (userId, userData) => {
        if (isOnline) {
            try {
                const token = localStorage.getItem('Token');
                if (!token) {
                    throw new Error('Token manquant');
                }
                
                const response = await AxiosInstance.put(`/users/${userId}/`, userData, {
                    headers: { Authorization: `Token ${token}` }
                });
                
                await loadData();
                
                return { 
                    success: true, 
                    data: response.data, 
                    offline: false,
                    message: 'Utilisateur modifié avec succès'
                };
            } catch (error) {
                if (error.code === 'ERR_NETWORK' || !navigator.onLine) {
                    return await updateUserOffline(userId, userData);
                }
                throw error;
            }
        } else {
            return await updateUserOffline(userId, userData);
        }
    }, [isOnline]);

    const updateUserOffline = async (userId, userData) => {
        try {
            await CacheService.saveUserLocally({ ...userData, id: userId });
            await CacheService.addPendingOperation({
                type: 'UPDATE_USER',
                userId: userId,
                data: userData
            });
            setPendingCount(prev => prev + 1);
            
            return { 
                success: true, 
                data: { ...userData, _offline: true },
                offline: true,
                message: 'Modification sauvegardée localement'
            };
        } catch (error) {
            return { success: false, error: error.message, offline: true };
        }
    };

    // Supprimer un utilisateur
    const deleteUser = useCallback(async (userId) => {
        if (isOnline) {
            try {
                const token = localStorage.getItem('Token');
                if (!token) {
                    throw new Error('Token manquant');
                }
                
                await AxiosInstance.delete(`/users/${userId}/`, {
                    headers: { Authorization: `Token ${token}` }
                });
                
                await loadData();
                
                return { 
                    success: true, 
                    offline: false,
                    message: 'Utilisateur supprimé avec succès'
                };
            } catch (error) {
                if (error.code === 'ERR_NETWORK' || !navigator.onLine) {
                    return await deleteUserOffline(userId);
                }
                throw error;
            }
        } else {
            return await deleteUserOffline(userId);
        }
    }, [isOnline]);

    const deleteUserOffline = async (userId) => {
        try {
            await CacheService.deleteUserLocally(userId);
            await CacheService.addPendingOperation({
                type: 'DELETE_USER',
                userId: userId
            });
            setPendingCount(prev => prev + 1);
            
            return { 
                success: true, 
                offline: true,
                message: 'Suppression sauvegardée localement'
            };
        } catch (error) {
            return { success: false, error: error.message, offline: true };
        }
    };

    return {
        // État
        isOnline,
        isSyncing,
        pendingCount,
        agences,
        roles,
        loading,
        cacheStats,
        
        // Actions
        loadData,
        syncPendingData,
        createUser,
        updateUser,
        deleteUser,
        getCachedUsers: CacheService.getCachedUsers.bind(CacheService),
        getCachedUser: CacheService.getCachedUserById.bind(CacheService),
        refresh: loadData,
        clearCache: CacheService.clearCache.bind(CacheService),
        getPendingCount: CacheService.getPendingCount.bind(CacheService),
        getPendingOperations: CacheService.getPendingOperations.bind(CacheService),
    };
}

export default useOfflineData;