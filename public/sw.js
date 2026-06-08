const CACHE_NAME = 'session-reminder-v3'
const urlsToCache = ['/', '/manifest.json']

self.addEventListener('install', (event) => {
  self.skipWaiting()
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
      .catch(() => {})
  )
})

// Clean up old caches and take control immediately.
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  )
})

self.addEventListener('fetch', (event) => {
  const req = event.request
  let url
  try {
    url = new URL(req.url)
  } catch {
    return
  }

  // NEVER intercept: page navigations, non-GET, cross-origin, or API requests.
  // Intercepting navigations is what broke /automation — let the browser do it.
  if (req.mode === 'navigate') return
  if (req.method !== 'GET') return
  if (url.origin !== self.location.origin) return
  if (url.pathname.startsWith('/api/')) return

  // Cache-first for same-origin static assets, with a safe network fallback.
  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached
      return fetch(req).catch(() => cached || Response.error())
    })
  )
})

self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(Promise.resolve())
  }
})
