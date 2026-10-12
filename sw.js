/* MADEBE Integral · service worker. La app es un único HTML: se guarda en caché para abrir sin internet.
   Los datos NO pasan por acá: viven en IndexedDB del dispositivo. */
const VERSION = 'v0.2.1';
const CACHE = 'madebe-' + VERSION;
const ARCHIVOS = ['./', './index.html', './manifest.webmanifest', './icons/icon-192.png', './icons/icon-512.png', './icons/apple-touch-icon.png', './icons/maskable-512.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(ARCHIVOS))); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith('madebe-') && k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('message', e => { if (e.data === 'actualizar') self.skipWaiting(); });
self.addEventListener('fetch', e => {
  const r = e.request, u = new URL(r.url); if (r.method !== 'GET' || u.origin !== location.origin) return;
  if (u.pathname.includes('/datos/')) return; // datos de alumnos: siempre de la red (los cifra el profesor y cambian)
  if (r.mode === 'navigate') { e.respondWith(caches.match('./index.html').then(m => m || fetch(r))); return; }
  e.respondWith(caches.match(r).then(m => m || fetch(r).then(resp => { if (resp.ok) { const cp = resp.clone(); caches.open(CACHE).then(c => c.put(r, cp)); } return resp; })));
});
