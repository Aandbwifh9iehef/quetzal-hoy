const CACHE = 'quetzal-hoy-v25';
const PRECACHE = [
  '/',
  '/styles.css',
  '/icon.svg',
  '/fonts/figtree-latin.woff2',
  '/guilloche.svg',
  '/sin-conexion',
  '/app.js',
  '/render.js',
  '/manifest.webmanifest'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(PRECACHE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;

  // API: red primero, si falla usa lo último guardado
  if (url.pathname.startsWith('/api/')) {
    e.respondWith(
      fetch(req)
        .then(res => {
          if (res.ok) caches.open(CACHE).then(c => c.put(req, res.clone()));
          return res;
        })
        .catch(() => caches.match(req))
    );
    return;
  }

  // Páginas: red primero (sin usar copias guardadas por el navegador), caché de respaldo,
  // página sin conexión al final
  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req.url, { cache: 'no-cache', credentials: 'same-origin', redirect: 'manual' })
        .then(res => {
          if (res.ok) caches.open(CACHE).then(c => c.put(req, res.clone()));
          return res;
        })
        .catch(() => caches.match(req).then(r => r || caches.match('/sin-conexion')))
    );
    return;
  }

  // Código y estilos: red primero y caché de respaldo. Si se sirvieran de la caché, una página nueva
  // podría correr con código viejo (pasó el 22 nov 2026: las pestañas dejaron de cambiar).
  if (/\.(js|css)$/.test(url.pathname)) {
    e.respondWith(
      fetch(req, { cache: 'no-cache' })
        .then(res => {
          if (res.ok) caches.open(CACHE).then(c => c.put(req, res.clone()));
          return res;
        })
        .catch(() => caches.match(req))
    );
    return;
  }

  // Fuente, íconos e imágenes: caché primero
  e.respondWith(
    caches.match(req).then(hit => hit || fetch(req).then(res => {
      if (res.ok) caches.open(CACHE).then(c => c.put(req, res.clone()));
      return res;
    }))
  );
});
