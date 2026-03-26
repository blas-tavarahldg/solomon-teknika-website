/**
 * Serbisuyo Service Worker
 * Implements caching strategies, offline support, and background sync
 *
 * Cache Strategies:
 * - Cache-first for static assets (CSS, JS, fonts, images)
 * - Network-first for API calls
 * - Stale-while-revalidate for HTML
 */

const CACHE_VERSION = 'v1-2026-03-12';
const CACHE_NAMES = {
  static: `${CACHE_VERSION}-static`,
  dynamic: `${CACHE_VERSION}-dynamic`,
  api: `${CACHE_VERSION}-api`,
  offline: `${CACHE_VERSION}-offline`
};

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/performance-loader.js',
  '/critical-css.css',
  'https://cdnjs.cloudflare.com/ajax/libs/react/18.2.0/react.production.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/react-dom/18.2.0/react-dom.production.min.js',
  'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700&display=swap',
  'https://fonts.gstatic.com/s/plusjakartasans/v8/xn71YHs71CRrFiF-DAO0T7ydj-WG0QjI3mG1_KqDhpA.woff2'
];

const OFFLINE_URL = '/offline.html';
const API_CACHE_DURATION = 3600000; // 1 hour

// Install event - precache static assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAMES.static)
      .then(cache => {
        return Promise.all(
          STATIC_ASSETS.map(url => {
            return cache.add(url).catch(error => {
              console.warn(`Failed to cache ${url}:`, error);
              // Continue with next item
            });
          })
        );
      })
      .then(() => {
        self.skipWaiting();
      })
      .catch(error => {
        console.error('Cache installation failed:', error);
      })
  );
});

// Activate event - cleanup old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames
            .filter(cacheName => !Object.values(CACHE_NAMES).includes(cacheName))
            .map(cacheName => {
              console.log('Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            })
        );
      })
      .then(() => {
        self.clients.claim();
      })
  );
});

// Fetch event - routing strategy
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip chrome extensions and non-http(s) protocols
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    return;
  }

  // Route API calls - Network-first
  if (url.pathname.includes('/api/')) {
    event.respondWith(networkFirstStrategy(request));
    return;
  }

  // Route HTML - Stale-while-revalidate
  if (request.headers.get('accept').includes('text/html')) {
    event.respondWith(staleWhileRevalidateStrategy(request));
    return;
  }

  // Route static assets - Cache-first
  if (isStaticAsset(url.pathname)) {
    event.respondWith(cacheFirstStrategy(request));
    return;
  }

  // Default to network-first
  event.respondWith(networkFirstStrategy(request));
});

// Cache-first strategy
function cacheFirstStrategy(request) {
  return caches.match(request)
    .then(response => {
      if (response) {
        return response;
      }

      return fetch(request)
        .then(response => {
          // Don't cache if not successful
          if (!response || response.status !== 200 || response.type === 'error') {
            return response;
          }

          // Clone the response
          const responseToCache = response.clone();

          // Add to cache
          caches.open(CACHE_NAMES.static)
            .then(cache => {
              cache.put(request, responseToCache);
            });

          return response;
        })
        .catch(error => {
          console.warn('Fetch failed:', error);
          return caches.match(request)
            .then(response => response || createOfflineResponse());
        });
    });
}

// Network-first strategy
function networkFirstStrategy(request) {
  return fetch(request)
    .then(response => {
      // Don't cache if not successful
      if (!response || response.status !== 200 || response.type === 'error') {
        return response;
      }

      // Clone the response
      const responseToCache = response.clone();

      // Add to appropriate cache
      const cacheName = request.url.includes('/api/') ? CACHE_NAMES.api : CACHE_NAMES.dynamic;
      caches.open(cacheName)
        .then(cache => {
          cache.put(request, responseToCache);
        })
        .catch(error => {
          console.warn('Cache put failed:', error);
        });

      return response;
    })
    .catch(error => {
      console.warn('Network request failed:', error);

      // Try cache as fallback
      return caches.match(request)
        .then(response => {
          if (response) {
            return response;
          }

          // Return offline page for navigation requests
          if (request.mode === 'navigate') {
            return caches.match(OFFLINE_URL)
              .then(offlineResponse => offlineResponse || createOfflineResponse());
          }

          return createOfflineResponse();
        });
    });
}

