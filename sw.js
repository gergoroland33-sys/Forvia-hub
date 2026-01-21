const CACHE_NAME = 'forvia-hub-v1';

// A lista a jelenlegi fájlneveiddel
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
  './Maszk%202026.csv',            // Így a kód kezeli a szóközt a fájlnevedben!
  'https://unpkg.com/html5-qrcode' // Ez kell a 9.html kamerájához
];

// 1. TELEPÍTÉS (Mindent elmentünk)
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Offline fájlok mentése...');
      return cache.addAll(ASSETS);
    })
  );
});

// 2. AKTIVÁLÁS
self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

// 3. MŰKÖDÉS (Először Net, ha nincs, akkor Cache)
self.addEventListener('fetch', (event) => {
  // Csak a webes kérésekkel foglalkozunk
  if (!event.request.url.startsWith('http')) return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Ha van net, frissítjük a tárolt verziót
        if (response && response.status === 200) {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return response;
      })
      .catch(() => {
        // Ha nincs net, adjuk a mentettet
        return caches.match(event.request);
      })
  );
});
