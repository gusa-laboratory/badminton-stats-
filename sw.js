/* バドミントン スタッツ記録 Service Worker
   ★アプリ（index.html / store.js など）を更新したら、下の CACHE のバージョン番号を
     必ず上げること（v1→v2…）。上げ忘れると利用者端末に古い版がキャッシュされたまま残る。 */
const CACHE = 'bdmt-stats-v1';

const ASSETS = [
  './', './index.html',
  './store.js', './firebase-config.js', './firebase-boot.js',
  './manifest.webmanifest',
  './icon-192.png', './icon-512.png', './icon-512-maskable.png', './apple-touch-icon.png'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  // 同一オリジンのみ対象。Firebase/gstatic などの外部はキャッシュせずネットワークへ。
  if (url.origin !== self.location.origin) return;
  e.respondWith(
    caches.match(req, { ignoreSearch: true }).then(hit => {
      if (hit) return hit;
      return fetch(req).then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(req, copy)).catch(() => {});
        return res;
      }).catch(() => caches.match('./index.html'));
    })
  );
});
