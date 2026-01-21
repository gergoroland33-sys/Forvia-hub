const CACHE_NAME = 'forvia-hub-auto-v1';
const ASSETS = [
  './',
  './index.html',
  './icon.png',
  './1.html',
  './2.html',
  './3.html',
  './4.html',
  './5.html',
  './6.html',
  './7.html',
  './8.html',
  './9.html',
  './bank.csv',
  './muszakok.csv',
  './ultetes.csv',
  './Maszk 2026.csv'
];

// Telepítéskor elmentjük, ami biztosan kell
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
});

// Aktiváláskor átvesszük az irányítást
self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

// A FŐ VARÁZSLAT: Hálózat, majd Cache (Network First)
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // 1. HA VAN NET:
        // Ha sikeres a letöltés és érvényes a válasz...
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }

        // ...akkor csinálunk egy másolatot a Cache-be a jövőre nézve...
        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });

        // ...és odaadjuk a friss adatot a felhasználónak.
        return response;
      })
      .catch(() => {
        // 2. HA NINCS NET (Offline):
        // Akkor elővesszük a legutóbb elmentett verziót.
        return caches.match(event.request);
      })
  );
});
