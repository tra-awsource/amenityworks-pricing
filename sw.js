/* AmenityWorks Pricing — offline cache for local/network use */
const CACHE = "aw-pricing-v6";
const PRECACHE = [
  "./",
  "./index.html",
  "./hub.css",
  "./manifest.webmanifest",
  "./access-config.js",
  "./access-gate.js",
  "./access-gate.css",
  "./set-password.html",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./junk/index.html",
  "./junk/styles.css",
  "./junk/app.js",
  "./demo/index.html",
  "./demo/styles.css",
  "./demo/app.js",
  "./pressure/index.html",
  "./pressure/styles.css",
  "./pressure/app.js",
  "./window/index.html",
  "./window/styles.css",
  "./window/app.js",
  "./mobile-shared.css",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(PRECACHE)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  event.respondWith(
    caches.match(event.request).then((cached) => {
      const fetched = fetch(event.request)
        .then((res) => {
          if (res && res.ok && res.type === "basic") {
            const clone = res.clone();
            caches.open(CACHE).then((cache) => cache.put(event.request, clone));
          }
          return res;
        })
        .catch(() => cached);
      return cached || fetched;
    })
  );
});
