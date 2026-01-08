// Service worker DISATTIVATO completamente
// Versione v6 - 2026-01-09

// Questo file serve solo a eliminare ogni cache esistente
// e disattivare qualsiasi service worker precedente.

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
