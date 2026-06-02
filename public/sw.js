/**
 * Salaf Media & Assets Caching Service Worker
 * 
 * Implements a high-performance Cache-First strategy for images and media files.
 * This guarantees that once product images are loaded (or preloaded on hover),
 * they display instantaneously even on highly unstable or slow networks.
 */

const CACHE_NAME = 'salaf-media-cache-v2';
const MAX_MEDIA_AGE_MS = 3 * 24 * 60 * 60 * 1000;
const MAX_MEDIA_ITEMS = 120;

function isExpired(response) {
  const cachedAt = Number(response.headers.get('x-salaf-cached-at') || 0);
  return !cachedAt || Date.now() - cachedAt > MAX_MEDIA_AGE_MS;
}

async function trimCache(cache) {
  const keys = await cache.keys();
  if (keys.length <= MAX_MEDIA_ITEMS) return;

  await Promise.all(keys.slice(0, keys.length - MAX_MEDIA_ITEMS).map((request) => cache.delete(request)));
}

async function cacheableResponse(networkResponse) {
  if (!networkResponse || networkResponse.status !== 200 || networkResponse.type === 'opaque') {
    return networkResponse;
  }

  const headers = new Headers(networkResponse.headers);
  headers.set('x-salaf-cached-at', Date.now().toString());

  return new Response(await networkResponse.clone().blob(), {
    status: networkResponse.status,
    statusText: networkResponse.statusText,
    headers,
  });
}

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

  // Target image/media files based on type, directory, extension, or Next/Vercel optimizer path
  const isNextOptimizedImage = url.pathname === '/_next/image';
  const isImageRequest =
    isNextOptimizedImage ||
    request.destination === 'image' ||
    url.pathname.match(/\.(jpg|jpeg|png|gif|webp|svg|ico|tiff|bmp)$/i) ||
    url.pathname.includes('/uploads/') ||
    url.pathname.includes('/images/');

  // Strictly avoid intercepting Next.js development bundles, API calls, and HTML documents
  const isExcluded =
    (url.pathname.startsWith('/_next/') && !isNextOptimizedImage) ||
    url.pathname.startsWith('/api/') ||
    url.pathname.startsWith('/admin/') ||
    request.headers.get('accept')?.includes('text/html');

  if (isImageRequest && !isExcluded) {
    event.respondWith(
      caches.open(CACHE_NAME).then(async (cache) => {
        const cachedResponse = await cache.match(request);
        if (cachedResponse && !isExpired(cachedResponse)) {
          return cachedResponse;
        }

        try {
          const networkResponse = await fetch(request);
          const responseToCache = await cacheableResponse(networkResponse);

          if (responseToCache && responseToCache.status === 200 && responseToCache.type !== 'opaque') {
            cache.put(request, responseToCache.clone()).then(() => trimCache(cache));
          }

          return networkResponse;
        } catch {
          return cachedResponse;
        }
      })
    );
  }
});
