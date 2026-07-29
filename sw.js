const CACHE_NAME = 'ecoflow-cache-v8';
const APP_SHELL = [
  './',
  './index.html',
  './css/styles.css',
  './css/patch.css',
  './assets/logo.jpg',
  './manifest.json'
];
const JS_ASSETS = [
  './js/i18n.js',
  './js/app.js',
  './js/auth.js',
  './js/agent-system.js',
  './js/map-visualizer.js',
  './js/dashboard.js',
  './js/scheduling.js',
  './js/routes.js',
  './js/customers.js',
  './js/billing.js',
  './js/analytics.js',
  './js/fleet.js',
  './js/ai-assistant.js',
  './js/waste-vision.js',
  './js/grievances.js',
  './js/reports.js',
  './js/notifications.js',
  './js/test-suite.js',
  './js/command-center.js',
  './js/carbon-trading.js',
  './js/smart-bins.js'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll([...APP_SHELL, ...JS_ASSETS]);
    })
  );
});

// Selective cache cleanup — only delete OLD caches, not current
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => {
            console.log('[SW] Deleting old cache:', name);
            return caches.delete(name);
          })
      );
    }).then(() => self.clients.claim())
  );
});

// Stale-While-Revalidate: serve from cache instantly, update in background
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.match(event.request).then((cachedResponse) => {
        const networkFetch = fetch(event.request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              cache.put(event.request, networkResponse.clone());
            }
            return networkResponse;
          })
          .catch(() => cachedResponse);

        // Return cached version instantly, update in background
        return cachedResponse || networkFetch;
      });
    })
  );
});
