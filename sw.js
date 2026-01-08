// Service worker DISATTIVATO completamente
// Versione v6 - 2026-01-09

// Questo file è volutamente vuoto per disattivare il vecchio service worker.
// Safari e GitHub Pages ora sono costretti a NON usare più la cache vecchia.

self.addEventListener("install", () => {
    self.skipWaiting();
});

self.addEventListener("activate", event => {
    event.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(keys.map(k => caches.delete(k)));
        })
    );
});
