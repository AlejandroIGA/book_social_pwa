// public/sw.js

const CACHE_NAME = 'book-social-pwa-cache-v3'; // Incrementamos la versión de nuevo
const urlsToCache = [
  '/',
  '/manifest.json',
  '/icon-256.png',
  '/icon-512.png'
];

// --- INSTALL y ACTIVATE (con limpieza de cachés viejos) ---
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
      .then(() => self.skipWaiting())
  );
});

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
    }).then(() => self.clients.claim())
  );
});

// --- PUSH y SYNC (sin cambios) ---
self.addEventListener('push', (event) => { /* ... tu lógica push ... */ });
self.addEventListener('sync', (event) => {
    if (event.tag === 'sync-new-reviews') {
        event.waitUntil(syncReviews());
    }
});


// --- FETCH (Lógica Final con Estrategia Mixta) ---
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // 1. Para peticiones a la API que MODIFICAN datos (POST, etc.), siempre ir a la red.
  if (request.method !== 'GET') {
    event.respondWith(fetch(request));
    return;
  }
  
  // 2. (LA SOLUCIÓN) Para la API de reseñas, usamos la estrategia "Network First".
  // Esto asegura que siempre veamos las reseñas más actualizadas si hay conexión.
  if (request.url.includes('/api/books/') && request.url.includes('/reviews')) {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          // Si la red funciona, actualizamos el caché con los datos frescos.
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseToCache);
          });
          return networkResponse;
        })
        .catch(() => {
          // Si la red falla, entonces sí servimos desde el caché.
          return caches.match(request);
        })
    );
    return;
  }

  // 3. Para todo lo demás (páginas, CSS, JS, imágenes y otras APIs GET), usamos "Cache First".
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(request).then((networkResponse) => {
        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(request, responseToCache);
        });
        return networkResponse;
      });
    })
  );
});

self.addEventListener('sync', (event) => {
  console.log('[Service Worker] Evento "sync" detectado:', event.tag);
  if (event.tag === 'sync-new-reviews') {
    console.log('[Service Worker] Sincronizando nuevas reseñas...');
    event.waitUntil(syncReviews());
  }
});

async function syncReviews() {
  const reviews = await getReviewsFromSync();
  for (const review of reviews) {
    try {
      const response = await fetch('/api/reviews/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(review.data),
      });
      if (response.ok) {
        await deleteReviewFromSync(review.id);
      }
    } catch (error) {
      console.error('Fallo al sincronizar reseña:', error);
      break; 
    }
  }
}

function getDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('book-pwa-db', 1);
    request.onupgradeneeded = () => request.result.createObjectStore('review-outbox', { autoIncrement: true });
    request.onsuccess = () => resolve(request.result);
    request.onerror = (event) => reject(event.target.error);
  });
}

async function getReviewsFromSync() {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('review-outbox', 'readonly');
    const store = transaction.objectStore('review-outbox');
    const request = store.openCursor(); 
    const reviews = [];

    request.onsuccess = (event) => {
      const cursor = event.target.result;
      if (cursor) {
        reviews.push({ id: cursor.key, data: cursor.value });
        cursor.continue();
      } else {
        resolve(reviews);
      }
    };

    request.onerror = (event) => {
      reject(event.target.error);
    };
  });
}

async function deleteReviewFromSync(id) {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('review-outbox', 'readwrite');
    const store = transaction.objectStore('review-outbox');
    
    store.delete(id);

    transaction.oncomplete = () => {
      console.log(`[Service Worker] Transacción completada. Reseña con ID ${id} borrada de IndexedDB.`);
      resolve();
    };

    transaction.onerror = (event) => {
      console.error(`[Service Worker] Error en la transacción de borrado para la reseña ${id}:`, event.target.error);
      reject(event.target.error);
    };
  });
}