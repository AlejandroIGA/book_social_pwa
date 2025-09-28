// public/sw.js
const CACHE_NAME = 'book-pwa-v1';
const urlsToCache = [
  '/',
  '/manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting()) // Activa el SW inmediatamente
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim()); // Toma control de las páginas abiertas
});

self.addEventListener('push', (event) => {
  const data = event.data.json(); 

  const options = {
    body: data.body,
    icon: '/icon-192.png', 
    badge: '/icon-192.png',
  };
  
  event.waitUntil(self.registration.showNotification(data.title, options));
});

self.addEventListener('fetch', (event) => {
  // Estrategia: Network falling back to cache
  event.respondWith(
    fetch(event.request).catch(() => {
      return caches.match(event.request);
    })
  );
});