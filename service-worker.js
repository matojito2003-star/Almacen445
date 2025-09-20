// service-worker.js

const CACHE_NAME = 'almacen-445-v1';
const CACHE_URLS = [
  './',
  './index.html',
  './manifest.json',
  './icons/icon-72x72.png',
  './icons/icon-96x96.png',
  './icons/icon-128x128.png',
  './icons/icon-144x144.png',
  './icons/icon-152x152.png',
  './icons/icon-192x192.png',
  './icons/icon-384x384.png',
  './icons/icon-512x512.png'
];

// Instalación: precache los recursos estáticos
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(CACHE_URLS)
          .then(() => self.skipWaiting()) // Activa el SW inmediatamente
          .catch(err => console.error('Error en precache:', err));
      })
  );
});

// Activación: limpia cachés antiguas
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      return self.clients.claim(); // Toma control de todas las páginas
    })
  );
});

// Intercepción de solicitudes (Network falling back to Cache)
self.addEventListener('fetch', (event) => {
  // Solo manejar solicitudes del mismo origen
  if (event.request.url.startsWith(self.location.origin)) {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match(event.request)
          .then((response) => {
            if (response) {
              return response;
            }
            // Responde con un recurso genérico para rutas HTML si no hay conexión
            if (event.request.mode === 'navigate') {
              return caches.match('./');
            }
          });
      })
    );
  }
});

// Notificación push (opcional - para futuras mejoras)
self.addEventListener('push', (event) => {
  const options = {
    body: event.data?.text() || 'Tienes nuevos datos disponibles.',
    icon: './icons/icon-192x192.png',
    badge: './icons/icon-72x72.png',
    vibrate: [100, 50, 100],
  };
  event.waitUntil(
    self.registration.showNotification('Almacén 445', options)
  );
});

// Escuchar mensajes del cliente
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});