const CACHE_NAME = 'karigar-v1';
const APP_SHELL_FILES = [
  '/',
  '/index.html',
  '/manifest.json',
  '/style.css',
  '/app.js',
  '/providers.json'
];

const EXTERNAL_CACHE = [
  'https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&family=Noto+Nastaliq+Urdu:wght@400;700&display=swap'
];

// Install event - cache app shell
self.addEventListener('install', (event) => {
  console.log('[ServiceWorker] Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[ServiceWorker] Caching App Shell');
        return cache.addAll(APP_SHELL_FILES);
      })
      .then(() => {
        console.log('[ServiceWorker] Cached External Resources');
        return caches.open(CACHE_NAME + '-external').then((cache) => {
          return cache.addAll(EXTERNAL_CACHE).catch(() => {
            console.log('[ServiceWorker] Some external resources failed to cache');
          });
        });
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - cleanup old caches
self.addEventListener('activate', (event) => {
  console.log('[ServiceWorker] Activating...');
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => {
              return cacheName.startsWith('karigar-') && 
                     cacheName !== CACHE_NAME && 
                     cacheName !== CACHE_NAME + '-external';
            })
            .map((cacheName) => {
              console.log('[ServiceWorker] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            })
        );
      })
      .then(() => self.clients.claim())
  );
});

// Fetch event - network first for API, cache first for static
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Gemini API - Network only with fallback
  if (url.hostname.includes('generativelanguage.googleapis.com')) {
    event.respondWith(
      fetch(request)
        .catch(() => {
          return new Response(
            JSON.stringify({
              error: 'Offline',
              message: 'AI features are not available while offline. Please try again when connected.'
            }),
            {
              status: 503,
              headers: { 'Content-Type': 'application/json' }
            }
          );
        })
    );
    return;
  }

  // App shell and local files - Cache first, network fallback
  if (url.origin === location.origin || 
      url.hostname.includes('fonts.googleapis.com') ||
      url.hostname.includes('fonts.gstatic.com')) {
    event.respondWith(
      caches.match(request)
        .then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          return fetch(request)
            .then((networkResponse) => {
              if (networkResponse.ok) {
                const responseClone = networkResponse.clone();
                caches.open(CACHE_NAME)
                  .then((cache) => cache.put(request, responseClone));
              }
              return networkResponse;
            })
            .catch(() => {
              if (request.destination === 'document') {
                return caches.match('/index.html');
              }
              return new Response(
                'Offline content not available',
                { status: 503, statusText: 'Service Unavailable' }
              );
            });
        })
    );
    return;
  }

  // Default - Network first
  event.respondWith(
    fetch(request)
      .catch(() => caches.match(request))
  );
});

// Handle messages from the app
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('[ServiceWorker] Sync event:', event.tag);
  if (event.tag === 'sync-booking') {
    event.waitUntil(syncPendingBookings());
  }
});

async function syncPendingBookings() {
  console.log('[ServiceWorker] Syncing pending bookings...');
  // This would sync any pending booking data when back online
}

// Push notifications
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'New update from Karigar.ai',
    icon: '/assets/icons/icon-192x192.png',
    badge: '/assets/icons/badge-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      { action: 'view', title: 'View' },
      { action: 'dismiss', title: 'Dismiss' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('Karigar.ai', options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  if (event.action === 'view') {
    event.waitUntil(clients.openWindow('/'));
  }
});

// Periodic background sync for demand data
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'update-providers') {
    event.waitUntil(updateProviderCache());
  }
});

async function updateProviderCache() {
  console.log('[ServiceWorker] Updating provider cache...');
  try {
    const response = await fetch('/providers.json');
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      await cache.put('/providers.json', response);
      console.log('[ServiceWorker] Provider cache updated');
    }
  } catch (error) {
    console.log('[ServiceWorker] Failed to update provider cache:', error);
  }
}