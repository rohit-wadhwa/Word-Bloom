/* sw.js — service worker.
 * Strategy:
 *   - App shell (HTML, JS, CSS, manifest): NETWORK-FIRST, so deploys are picked
 *     up immediately when online; cache is only a fallback for offline.
 *   - Static assets (icons, word list): CACHE-FIRST for speed (they rarely change).
 * Bump CACHE on releases to purge old entries.
 */
const CACHE = 'wordbloom-v6';
const ASSETS = [
  './', 'index.html', 'css/style.css',
  'js/state.js', 'js/audio.js', 'js/generator.js', 'js/board.js',
  'js/wheel.js', 'js/game.js', 'js/main.js',
  'data/words.txt', 'manifest.webmanifest',
  'assets/icon-192.png', 'assets/icon-512.png', 'assets/icon.svg',
  'assets/apple-touch-icon.png', 'assets/favicon.png',
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

function putIfOk(req, resp) {
  if (resp && resp.ok && resp.type === 'basic') {
    const copy = resp.clone();
    caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {});
  }
  return resp;
}

function networkFirst(req) {
  return fetch(req)
    .then((resp) => putIfOk(req, resp))
    .catch(() => caches.match(req).then((cached) =>
      cached || (req.mode === 'navigate' ? caches.match('index.html') : undefined)));
}

function cacheFirst(req) {
  return caches.match(req).then((cached) =>
    cached || fetch(req).then((resp) => putIfOk(req, resp)));
}

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  const isShell = e.request.mode === 'navigate'
    || /\.(?:js|css|webmanifest)$/.test(url.pathname)
    || url.pathname.endsWith('/index.html');
  e.respondWith(isShell ? networkFirst(e.request) : cacheFirst(e.request));
});
