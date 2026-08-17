// src/components/AxiosInstance.js
import axios from 'axios'
import { saveDataWithOffline } from '../services/syncService'

// Configuration pour Vite.js
const getBaseUrl = () => {
  const envApiUrl = import.meta.env.VITE_API_URL
  
  if (envApiUrl) {
    return envApiUrl
  }
  
  if (import.meta.env.PROD) {
    return 'https://btperp-backend.onrender.com'
  }
  
  return 'http://127.0.0.1:8000'
}

const baseUrl = getBaseUrl()

console.log(`🚀 Environnement: ${import.meta.env.MODE}`)
console.log(`🔗 URL API: ${baseUrl}`)

// ============================================================
// FONCTIONS POUR LE TOKEN
// ============================================================

export const getToken = () => localStorage.getItem('Token')
export const setToken = (token) => localStorage.setItem('Token', token)
export const removeToken = () => {
  localStorage.removeItem('Token')
  localStorage.removeItem('User')
  localStorage.removeItem('UserAgences')
}

// ============================================================
// CRÉATION DE L'INSTANCE AXIOS
// ============================================================

const AxiosInstance = axios.create({
    baseURL: baseUrl,
    timeout: 10000,
    headers: {
        "Content-Type": "application/json",
        "accept": "application/json"
    }
})

// Intercepteur de requête
AxiosInstance.interceptors.request.use(
    (config) => {
        const token = getToken()
        console.log('📤 Making request to:', config.url, 'with token:', !!token)
        
        if(token){
            config.headers.Authorization = `Token ${token}`
        }
        return config
    },
    (error) => {
        console.error('❌ Request interceptor error:', error)
        return Promise.reject(error)
    }
)

// ============================================================
// INTERCEPTEUR DE RÉPONSE AVEC FALLBACK OFFLINE
// ============================================================

AxiosInstance.interceptors.response.use(
    (response) => {
        console.log('✅ Response received:', response.status, response.config.url)
        return response
    }, 
    async (error) => {
        console.error('❌ Response error:', error.response?.status, error.config?.url)
        
        // 401 - Non autorisé
        if(error.response && error.response.status === 401){
            console.log('🔒 Unauthorized, removing token')
            removeToken()
            window.location.href = '/'
            return Promise.reject(error)
        }
        
        // 503 ou erreur réseau - Tentative de sauvegarde offline
        if (!error.response || error.response.status === 503 || error.code === 'ERR_NETWORK') {
            const config = error.config
            const method = config.method.toUpperCase()
            
            // Seulement pour les méthodes POST, PUT, PATCH, DELETE
            if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
                try {
                    const data = JSON.parse(config.data)
                    const result = await saveDataWithOffline(
                        config.url, 
                        method, 
                        data,
                        baseUrl,
                        getToken
                    )
                    
                    if (result.success) {
                        console.log('💾 Données sauvegardées localement')
                        // Créer une réponse factice pour ne pas casser l'application
                        return Promise.resolve({
                            data: {
                                offline: true,
                                message: 'Données sauvegardées localement - synchronisation automatique à la reconnexion',
                                offlineId: result.id
                            },
                            status: 202,
                            statusText: 'Accepted (Offline)',
                            config: config,
                            headers: {}
                        })
                    }
                } catch (e) {
                    console.error('❌ Erreur sauvegarde offline:', e)
                }
            }
        }
        
        return Promise.reject(error)
    }
)

export default AxiosInstance