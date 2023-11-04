
var staticCacheName = "pwa";
var URLS = [    
  `/`,
  `/index.html`
]
 
self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(staticCacheName).then(function (cache) {
      return cache.addAll(URLS)
    })
  )
})
 
self.addEventListener('fetch', function (e) {
  e.respondWith(
    caches.match(e.request).then(function (request) {
      if (request) { 
        return request
      } else {       
        return fetch(e.request)
      }
    })
  )
})