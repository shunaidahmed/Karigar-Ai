const CACHE_NAME = 'karigar-ai-v1'
const STATIC_CACHE = 'karigar-static-v1'
const DATA_CACHE = 'karigar-data-v1'

const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/favicon.ico',
]

// Install event — cache app shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll(STATIC_ASSETS)
    })
  )
  self.skipWaiting()
})

// Activate event — clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME && key !== STATIC_CACHE && key !== DATA_CACHE)
          .map((key) => caches.delete(key))
      )
    })
  )
  self.clients.claim()
})

// Fetch event — network first for API, cache first for static
self.addEventListener('fetch', (event) => {
  const request = event.request

  // API calls — network only
  if (request.url.includes('/api/') || request.url.includes('generativelanguage')) {
    event.respondWith(
      fetch(request).catch(() => {
        return new Response(
          JSON.stringify({ error: 'You are offline. AI features require internet.' }),
          { headers: { 'Content-Type': 'application/json' } }
        )
      })
    )
    return
  }

  // Static assets — cache first
  if (request.destination === 'document' || request.destination === 'style' || request.destination === 'script' || request.destination === 'image') {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached

        return fetch(request).then((response) => {
          const cacheCopy = response.clone()
          caches.open(STATIC_CACHE).then((cache) => {
            cache.put(request, cacheCopy)
          })
          return response
        })
      })
    )
    return
  }

  // Default — network first
  event.respondWith(
    fetch(request).then((response) => {
      const cacheCopy = response.clone()
      caches.open(DATA_CACHE).then((cache) => {
        cache.put(request, cacheCopy)
      })
      return response
    }).catch(() => {
      return caches.match(request)
    })
  )
})
