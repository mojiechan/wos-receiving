const CACHE_NAME = 'wos-receiving-v1';

// Structural and local assets under your absolute repository control
const STATIC_ASSETS = [
  './',
  './index.html',
  './icon-512.png' // Now safely hosted locally!
];

// External stylesheets that can be cached on fallback or runtime
const EXTERNAL_ASSETS = [
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap'
];

// Installation Stage: Smooth, predictable local asset caching
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(async cache => {
        console.log('📦 Caching structural assets...');
        // Cache your essential app files and local icon
        await cache.addAll(STATIC_ASSETS);
        
        // Cache the font stylesheet
        await cache.addAll(EXTERNAL_ASSETS).catch(err => {
          console.warn('⚠️ Font stylesheet pre-cache skipped (will cache on runtime):', err);
        });
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

// Intercept Fetch Tasks: Smart Cache-First Strategy
self.addEventListener('fetch', event => {
  // Pass through cross-origin mutations or non-GET requests instantly (Crucial for your Apps Script POST loop!)
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      if (cachedResponse) {
        return cachedResponse;
      }
      
      return fetch(event.request)
        .then(networkResponse => {
          // Dynamically intercept and cache font payload binaries when they cross the wire
          if (event.request.url.includes('fonts.gstatic.com') || event.request.url.includes('fonts.googleapis.com')) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, responseClone);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          // If both network and cache fail completely, provide clean navigation fallbacks
          if (event.request.mode === 'navigate') {
            return caches.match('./index.html');
          }
          
          return new Response('Offline content unavailable.', {
            status: 503,
            statusText: 'Service Unavailable',
            headers: new Headers({ 'Content-Type': 'text/plain' })
          });
        });
    })
  );
});
