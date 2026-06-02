/**
 * Salaf Media & Assets Caching Service Worker
 * 
 * Implements a high-performance Cache-First strategy for images and media files.
 * This guarantees that once product images are loaded (or preloaded on hover),
 * they display instantaneously even on highly unstable or slow networks.
 */

const CACHE_NAME = 'salaf-media-cache-v1';

self.addEventListener('install', (event) => {
  // Activate worker immediately
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  // Clean up any outdated caches
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;

  // We only cache GET requests
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // Target image/media files based on type, directory, or extension
  const isImageRequest =
    request.destination === 'image' ||
    url.pathname.match(/\.(jpg|jpeg|png|gif|webp|svg|ico|tiff|bmp)$/i) ||
    url.pathname.includes('/uploads/') ||
    url.pathname.includes('/images/');

  // Strictly avoid intercepting Next.js development bundles, API calls, and HTML documents
  const isExcluded =
    url.pathname.startsWith('/_next/') ||
    url.pathname.startsWith('/api/') ||
    url.pathname.startsWith('/admin/') ||
    request.headers.get('accept')?.includes('text/html');

  if (isImageRequest && !isExcluded) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }

        // Cache miss: fetch from network, cache a copy, and return
        return fetch(request)
          .then((networkResponse) => {
            // Only cache valid standard responses (status 200)
            if (!networkResponse || networkResponse.status !== 200) {
              return networkResponse;
            }

            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseToCache);
            });

            return networkResponse;
          })
          .catch(() => {
            // Quietly fail if offline and not in cache
          });
      })
    );
  }
});
