const CACHE_NAME = 'anagnostis-glafka-v1';
const SHELL = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png', './icon-maskable-512.png'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE_NAME).then((c) => c.addAll(SHELL)));
  self.skipWaiting();
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== self.location.origin) return;
  if (url.pathname.endsWith('/data.enc.json') || e.request.mode === 'navigate' || url.pathname.endsWith('/anagnostis/') || url.pathname.endsWith('/anagnostis/index.html')) {
    e.respondWith(
      fetch(e.request, { cache: 'no-store' })
        .then((r) => {
          if (r.ok) {
            const c = r.clone();
            const key = e.request.mode === 'navigate' ? './index.html' : e.request;
            caches.open(CACHE_NAME).then((ca) => ca.put(key, c));
          }
          return r;
        })
        .catch(() => caches.match(e.request).then((r) => r || caches.match('./index.html')))
    );
    return;
  }
  e.respondWith(
    caches.match(e.request).then((cached) => cached || fetch(e.request).then((r) => {
      if (r.ok) { const c = r.clone(); caches.open(CACHE_NAME).then((ca) => ca.put(e.request, c)); }
      return r;
    }))
  );
});
