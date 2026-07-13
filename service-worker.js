/*
 * Offline support: cache the app shell so the game works with no internet
 * once it has been opened once (over https — e.g. GitHub Pages).
 * Bump CACHE when you change any file so phones pick up the new version.
 */
const CACHE = 'imposter-v4';

// Files the game cannot run without.
const CORE = [
  '.',
  'index.html',
  'app.js',
  'words.js',
  'manifest.webmanifest'
];

// Nice-to-have (icons). Missing ones won't break offline play.
const OPTIONAL = [
  'icons/icon.svg',
  'icons/icon-180.png',
  'icons/icon-192.png',
  'icons/icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    await cache.addAll(CORE);
    await Promise.allSettled(OPTIONAL.map((url) => cache.add(url)));
    self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)));
    await self.clients.claim();
  })());
});

// Network-first: always try the network so edits (e.g. to words.js) show up,
// and keep the cache updated. Fall back to cache only when offline.
self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    try {
      const fresh = await fetch(req);
      if (fresh && fresh.ok && new URL(req.url).origin === self.location.origin) {
        cache.put(req, fresh.clone());
      }
      return fresh;
    } catch (e) {
      const cached = await cache.match(req);
      if (cached) return cached;
      // Last resort: serve the app shell for navigations when offline.
      if (req.mode === 'navigate') {
        const shell = await cache.match('index.html');
        if (shell) return shell;
      }
      throw e;
    }
  })());
});
