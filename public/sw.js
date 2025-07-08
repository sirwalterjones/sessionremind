const CACHE_NAME = 'session-reminder-v1'
const urlsToCache = [
  '/',
  '/manifest.json'
]

// Protected routes that should not be cached (require authentication)
const protectedRoutes = ['/dashboard', '/new', '/admin']

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  )
})

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url)
  
  // Skip service worker for protected routes - let them handle authentication naturally
  if (protectedRoutes.some(route => url.pathname.startsWith(route))) {
    return
  }
  
  // Skip service worker for API routes
  if (url.pathname.startsWith('/api/')) {
    return
  }
  
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network with redirect following
        return response || fetch(event.request, {
          redirect: 'follow'
        })
      })
  )
})

// Handle background sync for offline form submissions
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync())
  }
})

function doBackgroundSync() {
  // Handle offline form submissions here
  return Promise.resolve()
}