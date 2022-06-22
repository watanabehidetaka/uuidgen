const CACHE_NAME = 'uuidgen-v0.0.4';
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

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keyList) => {
          return Promise.all(keyList.map((key) => {
        if(key !== cacheName) {
          return caches.delete(key);
        }
      }));
    })
  );
});

self.addEventListener('fetch', (e) => {
	if (!e.request.url.match(/^(http|https):\/\//i)) {
		return;
	}

	if (new URL(e.request.url).origin !== location.origin) {
		return;
	}

	if (neverCacheUrls.test(e.request.url)) {
		return;
	}
	if (neverCacheUrls.test(e.request.referrer)) {
		return;
	}

	if (e.request.referrer.match(/^(wp-admin):\/\//i)) {
		return;
	}

	if (e.request.method !== 'GET') {
		e.respondWith(
			fetch(e.request).catch(() => {
				return caches.match(OFFLINE_URL);
			})
		);
		return;
	}

	if (e.request.mode === 'navigate' && navigator.onLine) {
		e.respondWith(
			fetch(e.request).then((response) => {
				return caches.open(CACHE_NAME).then((cache) => {
					cache.put(e.request, response.clone());
					return response;
				});
			})
		);
		return;
	}

	e.respondWith(
		caches
			.match(e.request)
			.then((response) => {
				return (
					response ||
					fetch(e.request).then((response) => {
						return caches.open(CACHE_NAME).then((cache) => {
							cache.put(e.request, response.clone());
							return response;
						});
					})
				);
			})
			.catch(() => {
				return caches.match(OFFLINE_URL);
			})
	);
});
