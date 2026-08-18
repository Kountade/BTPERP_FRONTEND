// src/contexts/OfflineContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import CacheService from '../services/CacheService';
import AxiosInstance from '../AxiosInstance';

const OfflineContext = createContext();

export function OfflineProvider({ children }) {
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [pendingCount, setPendingCount] = useState(0);
    const [isSyncing, setIsSyncing] = useState(false);
    const [cacheStats, setCacheStats] = useState(null);

    useEffect(() => {
        const handleOnline = () => {
            setIsOnline(true);
            syncPending();
        };
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        // Charger les statistiques initiales
        loadStats();

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    const loadStats = async () => {
        const stats = await CacheService.getCacheStats();
        setCacheStats(stats);
        setPendingCount(stats?.pendingOperations || 0);
    };

    const syncPending = async () => {
        if (!isOnline) return;
        setIsSyncing(true);
        try {
            await CacheService.syncPendingData(AxiosInstance);
            await loadStats();
        } catch (error) {
            console.error('Erreur sync:', error);
        } finally {
            setIsSyncing(false);
        }
    };

    return (
        <OfflineContext.Provider value={{
            isOnline,
            isSyncing,
            pendingCount,
            cacheStats,
            syncPending,
            loadStats
        }}>
            {children}
        </OfflineContext.Provider>
    );
}

export const useOffline = () => {
    const context = useContext(OfflineContext);
    if (!context) {
        throw new Error('useOffline must be used within OfflineProvider');
    }
    return context;
};