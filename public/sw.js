const CACHE_NAME = 'tasktusk-v1.1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/icon.png',
  '/favicon.ico',
  '/tasktusk.svg',
  '/coin.svg',
  '/flower.svg'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(STATIC_ASSETS);
      })
      .catch((err) => {
        console.error('Failed to cache assets:', err);
      })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// Fetch event - network first for HTML/JS/CSS, cache first for static assets
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return;

  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) return;

  const url = new URL(event.request.url);
  const isNav = event.request.mode === 'navigate';
  const isAsset = url.pathname.match(/\.(js|css|tsx?|jsx?)$/);
  const isStaticAsset = STATIC_ASSETS.includes(url.pathname) ||
                        url.pathname.match(/\.(png|jpg|jpeg|gif|svg|ico|woff|woff2)$/);

  // For HTML and JS/CSS files - use Network First strategy
  if (isNav || isAsset) {
    event.respondWith(
      fetch(event.request, {
        cache: 'reload',
        headers: {
          'Cache-Control': 'no-cache'
        }
      }).then((response) => {
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }
        // Check if response is already consumed before cloning
        if (response.bodyUsed) {
          return response;
        }
        // Update cache with fresh version
        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        }).catch((err) => {
          console.warn('Failed to cache response:', err);
        });
        return response;
      })
      .catch(() => {
        // If network fails, try cache
        return caches.match(event.request).then((cached) => {
          if (cached) {
            return cached;
          }
          // Return offline indicator if nothing is available
          return new Response('<!DOCTYPE html><html><body>Offline</body></html>', {
            status: 200,
            headers: { 'Content-Type': 'text/html' }
          });
        });
      })
    );
    return;
  }

  // For static assets - use Cache First strategy
  if (isStaticAsset) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        if (cached) {
          return cached;
        }
        return fetch(event.request, {
          cache: 'reload',
          headers: {
            'Cache-Control': 'no-cache'
          }
        })
          .then((response) => {
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            // Check if response is already consumed before cloning
            if (response.bodyUsed) {
              return response;
            }
            const responseToCache = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            }).catch((err) => {
              console.warn('Failed to cache response:', err);
            });
            return response;
          }).catch(() => {
            // If network fails for static asset, return error response
            return new Response(null, {
              status: 408,
              statusText: 'Request Timeout'
            });
          });
      })
    );
    return;
  }

  // Default: try network, fallback to cache
  event.respondWith(
    fetch(event.request, {
      cache: 'reload',
      headers: {
        'Cache-Control': 'no-cache'
      }
    })
      .then((response) => {
        // Check if response is already consumed before cloning
        if (!response.bodyUsed && response.ok) {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          }).catch((err) => {
            console.warn('Failed to cache response:', err);
          });
        }
        return response;
      })
      .catch(() => {
        return caches.match(event.request).then((cached) => {
          if (cached) {
            return cached;
          }
          return new Response(null, {
            status: 503,
            statusText: 'Service Unavailable'
          });
        });
      })
  );
});
