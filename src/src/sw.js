import { set, get } from "idb-keyval";

const STATIC_DATA = [
  /*
  "index.html", 
  "/", 
  "script.js", 
  "vue.global.js"
  */
];

self.addEventListener("install", function (e) {
  self.skipWaiting();
  e.waitUntil(
    caches.open("cache_v1").then(function (cache) {
      return cache.addAll(STATIC_DATA);
    }),
  );
});

//self.addEventListener('activate', (event) => {
//  clients.claim();
//});

self.addEventListener("fetch", (event) => {
  event.respondWith(handleRequest(event));
});

async function handleRequest(event) {
  const url = new URL(event.request.url);
  const src = await get(`webenv/debug/index`);

  if (url.pathname === "/debug") {
    const html = src;
    return new Response(html, {
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  }

  let response = await caches.match(event.request);
  return response || fetch(event.request);
}
