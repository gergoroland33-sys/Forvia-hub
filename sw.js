const CACHE_NAME = 'forvia-safe-v2'; // Átírtam v2-re, hogy frissítsen!

// ITT A BIZTONSÁGOS LISTA
// Kivettem a külső linket, mert az okozhatja a hibát!
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
  './Maszk%202026.csv' // Maradjon így, a %20 jelzi a szóközt!
];

// 1. TELEPÍTÉS (Install)
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Fájlok mentése...');
        return cache.addAll(ASSETS);
      })
      .catch((err) => {
        // Ha hiba van, kiírjuk a konzolra, de nem omlasztjuk össze az egészet
        console.error('Hiba a telepítésnél! Valamelyik fájl hiányzik:', err);
      })
  );
});

// 2. AKTIVÁLÁS (Activate)
// Töröljük a régi, hibás cache-t
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(keyList.map((key) => {
        if (key !== CACHE_NAME) {
          return caches.delete(key);
        }
      }));
    }).then(() => clients.claim())
  );
});

// 3. MŰKÖDÉS (Fetch)
self.addEventListener('fetch', (event) => {
  // Csak a http/https kérésekkel foglalkozunk
  if (!event.request.url.startsWith('http')) return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // 1. HA VAN NET:
        // Ha sikerült letölteni, elmentjük a jövőre
        if (response && response.status === 200) {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return response;
      })
      .catch(() => {
        // 2. HA NINCS NET:
        // Próbáljuk meg a cache-ből
        return caches.match(event.request)
          .then((response) => {
            if (response) {
              return response;
            }
            // Ha nincs meg a fájl offline, és net sincs, nem tudunk mit tenni.
            // (Itt lehetne egy "Nincs internet" hibaoldalt mutatni)
          });
      })
  );
});
