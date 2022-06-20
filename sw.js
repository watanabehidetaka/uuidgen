const CACHE_NAME = 'uuidgen-v0.0.2';
const OFFLINE_URL = '/uuidgen/';
const urlsToCache = [
  '/uuidgen/',
  '/uuidgen/index.html',
  '/uuidgen/app.js',
  '/uuidgen/uuidgen.js',
  '/uuidgen/style.css',
  '/uuidgen/icon-64.png'
];
const neverCacheUrls = /\/wp-admin|\/wp-login|preview=true|\/cart|ajax|login/;

self.addEventListener('install', (event) => {
	event.waitUntil(
		caches.open(CACHE_NAME).then((cache) => {
			return cache.addAll(urlsToCache);
		})
	);
});

self.addEventListener('activate', (event) => {
	event.waitUntil(
		caches
			.keys()
			.then((keys) =>
				Promise.all(
					keys.map((key) => {
						if (CACHE_NAME !== key) {
							return caches.delete(key);
						}
					})
				)
			)
			.then(() => {
				self.clients.claim();
			})
	);
});

self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((r) => {
          console.log('[Service Worker] Fetching resource: '+e.request.url);
      return r || fetch(e.request).then((response) => {
                return caches.open(cacheName).then((cache) => {
          console.log('[Service Worker] Caching new resource: '+e.request.url);
          cache.put(e.request, response.clone());
          return response;
        });
      });
    })
  );
});