// Stale-while-revalidate strategy
function staleWhileRevalidateStrategy(request) {
  return caches.match(request)
    .then(response => {
      // Return cached response immediately
      const fetchPromise = fetch(request)
        .then(networkResponse => {
          if (!networkResponse || networkResponse.status !== 200) {
            return networkResponse;
          }

          // Cache the new response
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAMES.dynamic)
            .then(cache => {
              cache.put(request, responseToCache);
            });

          return networkResponse;
        })
        .catch(error => {
          console.warn('Revalidation fetch failed:', error);
        });

      // Return cached version or wait for network
      return response || fetchPromise;
    });
}

// Check if URL is a static asset
function isStaticAsset(pathname) {
  const staticExtensions = [
    '.js', '.css', '.woff', '.woff2', '.ttf', '.eot',
    '.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp',
    '.ico', '.json'
  ];

  return staticExtensions.some(ext => pathname.endsWith(ext));
}

// Create offline response
function createOfflineResponse() {
  return new Response(
    `<!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Offline - Serbisuyo</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          font-family: 'Plus Jakarta Sans', sans-serif;
          background: linear-gradient(135deg, #FFF8F0 0%, #FFE5D0 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          padding: 20px;
        }
        .offline-container {
          text-align: center;
          background: white;
          padding: 60px 40px;
          border-radius: 16px;
          box-shadow: 0 10px 40px rgba(255, 107, 53, 0.1);
          max-width: 500px;
        }
        h1 {
          color: #FF6B35;
          font-size: 32px;
          margin-bottom: 16px;
        }
        p {
          color: #666;
          font-size: 16px;
          margin-bottom: 24px;
          line-height: 1.6;
        }
        .icon {
          font-size: 64px;
          margin-bottom: 24px;
        }
        button {
          background: #FF6B35;
          color: white;
          border: none;
          padding: 12px 32px;
          font-size: 16px;
          border-radius: 8px;
          cursor: pointer;
          transition: background 0.3s ease;
        }
        button:hover {
          background: #E55A24;
        }
      </style>
    </head>
    <body>
      <div class="offline-container">
        <div class="icon">📱</div>
        <h1>You're Offline</h1>
        <p>It looks like you've lost your internet connection. Some features may not be available.</p>
        <p>We'll automatically reconnect when your connection is restored.</p>
        <button onclick="location.reload()">Try Again</button>
      </div>
    </body>
    </html>`,
    {
      status: 503,
      statusText: 'Service Unavailable',
      headers: {
        'Content-Type': 'text/html; charset=utf-8'
      }
    }
  );
}

// Message event - handle communication from clients
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data && event.data.type === 'CLEAR_CACHE') {
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => caches.delete(cacheName))
        );
      })
      .then(() => {
        event.ports[0].postMessage({ success: true });
      });
  }
});

// Background sync for form submissions
self.addEventListener('sync', event => {
  if (event.tag === 'sync-forms') {
    event.waitUntil(syncPendingForms());
  }
});

// Sync pending forms on reconnection
function syncPendingForms() {
  return caches.open(CACHE_NAMES.api)
    .then(cache => {
      // Implement form sync logic here
      // For now, this is a placeholder
      console.log('Background sync: checking for pending forms');
    })
    .catch(error => {
      console.error('Background sync failed:', error);
    });
}

// Push event - handle push notifications
self.addEventListener('push', event => {
  if (!event.data) return;

  const data = event.data.json();
  const options = {
    body: data.body || 'Serbisuyo notification',
    icon: '/images/icon-192x192.png',
    badge: '/images/badge-72x72.png',
    tag: 'serbisuyo-notification',
    requireInteraction: false,
    actions: [
      {
        action: 'open',
        title: 'Open'
      },
      {
        action: 'close',
        title: 'Close'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'Serbisuyo', options)
  );
});

// Notification click event
self.addEventListener('notificationclick', event => {
  event.notification.close();

  if (event.action === 'open' || !event.action) {
    event.waitUntil(
      clients.matchAll({ type: 'window' })
        .then(clientList => {
          // Check if app is already open
          for (let i = 0; i < clientList.length; i++) {
            const client = clientList[i];
            if (client.url === '/' && 'focus' in client) {
              return client.focus();
            }
          }
          // Open new window if not already open
          if (clients.openWindow) {
            return clients.openWindow('/');
          }
        })
    );
  }
});
