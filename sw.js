// sw.js — Versi yang benar untuk GitHub Pages dengan subfolder
const CACHE_NAME = 'absensi-siswa-v1';
const urlsToCache = [
  '/absensi-siswa/',
  '/absensi-siswa/index.html',
  '/absensi-siswa/manifest.json',
  '/absensi-siswa/icons/icon-192x192.png',
  '/absensi-siswa/icons/icon-512x512.png',
  '/absensi-siswa/app-complete.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache).catch((err) => {
          console.warn('Gagal meng-cache beberapa file:', err);
          // Lanjutkan install meski ada error minor
        });
      })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        return response || fetch(event.request);
      })
  );
});
