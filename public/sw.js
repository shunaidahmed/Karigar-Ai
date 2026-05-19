const CACHE_NAME = 'karigar-ai-v2'
const STATIC_CACHE = 'karigar-static-v2'

const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/favicon.ico',
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll(STATIC_ASSETS))
  )
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME && key !== STATIC_CACHE)
          .map((key) => caches.delete(key))
      )
    )
  )
  self.clients.claim()
})

self.addEventListener('fetch', (event) => {
  const request = event.request

  // Only cache GET requests
  if (request.method !== 'GET') {
    event.respondWith(fetch(request))
    return
  }

  // API calls — network only, never cache
  if (request.url.includes('/api/') || request.url.includes('supabase.co')) {
    event.respondWith(fetch(request))
    return
  }

  // Static assets — cache first, then network
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached

      return fetch(request).then((response) => {
        if (response && response.status === 200) {
          const cacheCopy = response.clone()
          caches.open(STATIC_CACHE).then((cache) => {
            cache.put(request, cacheCopy)
          })
        }
        return response
      })
    }).catch(() => {
      // Fallback for navigation requests
      if (request.destination === 'document') {
        return caches.match('/')
      }
    })
  )
})
