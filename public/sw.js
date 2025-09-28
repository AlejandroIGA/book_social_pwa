// public/sw.js

const CACHE_NAME = 'book-social-pwa-cache-v1';
const urlsToCache = [
  '/',
  '/manifest.json',
  '/icon-256.png',
  '/icon-512.png',
];

self.addEventListener('install', (event) => {
  console.log('[Service Worker] Instalando...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activado.');
  event.waitUntil(self.clients.claim());
});

self.addEventListener('push', (event) => {
  console.log('[Service Worker] Notificación Push recibida.');
  const data = event.data.json();
  const options = {
    body: data.body,
    icon: '/icon-192.png',
    badge: '/icon-192.png',
  };
  event.waitUntil(self.registration.showNotification(data.title, options));
});

self.addEventListener('fetch', (event) => {
  if (event.request.url.includes('/api/')) {
    event.respondWith(fetch(event.request));
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request);
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