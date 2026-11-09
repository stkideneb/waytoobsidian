// Bump the version whenever app files change so old caches get cleaned up.
const CACHE = "waytoobsidian-v35";

// Alles, was die App zum Starten braucht. Neue CSS-/JS-Dateien hier eintragen,
// sonst fehlen sie offline.
const FILES = [
  "./",
  "./index.html",
  "./css/app.css",
  "./js/exercises-data.js",
  "./js/storage.js",
  "./js/helpers.js",
  "./js/sheet.js",
  "./js/stats.js",
  "./js/navigation.js",
  "./js/home.js",
  "./js/routines.js",
  "./js/workout.js",
  "./js/history.js",
  "./js/progress.js",
  "./js/library.js",
  "./js/backup.js",
  "./js/app.js",
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
  const url = new URL(req.url);
  if (req.method !== "GET" || url.origin !== self.location.origin) return;
  // Online-Backup immer direkt ans Netz, nie aus dem Cache
  if (url.pathname.startsWith("/api/")) return;

  // Pages, CSS and JS: network first, so new versions arrive together as soon as
  // you're online (HTML and scripts never mix versions); cache when offline.
  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req)
        .then(res => putInCache(req, res))
        .catch(() => caches.match(req, { ignoreSearch: true })
          .then(cached => cached || caches.match("./index.html")))
    );
    return;
  }

  if (/\.(css|js)$/.test(url.pathname)) {
    event.respondWith(
      fetch(req)
        .then(res => putInCache(req, res))
        .catch(() => caches.match(req, { ignoreSearch: true }))
    );
    return;
  }

  // Icons etc.: serve from cache instantly and refresh it in the background.
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
