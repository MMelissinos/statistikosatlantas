const CACHE_NAME = 'xartis-atlanta-v4';
const CORE_ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest?v=2',
  './icon.svg?v=2',
  './icon-192.png?v=2',
  './icon-512.png?v=2',
  './icon-maskable-512.png?v=2',
  './vendor/d3.min.js',
  './vendor/topojson-client.min.js',
  './fonts/GFSDidot-Regular.ttf',
  './fonts/Commissioner-GrLat.woff2',
  './data/manifest.json',
  './data/geo/greece.topo.json',
  './data/geo/regions.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(CORE_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  if (event.request.method !== 'GET' || url.origin !== self.location.origin) {
    return;
  }

  // Network-first για index.html και data/manifest.json ώστε νέοι δείκτες να φαίνονται αμέσως όταν υπάρχει δίκτυο
  if (
    event.request.mode === 'navigate' ||
    url.pathname.endsWith('/xartis/') ||
    url.pathname.endsWith('/xartis/index.html') ||
    url.pathname.endsWith('/xartis/data/manifest.json')
  ) {
    event.respondWith(
      fetch(event.request, { cache: 'no-store' })
        .then((resp) => {
          if (resp.ok) {
            const copy = resp.clone();
            const key = event.request.mode === 'navigate' ? './index.html' : event.request;
            caches.open(CACHE_NAME).then((c) => c.put(key, copy));
          }
          return resp;
        })
        .catch(() =>
          caches.match(event.request).then((r) => r || caches.match('./index.html'))
        )
    );
    return;
  }

  // Stale-while-revalidate για όλα τα δεδομένα δεικτών (JSON), vendor, fonts και εικονίδια
  event.respondWith(
    caches.match(event.request).then((cached) => {
      const networkFetch = fetch(event.request)
        .then((resp) => {
          if (resp.ok) {
            const copy = resp.clone();
            caches.open(CACHE_NAME).then((c) => c.put(event.request, copy));
          }
          return resp;
        })
        .catch(() => cached);
      return cached || networkFetch;
    })
  );
});
