self.addEventListener("install", event => {
    event.waitUntil(
        caches.open("chess-cache").then(cache => {
            return cache.addAll([
                "/",
                "/index.html",
                "/style.css",
                "/app.js",
                "/manifest.json",
                "/pieces/bR.png",
                "/pieces/bN.png",
                "/pieces/bB.png",
                "/pieces/bQ.png",
                "/pieces/bK.png",
                "/pieces/bP.png",
                "/pieces/wR.png",
                "/pieces/wN.png",
                "/pieces/wB.png",
                "/pieces/wQ.png",
                "/pieces/wK.png",
                "/pieces/wP.png"
            ]);
        })
    );
});

self.addEventListener("fetch", event => {
    event.respondWith(
        caches.match(event.request).then(response => {
            return response || fetch(event.request);
        })
    );

});
