const CACHE_NAME = 'uuidgen-v0.1.0';
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

self.addEventListener('install', (e) => {
  console.log('[Service Worker] Install');
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Caching all: app shell and content');
      return cache.addAll(contentToCache);
    })
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(keyList.map((key) => {
        if(key !== CACHE_NAME) {
          return caches.delete(key);
        }
      }));
    })
  );
});

self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((r) => {
      console.log('[Service Worker] Fetching resource: '+e.request.url);
      return r || fetch(e.request).then((response) => {
        return caches.open(CACHE_NAME).then((cache) => {
          console.log('[Service Worker] Caching new resource: '+e.request.url);
          cache.put(e.request, response.clone());
          return response;
        });
      });
    })
  );
});
