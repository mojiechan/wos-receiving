const CACHE_NAME = 'wos-receiving-v1';

// Structural assets that are 100% under your relative domain control
const STATIC_ASSETS = [
  './',
  './index.html'
];

// External assets that require safe network handling (no-cors)
const EXTERNAL_ASSETS = [
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
  'https://lh3.googleusercontent.com/d/1sejZnZonGSpF9p0Lz4RZNxbjNewdgM8t'
];

// Installation Stage: Safely caching layout files without crashing on CORS
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(async cache => {
        console.log('📦 Caching structural assets and offline fallbacks...');
        
        // 1. Force absolute delivery on your local relative assets
        await cache.addAll(STATIC_ASSETS);
        
        // 2. Fetch external assets with no-cors to prevent opaque response installation blocks
        for (const url of EXTERNAL_ASSETS) {
          try {
            const request = new Request(url, { mode: 'no-cors' });
            const response = await fetch(request);
            await cache.put(url, response);
          } catch (err) {
            console.warn(`⚠️ Failed to pre-cache external asset (${url}):`, err);
          }
        }
      })
      .then(() => self.skipWaiting())
  );
});

// Activation Stage: Cleaning legacy network architecture dependencies
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            console.log('🧹 Purging outdated framework cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Intercept Fetch Tasks: Smart Cache-First Strategy with Dynamic Font Tracking
self.addEventListener('fetch', event => {
  // Pass through cross-origin mutations or non-GET requests instantly
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      if (cachedResponse) {
        return cachedResponse;
      }
      
      return fetch(event.request)
        .then(networkResponse => {
          // Dynamically intercept and cache font payload files when they cross the wire
          if (event.request.url.includes('fonts.gstatic.com')) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, responseClone);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          // If both network and cache fail completely, provide clean fallbacks
          if (event.request.mode === 'navigate') {
            return caches.match('./index.html');
          }
          
          // Fall back to a standard Response rather than returning undefined
          return new Response('Offline content unavailable.', {
            status: 503,
            statusText: 'Service Unavailable',
            headers: new Headers({ 'Content-Type': 'text/plain' })
          });
        });
    })
  );
});