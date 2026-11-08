// Bump the version whenever app files change so old caches get cleaned up.
const CACHE = "waytoobsidian-v15";

const FILES = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icon.svg?v=6",
  "./apple-touch-icon.png",
  "./icon-192.png",
  "./icon-512.png",
  "./favicon.ico",
  "./favicon-32.png"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE)
      .then(cache => cache.addAll(FILES))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

function putInCache(request, response) {
  if (response.ok) {
    const copy = response.clone();
    caches.open(CACHE).then(cache => cache.put(request, copy));
  }
  return response;
}

self.addEventListener("fetch", event => {
  const req = event.request;
  if (req.method !== "GET" || new URL(req.url).origin !== self.location.origin) return;

  // Pages: network first, so new versions arrive as soon as you're online; cache when offline.
  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req)
        .then(res => putInCache(req, res))
        .catch(() => caches.match(req, { ignoreSearch: true })
          .then(cached => cached || caches.match("./index.html")))
    );
    return;
  }

  // Other files: serve from cache instantly and refresh it in the background.
  event.respondWith(
    caches.match(req).then(cached => {
      const network = fetch(req).then(res => putInCache(req, res));
      if (cached) {
        event.waitUntil(network.catch(() => {}));
        return cached;
      }
      return network;
    })
  );
});
