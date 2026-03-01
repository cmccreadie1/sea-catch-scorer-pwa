const CACHE_NAME = 'sea-score-v139';

// The essential files to load the app immediately
const FILES_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css',
  'https://cdn.jsdelivr.net/npm/bootstrap-icons/font/bootstrap-icons.css',
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Poppins:wght@500;600;700;800&display=swap',
  'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js'
];

// INSTALL: Download the essential files to the phone
self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(FILES_TO_CACHE);
    })
  );
});

// ACTIVATE: Delete any old caches (like v115) so they don't clog up the phone
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(keyList.map((key) => {
        if (key !== CACHE_NAME) {
          return caches.delete(key);
        }
      }));
    })
  );
  e.waitUntil(clients.claim());
});

// FETCH: Try the cache first. If not found, get from network AND save to cache for next time.
self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((response) => {
      // 1. Return the cached file if we have it
      if (response) {
        return response;
      }
      
      // 2. If it's not in the cache, go to the internet
      return fetch(e.request).then((fetchResponse) => {
        // 3. Save a copy of this new file (like a hidden font file) to the cache for next time
        return caches.open(CACHE_NAME).then((cache) => {
          // Only cache valid GET requests (prevents errors with browser extensions)
          if(e.request.url.startsWith('http') && e.request.method === 'GET'){
              cache.put(e.request, fetchResponse.clone());
          }
          return fetchResponse;
        });
      });
    }).catch(() => {
      // Failsafe: If offline and the file isn't cached at all, fail silently rather than crashing
      console.log('Offline and resource not found in cache:', e.request.url);
    })
  );
});
