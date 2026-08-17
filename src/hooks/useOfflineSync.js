// src/hooks/useOfflineSync.js

import { useEffect, useState, useCallback } from 'react';
import { getPendingCount, syncWithServer } from '../services/syncService';

export const useOfflineSync = (apiBaseUrl, getToken) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingCount, setPendingCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncResult, setLastSyncResult] = useState(null);

  // ✅ Mettre à jour le compteur
  const updatePendingCount = useCallback(async () => {
    try {
      const count = await getPendingCount();
      setPendingCount(count);
      console.log(`📝 ${count} opérations en attente`);
      return count;
    } catch (error) {
      console.error('Erreur comptage:', error);
      return 0;
    }
  }, []);

  // ✅ Fonction de synchronisation
  const sync = useCallback(async () => {
    if (!isOnline) {
      console.log('📡 Hors ligne - synchronisation impossible');
      return { success: false, reason: 'offline', synced: 0 };
    }
    
    if (isSyncing) {
      console.log('⏳ Synchronisation déjà en cours');
      return { success: false, reason: 'already_syncing', synced: 0 };
    }
    
    setIsSyncing(true);
    try {
      const result = await syncWithServer(apiBaseUrl, getToken);
      setLastSyncResult(result);
      await updatePendingCount();
      return result;
    } catch (error) {
      console.error('Erreur sync:', error);
      return { success: false, error: error.message, synced: 0 };
    } finally {
      setIsSyncing(false);
    }
  }, [isOnline, isSyncing, apiBaseUrl, getToken, updatePendingCount]);

  // ✅ Écoute des événements online/offline
  useEffect(() => {
    const handleOnline = async () => {
      console.log('📶 Connexion rétablie');
      setIsOnline(true);
      
      // ✅ Vérifier et synchroniser automatiquement
      const count = await getPendingCount();
      if (count > 0) {
        console.log(`🔄 Synchronisation automatique de ${count} opérations...`);
        // Petit délai pour laisser le temps à la connexion de s'établir
        setTimeout(() => {
          sync();
        }, 2000);
      }
    };

    const handleOffline = () => {
      console.log('📡 Hors ligne');
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // ✅ Synchronisation périodique (toutes les 30 secondes)
    const interval = setInterval(() => {
      if (isOnline) {
        sync();
      }
    }, 30000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, [sync, isOnline]);

  // ✅ Mise à jour périodique du compteur
  useEffect(() => {
    updatePendingCount();
    const interval = setInterval(updatePendingCount, 5000);
    return () => clearInterval(interval);
  }, [updatePendingCount]);

  return {
    isOnline,
    pendingCount,
    isSyncing,
    lastSyncResult,
    sync,
    updatePendingCount
  };
};