/* Service worker de la lanzadora: guarda la página, el manifiesto y los íconos para que
   el ícono abra aunque no haya conexión y muestre el aviso. La app (Apps Script) va siempre por la red. */
const VERSION = 'alvaro-lanzadora-v2';
const CASCARA = ['./', './index.html', './manifest.webmanifest', './icons/icono-192.png', './icons/icono-512.png',
  './icons/icono-maskable-192.png', './icons/icono-maskable-512.png', './icons/favicon.png', './icons/apple-touch-icon.png'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(CASCARA)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== VERSION).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  if (req.mode === 'navigate') {
    e.respondWith(fetch(req)
      .then((r) => { const c = r.clone(); caches.open(VERSION).then((ca) => ca.put('./index.html', c)); return r; })
      .catch(() => caches.match('./index.html')));
    return;
  }
  e.respondWith(caches.match(req).then((r) => r || fetch(req)));
});
