// public/sw.js

const CACHE_NAME = 'btp-erp-v1';
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/vite.svg',
    '/icons/icon-32x32.png',
    '/icons/icon-16x16.png',
    '/apple-touch-icon.png'
];

// Installation du Service Worker
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('📦 Mise en cache des assets statiques');
                return cache.addAll(STATIC_ASSETS);
            })
            .then(() => self.skipWaiting())
    );
});

// Activation - nettoyage des anciens caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('🗑️ Suppression du cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// Interception des requêtes
self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);
    
    // ✅ IMPORTANT: Les requêtes API Django ne sont PAS mises en cache
    // Elles seront interceptées pour gérer le mode hors ligne
    if (url.pathname.startsWith('/api/')) {
        event.respondWith(
            fetch(event.request)
                .then((response) => {
                    // Mettre en cache la réponse pour une éventuelle utilisation hors ligne
                    const responseClone = response.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, responseClone);
                    });
                    return response;
                })
                .catch(() => {
                    // Retourner une réponse hors ligne
                    return new Response(JSON.stringify({
                        offline: true,
                        message: 'Vous êtes hors ligne. Les données seront synchronisées automatiquement.'
                    }), {
                        status: 503,
                        headers: { 'Content-Type': 'application/json' }
                    });
                })
        );
        return;
    }
    
    // Pour les fichiers statiques (JS, CSS, images)
    event.respondWith(
        caches.match(event.request)
            .then((cachedResponse) => {
                if (cachedResponse) {
                    return cachedResponse;
                }
                
                return fetch(event.request)
                    .then((response) => {
                        // Mettre en cache les nouvelles ressources
                        const responseClone = response.clone();
                        caches.open(CACHE_NAME).then((cache) => {
                            cache.put(event.request, responseClone);
                        });
                        return response;
                    })
                    .catch(() => {
                        // Si hors ligne et pas en cache, retourner la page d'accueil
                        return caches.match('/index.html');
                    });
            })
    );
});